import React from "react";
import { Link, useNavigate } from "react-router-dom";
import ChangePasswordForm from "../components/Profile/ChangePasswordForm";
import { useAuth } from "../contexts/AuthContext";

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M17 10a1 1 0 0 1-1 1H6.4l2.3 2.3a1 1 0 1 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4L6.4 9H16a1 1 0 0 1 1 1Z" clipRule="evenodd" />
  </svg>
);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return dateString;
  }
};

const InfoRow = ({ label, value }) => (
  <div className="rounded-[22px] bg-white/70 px-4 py-4">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-soft)]">
      {label}
    </p>
    <p className="mt-2 text-sm font-semibold text-[var(--text-main)]">{value}</p>
  </div>
);

function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <div className="status-error">Usuario no encontrado. Debes iniciar sesión.</div>
      </div>
    );
  }

  const groupNames =
    user.groups && user.groups.length > 0
      ? user.groups.map((group) => group.name).join(", ")
      : "Ninguno";

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-panel rounded-[28px] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="eyebrow">Perfil</span>
              <h1 className="mt-3 text-[1.8rem] text-[var(--text-main)]">Mi cuenta</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/" className="app-button-ghost">
                <BackIcon />
                Volver
              </Link>
              <button onClick={handleLogout} className="app-button-ghost text-[#8e2b2b]">
                <LogoutIcon />
                Salir
              </button>
            </div>
          </div>
        </section>

        <section className="soft-panel rounded-[28px] p-5 sm:p-6">
          <div className="mb-5 border-b border-[var(--line-soft)] pb-4">
            <h2 className="text-xl text-[var(--text-main)]">Información de la cuenta</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow label="Usuario" value={user.username} />
            <InfoRow label="Correo" value={user.email} />
            <InfoRow label="Rol" value={user.role} />
            <InfoRow label="Grupos" value={groupNames} />
            <InfoRow label="Miembro desde" value={formatDate(user.createdAt)} />
          </div>
        </section>

        <ChangePasswordForm />
      </div>
    </div>
  );
}

export default ProfilePage;
