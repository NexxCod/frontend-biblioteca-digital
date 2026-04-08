import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../services/authService";
import AuthSplitLayout from "../components/AuthSplitLayout";

function ModernResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de restablecimiento no válido o faltante.");
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Completa ambos campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(
        token,
        password,
        confirmPassword
      );
      setMessage(
        response.message ||
          "Contraseña restablecida con éxito. Serás redirigido para iniciar sesión."
      );
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.message ||
          "No se pudo restablecer la contraseña. El token puede ser inválido o haber expirado."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      badge="Nueva contraseña"
      title="Definir nueva contraseña"
      description="Cierra el flujo de recuperación con una pantalla más clara, menos técnica y más confiable."
      heroTitle="La recuperación termina mejor cuando el último paso también está bien diseñado."
      heroDescription="La interfaz evita ambigüedad, explica qué pasará y mantiene un tono visual consistente con el resto del sistema."
      heroPoints={[
        { title: "Validación clara", description: "Las reglas de contraseña aparecen donde importan." },
        { title: "Cierre limpio", description: "El usuario entiende cuándo el cambio fue exitoso y qué sigue." },
        { title: "Sin ruido", description: "Menos cajas y mensajes dispersos, más foco en la tarea." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label" htmlFor="password">
            Nueva contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nueva contraseña"
            className="app-input"
            required
          />
        </div>

        <div>
          <label className="field-label" htmlFor="confirmPassword">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite la contraseña"
            className="app-input"
            required
          />
        </div>

        {message && <div className="status-success">{message}</div>}
        {error && <div className="status-error">{error}</div>}

        {!message && (
          <button
            type="submit"
            disabled={isLoading || !token}
            className={`app-button-primary w-full ${isLoading || !token ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isLoading ? "Actualizando..." : "Restablecer contraseña"}
          </button>
        )}

        <Link to="/login" className="auth-link inline-flex pt-2 text-sm">
          Volver a iniciar sesión
        </Link>
      </form>
    </AuthSplitLayout>
  );
}

export default ModernResetPasswordPage;
