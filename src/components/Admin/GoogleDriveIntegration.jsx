import React, { useCallback, useEffect, useRef, useState } from "react";
import googleDriveAdminService from "../../services/googleDriveAdminService";

const SOURCE_LABELS = {
  database: { label: "Conectado vía panel", tone: "ok" },
  env: { label: "Usando variable de entorno", tone: "warn" },
  service_account: { label: "Service account (sin OAuth)", tone: "warn" },
  none: { label: "No configurado", tone: "err" },
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const errorMessage = (err) =>
  err?.message ||
  err?.response?.data?.message ||
  err?.data?.message ||
  "Error desconocido";

const EXPECTED_OPENER_ORIGIN = (() => {
  try {
    const raw = import.meta.env.VITE_API_BASE_URL;
    return raw ? new URL(raw, window.location.origin).origin : null;
  } catch {
    return null;
  }
})();

function GoogleDriveIntegration() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [manualToken, setManualToken] = useState("");
  const [isSavingManual, setIsSavingManual] = useState(false);

  const popupRef = useRef(null);
  const popupWatcherRef = useRef(null);

  const loadStatus = useCallback(async ({ verify = false } = {}) => {
    if (verify) {
      setIsVerifying(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await googleDriveAdminService.getStatus({ verify });
      setStatus(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsLoading(false);
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (EXPECTED_OPENER_ORIGIN && event.origin !== EXPECTED_OPENER_ORIGIN) {
        return;
      }
      if (!event?.data || event.data.source !== "google-drive-oauth") {
        return;
      }
      const { status: result, payload } = event.data;
      if (result === "success") {
        setFeedback({
          tone: "ok",
          text: payload?.verification?.email
            ? `Conexión exitosa con ${payload.verification.email}.`
            : "Conexión exitosa.",
        });
      } else if (result === "warning") {
        setFeedback({
          tone: "warn",
          text: `Token guardado, pero la verificación falló: ${
            payload?.verification?.error || "error desconocido"
          }.`,
        });
      } else {
        setFeedback({
          tone: "err",
          text: `No se pudo conectar: ${payload?.detail || payload?.reason || "error"}.`,
        });
      }
      setIsConnecting(false);
      loadStatus();
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [loadStatus]);

  useEffect(() => {
    return () => {
      if (popupWatcherRef.current) {
        window.clearInterval(popupWatcherRef.current);
        popupWatcherRef.current = null;
      }
      if (popupRef.current && !popupRef.current.closed) {
        try {
          popupRef.current.close();
        } catch {
          /* noop */
        }
      }
      popupRef.current = null;
    };
  }, []);

  const startOAuthPopup = async () => {
    setError(null);
    setFeedback(null);
    setIsConnecting(true);
    try {
      const { authUrl } = await googleDriveAdminService.requestAuthUrl();
      const width = 520;
      const height = 640;
      const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
      const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
      const popup = window.open(
        authUrl,
        "google-drive-oauth",
        `width=${width},height=${height},left=${left},top=${top}`
      );
      if (!popup) {
        setIsConnecting(false);
        setError(
          "El navegador bloqueó la ventana emergente. Permite popups para esta página y vuelve a intentarlo."
        );
        return;
      }
      popupRef.current = popup;

      if (popupWatcherRef.current) {
        window.clearInterval(popupWatcherRef.current);
      }
      popupWatcherRef.current = window.setInterval(() => {
        if (popupRef.current?.closed) {
          window.clearInterval(popupWatcherRef.current);
          popupWatcherRef.current = null;
          setIsConnecting(false);
        }
      }, 800);
    } catch (err) {
      setIsConnecting(false);
      setError(errorMessage(err));
    }
  };

  const submitManualToken = async (event) => {
    event.preventDefault();
    if (!manualToken.trim()) {
      setError("Pega un refresh token antes de guardar.");
      return;
    }
    setIsSavingManual(true);
    setError(null);
    setFeedback(null);
    try {
      const data = await googleDriveAdminService.saveManualToken(manualToken.trim());
      setFeedback({
        tone: data?.verification?.ok ? "ok" : "warn",
        text: data?.message || "Token guardado.",
      });
      setManualToken("");
      await loadStatus();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSavingManual(false);
    }
  };

  const removeCredential = async () => {
    if (!window.confirm("¿Eliminar la credencial guardada en la base de datos?")) {
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      await googleDriveAdminService.clearCredential();
      setFeedback({ tone: "warn", text: "Credencial eliminada." });
      await loadStatus();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (isLoading && !status) {
    return (
      <div className="text-center text-[var(--text-muted)]">
        Cargando estado de Google Drive...
      </div>
    );
  }

  const sourceMeta = SOURCE_LABELS[status?.source] || SOURCE_LABELS.none;
  const verification = status?.verification || null;
  const credential = status?.credential || null;
  const oauthAvailable = status?.hasOAuthAppCredentials;

  return (
    <div>
      <h2 className="text-2xl text-[var(--text-main)]">Integración con Google Drive</h2>
      <p className="mt-2 mb-6 text-sm text-[var(--text-muted)]">
        El backend usa un refresh token para subir archivos a Drive. Si los uploads dejan de
        funcionar, reconecta la cuenta desde aquí — no necesitas tocar variables de entorno ni
        reiniciar el servidor.
      </p>

      {error && <div className="status-error mb-4">{error}</div>}
      {feedback && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            feedback.tone === "ok"
              ? "bg-green-50 text-green-800 border border-green-200"
              : feedback.tone === "warn"
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
            Estado actual
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                sourceMeta.tone === "ok"
                  ? "bg-green-500"
                  : sourceMeta.tone === "warn"
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm font-semibold text-[var(--text-main)]">
              {sourceMeta.label}
            </span>
          </div>

          <dl className="mt-4 space-y-2 text-sm text-[var(--text-muted)]">
            <div className="flex justify-between gap-4">
              <dt>Última actualización</dt>
              <dd className="text-[var(--text-main)]">{formatDate(credential?.updatedAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Última verificación</dt>
              <dd className="text-[var(--text-main)]">{formatDate(credential?.lastVerifiedAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Cuenta Drive</dt>
              <dd className="text-[var(--text-main)]">
                {verification?.ok
                  ? verification.email || verification.displayName || "verificada"
                  : credential?.lastVerifiedOk
                  ? "verificada en último chequeo"
                  : "—"}
              </dd>
            </div>
          </dl>

          {credential?.lastVerifiedError && (
            <p className="mt-3 text-xs text-red-700">
              Último error: {credential.lastVerifiedError}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadStatus({ verify: true })}
              disabled={isVerifying}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              {isVerifying ? "Probando..." : "Probar conexión"}
            </button>
            {credential && (
              <button
                type="button"
                onClick={removeCredential}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Eliminar credencial
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--line-soft)] bg-white/70 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
            Conectar cuenta
          </p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Autoriza la cuenta de Google que será dueña de los archivos. Se abre una ventana
            emergente; al terminar, esta tarjeta se actualiza automáticamente.
          </p>
          <button
            type="button"
            onClick={startOAuthPopup}
            disabled={!oauthAvailable || isConnecting}
            className="mt-4 px-4 py-2 bg-[var(--brand)] text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {isConnecting
              ? "Esperando autorización..."
              : credential
              ? "Reconectar con Google"
              : "Conectar con Google"}
          </button>
          {!oauthAvailable && (
            <p className="mt-3 text-xs text-amber-700">
              Faltan credenciales de la app OAuth (GOOGLE_OAUTH_CLIENT_ID, CLIENT_SECRET,
              REDIRECT_URI) en el servidor.
            </p>
          )}
        </div>
      </div>

      <details className="mt-6 rounded-[20px] border border-[var(--line-soft)] bg-white/70 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--text-main)]">
          Pegar refresh token manualmente (alternativa)
        </summary>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Si ya tienes un refresh token (por ejemplo del flujo anterior), pégalo aquí y se
          guardará en la base de datos.
        </p>
        <form onSubmit={submitManualToken} className="mt-3 space-y-3">
          <textarea
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            rows={3}
            placeholder="1//0g..."
            className="w-full rounded border border-gray-300 p-2 font-mono text-xs"
          />
          <button
            type="submit"
            disabled={isSavingManual}
            className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {isSavingManual ? "Guardando..." : "Guardar token"}
          </button>
        </form>
      </details>
    </div>
  );
}

export default GoogleDriveIntegration;
