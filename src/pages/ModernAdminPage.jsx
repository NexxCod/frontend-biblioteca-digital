import React from "react";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserManagement from "../components/Admin/UserManagement";
import GroupManagement from "../components/Admin/GroupManagement";
import TagManagement from "../components/Admin/TagManagement";

const tabs = [
  { to: "/admin/users", label: "Usuarios", description: "Accesos, roles y grupos." },
  { to: "/admin/groups", label: "Grupos", description: "Organización y visibilidad." },
  { to: "/admin/tags", label: "Etiquetas", description: "Clasificación y búsqueda." },
];

function ModernAdminPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6">Cargando administración...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="page-shell">
        <div className="status-error">
          Acceso denegado. Esta sección solo está disponible para administración.
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="space-y-6">
        <section className="glass-panel rounded-[30px] px-6 py-6 sm:px-7">
          <span className="eyebrow">Administración</span>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="section-title text-[var(--text-main)]">
                Panel de control más claro y menos burocrático
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-[var(--text-muted)]">
                El objetivo aquí no es solo gestionar datos, sino hacerlo con menos fricción visual y mejor jerarquía entre tablas, formularios y acciones.
              </p>
            </div>
            <div className="rounded-[24px] bg-white/70 px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Sesión actual
              </p>
              <p className="mt-3 text-lg font-semibold text-[var(--text-main)]">
                {user.username}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="soft-panel rounded-[30px] p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-3">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  [
                    "rounded-[24px] border px-5 py-4",
                    isActive
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-lg"
                      : "border-[var(--line-soft)] bg-white/70 text-[var(--text-main)] shadow-sm",
                  ].join(" ")
                }
              >
                <p className="text-lg font-semibold">{tab.label}</p>
                <p
                  className={`mt-1 text-sm ${
                    location.pathname === tab.to ? "text-white/78" : "text-[var(--text-muted)]"
                  }`}
                >
                  {tab.description}
                </p>
              </NavLink>
            ))}
          </div>
        </section>

        <section className="soft-panel rounded-[30px] p-5 sm:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="groups" element={<GroupManagement />} />
            <Route path="tags" element={<TagManagement />} />
          </Routes>
        </section>
      </div>
    </div>
  );
}

export default ModernAdminPage;
