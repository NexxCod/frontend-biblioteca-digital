import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";
import AuthSplitLayout from "../components/AuthSplitLayout";

function ModernLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoggedIn, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  const sessionExpired = searchParams.get("expired") === "1";
  const redirectTarget = useMemo(() => {
    const raw = searchParams.get("redirect");
    if (!raw) return "/";
    return raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  }, [searchParams]);

  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isLoggedIn, navigate, user, redirectTarget]);

  const handleResendVerification = async () => {
    if (!email) {
      setResendError("Ingresa tu correo para reenviar la verificación.");
      return;
    }

    setIsResending(true);
    setResendError("");
    setResendMessage("");

    try {
      const response = await authService.resendVerificationEmail(email);
      setResendMessage(
        response.message || "Se ha enviado un nuevo correo de verificación."
      );
      setShowResendVerification(false);
    } catch (err) {
      setResendError(
        err.message || "No se pudo reenviar el correo de verificación."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResendError("");
    setResendMessage("");
    setShowResendVerification(false);

    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        navigate(redirectTarget, { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.message || "Error al iniciar sesión. Verifica tus credenciales.";

      setError(errorMessage);

      if (
        errorMessage.toLowerCase().includes("verifica tu correo") ||
        errorMessage.toLowerCase().includes("email no verificado") ||
        err.response?.data?.needsVerification === true
      ) {
        setShowResendVerification(true);
      }
    }
  };

  if (isLoading && !isLoggedIn) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6">Cargando acceso...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <AuthSplitLayout
      badge="Acceso"
      title="Iniciar sesión"
      description="Accede con tu cuenta."
      heroTitle=""
      heroDescription=""
      heroPoints={[]}
      hideHero
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            className="app-input"
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            className="app-input"
            required
          />
        </div>

        {sessionExpired && !error && (
          <div className="status-warning">
            Tu sesión expiró. Vuelve a iniciar sesión para continuar.
          </div>
        )}

        {error && <div className="status-error">{error}</div>}

        {showResendVerification && !resendMessage && (
          <div className="status-warning space-y-3">
            <p>Tu correo aún no está verificado.</p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className={`app-button-secondary w-full ${isResending ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {isResending ? "Reenviando..." : "Reenviar verificación"}
            </button>
            {resendError && <p className="text-sm text-[#8b4f2e]">{resendError}</p>}
          </div>
        )}

        {resendMessage && <div className="status-success">{resendMessage}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={`app-button-primary w-full ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {isLoading ? "Ingresando..." : "Entrar a la biblioteca"}
        </button>

        <div className="flex items-center justify-between gap-3 pt-1 text-sm text-[var(--text-muted)]">
          <Link to="/register" className="auth-link">
            Crear cuenta
          </Link>
          <Link to="/forgot-password" className="auth-link">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </AuthSplitLayout>
  );
}

export default ModernLoginPage;
