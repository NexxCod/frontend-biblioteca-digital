import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../services/authService";
import AuthSplitLayout from "../components/AuthSplitLayout";

function ModernForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setError("Ingresa tu correo electrónico.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.forgotPassword(email);
      setMessage(
        response.message ||
          "Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      setEmail("");
    } catch (err) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      badge="Recuperación"
      title="Restablecer contraseña"
      description="Solicita el enlace de recuperación sin perder claridad sobre el siguiente paso."
      heroTitle="Recuperar acceso no debería sentirse como un flujo de soporte."
      heroDescription="Esta versión reduce ruido, deja claro qué ocurrirá después y mantiene el mismo tono visual del resto del sistema."
      heroPoints={[
        { title: "Claro", description: "Explica el paso siguiente antes de enviar el formulario." },
        { title: "Sobrio", description: "Mensajes de éxito y error con mejor contraste y jerarquía." },
        { title: "Consistente", description: "La experiencia mantiene el mismo sistema visual de login y registro." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm leading-6 text-[var(--text-muted)]">
          Ingresa tu correo electrónico y te enviaremos un enlace para definir una nueva contraseña.
        </p>

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

        {message && <div className="status-success">{message}</div>}
        {error && <div className="status-error">{error}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className={`app-button-primary w-full ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {isLoading ? "Enviando..." : "Enviar enlace"}
        </button>

        <Link to="/login" className="auth-link inline-flex pt-2 text-sm">
          Volver a iniciar sesión
        </Link>
      </form>
    </AuthSplitLayout>
  );
}

export default ModernForgotPasswordPage;
