import React from "react";
import { Tooltip } from "react-tooltip";
import { useNavigate } from "react-router-dom";

const FolderPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 0 1 2-2h4l1.6 1.6A2 2 0 0 0 11.01 6H16a2 2 0 0 1 2 2v1.2a4.6 4.6 0 0 0-1-.11H4.2A3.2 3.2 0 0 0 1 12.29V6Z" />
    <path d="M2.6 11.1A1.6 1.6 0 0 0 1 12.7v2.7A2.6 2.6 0 0 0 3.6 18H17a2 2 0 0 0 2-2v-3.3a1.6 1.6 0 0 0-1.6-1.6H11v-1a1 1 0 1 0-2 0v1H8a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1v-1h6.4a.6.6 0 0 1 .6.6V16a.6.6 0 0 1-.6.6H3.6A1.6 1.6 0 0 1 2 15.4v-2.7a.6.6 0 0 1 .6-.6H6a1 1 0 1 0 0-2H2.6Z" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 2a1 1 0 0 1 .7.3l3.5 3.5a1 1 0 1 1-1.4 1.4L11 5.4V13a1 1 0 1 1-2 0V5.4L7.2 7.2A1 1 0 0 1 5.8 5.8l3.5-3.5A1 1 0 0 1 10 2Z" />
    <path d="M3 15a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M8.6 6.2a3 3 0 0 1 4.2 0 1 1 0 0 1-1.4 1.4 1 1 0 1 0-1.4 1.4 1 1 0 0 1-1.4 1.4 3 3 0 0 1 0-4.2Z" />
    <path d="M6.2 8.6a3 3 0 0 0 0 4.2 1 1 0 1 1-1.4 1.4 5 5 0 0 1 7.07-7.07 1 1 0 0 1-1.42 1.41A3 3 0 0 0 6.2 8.6Z" />
    <path d="M12.38 6.38a1 1 0 0 1 1.42 0 5 5 0 0 1-7.08 7.08 1 1 0 0 1 1.42-1.42 3 3 0 0 0 4.24-4.24 1 1 0 0 1 0-1.42Z" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M17 10a1 1 0 0 1-1 1H6.4l2.3 2.3a1 1 0 1 1-1.4 1.4l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4L6.4 9H16a1 1 0 0 1 1 1Z" clipRule="evenodd" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.7 2.3a1 1 0 0 1 .6 0l7 3A1 1 0 0 1 18 6.2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.2a1 1 0 0 1 .7-.9l7-3Z" />
    <path d="M7 18v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5" />
  </svg>
);

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-5 14a5 5 0 1 1 10 0H5Z" clipRule="evenodd" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 4a2 2 0 0 1 2-2h5a1 1 0 1 1 0 2H5v12h5a1 1 0 1 1 0 2H5a2 2 0 0 1-2-2V4Zm10.3 1.3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 1 1-1.4-1.4L14.6 10H8a1 1 0 1 1 0-2h6.6l-1.3-1.3a1 1 0 0 1 0-1.4Z" clipRule="evenodd" />
  </svg>
);

function LibraryHeader({
  canGoBack,
  handleBackClick,
  currentFolderName,
  user,
  currentFolder,
  openCreateFolderModal,
  openUploadModal,
  openAddLinkModal,
  logout,
}) {
  const navigate = useNavigate();
  const userTooltipId = "header-user-tooltip";
  const canCreateFolders = user?.role !== "usuario";

  const userInfoHtml = user
    ? `
        <div style="min-width: 180px;">
          <p><strong>${user.username || "Usuario"}</strong></p>
          <p>Rol: ${user.role || "sin rol"}</p>
          <p>Email: ${user.email || "N/A"}</p>
        </div>
      `
    : "Usuario no disponible";

  return (
    <header className="glass-panel sticky top-3 z-30 overflow-hidden rounded-[26px] border border-white/60 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="app-button-secondary !min-h-[40px] !px-4 !py-2 text-sm"
              >
                <HomeIcon />
                Inicio
              </button>
              {canGoBack && (
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="app-button-ghost !min-h-[40px] !px-4 !py-2 text-sm"
                >
                  <BackIcon />
                  Volver
                </button>
              )}
              <span className="eyebrow">
                {currentFolder ? "Carpeta activa" : "Biblioteca principal"}
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-[1.35rem] font-semibold text-[var(--text-main)] sm:text-[1.6rem]">
                {currentFolderName}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-2 shadow-sm"
              data-tooltip-id={userTooltipId}
              data-tooltip-html={userInfoHtml}
              data-tooltip-place="bottom-end"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <ProfileIcon />
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-[var(--text-main)]">
                  {user?.username || "Usuario"}
                </span>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-[var(--text-soft)]">
                  {user?.role || "Cuenta"}
                </span>
              </span>
            </button>

            {user?.role === "admin" && (
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="app-button-secondary"
              >
                Administración
              </button>
            )}

            <button type="button" onClick={logout} className="app-button-ghost">
              <LogoutIcon />
              Salir
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--line-soft)] pt-3">
          {canCreateFolders && (
            <button type="button" onClick={openCreateFolderModal} className="app-button-primary !min-h-[42px] !px-4 !py-2.5">
              <FolderPlusIcon />
              Nueva carpeta
            </button>
          )}
          <button
            type="button"
            onClick={openUploadModal}
            disabled={!currentFolder}
            className={`app-button-secondary !min-h-[42px] !px-4 !py-2.5 ${!currentFolder ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <UploadIcon />
            Subir archivo
          </button>
          <button
            type="button"
            onClick={openAddLinkModal}
            disabled={!currentFolder}
            className={`app-button-secondary !min-h-[42px] !px-4 !py-2.5 ${!currentFolder ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <LinkIcon />
            Añadir enlace
          </button>
          {!currentFolder && (
            <div className="rounded-full bg-[var(--warm-soft)] px-4 py-2 text-sm font-medium text-[#8b4f2e]">
              Selecciona una carpeta para cargar.
            </div>
          )}
        </div>
      </div>

      <Tooltip id={userTooltipId} className="tooltip-on-top" />
    </header>
  );
}

export default LibraryHeader;
