import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthSplitLayout from "../components/AuthSplitLayout";

function ModernRegisterPage() {
  const navigate = useNavigate();
  const { register, isLoggedIn, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!username || !email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const responseData = await register(username, email, password);
      setSuccessMessage(
        responseData.message ||
          "Registro exitoso. Revisa tu correo para verificar la cuenta."
      );
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(
        typeof err?.message === "string"
          ? err.message
          : "No se pudo completar el registro."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !isLoggedIn) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6">Preparando registro...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <AuthSplitLayout
      badge="Registro"
      title="Crear cuenta"
      description="Registra nuevos usuarios con una experiencia más simple y una jerarquía visual más clara."
      heroTitle="Tu biblioteca ya no necesita verse como una herramienta improvisada."
      heroDescription="La nueva interfaz prioriza decisiones rápidas, contexto visible y menos dependencia de tooltips o menús secundarios."
      heroPoints={[
        { title: "Flujos claros", description: "Registro, acceso y recuperación usan el mismo lenguaje visual." },
        { title: "Jerarquía real", description: "Las acciones importantes aparecen primero y el ruido visual baja." },
        { title: "Consistencia", description: "Mismo sistema para biblioteca, autenticación y administración." },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label" htmlFor="username">
            Nombre de usuario
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Tu nombre visible"
            className="app-input"
            disabled={isSubmitting}
            required
          />
        </div>

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
            disabled={isSubmitting}
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
            placeholder="Mínimo 6 caracteres"
            className="app-input"
            minLength="6"
            disabled={isSubmitting}
            required
          />
        </div>

        {error && <div className="status-error">{error}</div>}
        {successMessage && <div className="status-success">{successMessage}</div>}

        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={`app-button-primary w-full ${isSubmitting || isLoading ? "cursor-not-allowed opacity-50" : ""}`}
        >
          {isSubmitting ? "Registrando..." : "Crear cuenta"}
        </button>

        <p className="pt-2 text-sm text-[var(--text-muted)]">
          ¿Ya tienes cuenta?
          <Link to="/login" className="auth-link ml-1">
            Inicia sesión
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}

export default ModernRegisterPage;
