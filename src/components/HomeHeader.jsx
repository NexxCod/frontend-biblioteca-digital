import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';

// --- Iconos SVG --- (Definidos aquí ya que no se movieron antes)
const CreateFolderIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm5 4a1 1 0 011 1v1h1a1 1 0 110 2H8v1a1 1 0 11-2 0v-1H5a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
);
const UploadIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
     </svg>
);
const LinkIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-1.5-1.5a2 2 0 112.828-2.828l1.5 1.5a.5.5 0 00.707 0l.707-.707a2 2 0 00-2.828-2.828l-3 3a2 2 0 000 2.828l9 9a2 2 0 002.828 0l3-3a2 2 0 000-2.828l-9-9z" clipRule="evenodd" />
      </svg>
);

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /> {/* Flecha Izquierda */}
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const EllipsisVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
);

const HomeIcon = () => (
  <svg
  xmlns="http://www.w3.org/2000/svg"
  className="h-5 w-5"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M3 12L12 4l9 8" /> 
  <path d="M5 12v7a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-7" /> 
</svg>
);

const LogoutIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        // Ajusta el tamaño y margen como necesites con clases de Tailwind
        // 'mr-3' lo separará del texto en el menú
        className="h-5 w-5 mr-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2} // Puedes ajustar el grosor del trazo si quieres
    >
      <path
          strokeLinecap="round"
          strokeLinejoin="round"
          // Este es el path SVG para un icono común de logout (puerta con flecha saliendo)
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
);
// --- Fin Iconos ---


// Recibe todas las props necesarias de HomePage
function HomeHeader({
    canGoBack,
    handleBackClick,
    currentFolderName,
    user,
    currentFolder, // Necesario para habilitar/deshabilitar botones Upload/Link
    openCreateFolderModal,
    openUploadModal,
    openAddLinkModal,
    logout
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú desplegable
    const menuRef = useRef(null); // Ref para detectar clics fuera
    const navigate = useNavigate();

    const userInfoHtml = user ? `
        <div style="padding: 5px; text-align: left;">
            <p><strong>Usuario:</strong> ${user.username || 'N/A'}</p>
            <p><strong>Rol:</strong> ${user.role || 'N/A'}</p>
        </div>
    ` : 'Usuario no disponible'; // Mensaje si no hay usuario

    const userTooltipId = 'header-user-tooltip'; // ID para el tooltip
// Efecto para cerrar el menú al hacer clic fuera
useEffect(() => {
    function handleClickOutside(event) {
        // Si el menú está abierto y el clic NO fue dentro del área del menú (ref)
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, [menuRef]); // El efecto depende del ref


const handleCreateFolderClick = () => { openCreateFolderModal(); setIsMenuOpen(false); };
const handleUploadClick = () => { openUploadModal(); setIsMenuOpen(false); };
const handleAddLinkClick = () => { openAddLinkModal(); setIsMenuOpen(false); };
const handleLogoutClick = () => { logout(); setIsMenuOpen(false); };

const handleProfileClick = () => {
        navigate('/profile'); // Navega a la ruta /profile
        // Opcional: puedes cerrar el menú si estuviera abierto por otra razón
        // setIsMenuOpen(false); 
    };

    return (

        <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between w-full shadow-md sticky top-0 z-30">
            <div className="flex items-center flex-1 min-w-0 mr-4"> {/* flex-1 y min-w-0 para que el título se trunque si es necesario */}
                <div className="flex items-center gap-2 mr-4">
  {canGoBack && (
    <button
      onClick={handleBackClick}
      title="Volver"
      className="p-1 rounded-full text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
    >
      <BackArrowIcon />
    </button>
  )}
  <button
    onClick={() => navigate('/')}
    title="Ir al Inicio"
    className="p-1 rounded-full text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
  >
    <HomeIcon />
  </button>
</div>
                {/* Título de la Carpeta */}
                <h1 className="text-lg sm:text-xl font-medium truncate"> {/* Truncate para nombres largos */}
                    {currentFolderName}
                </h1>
            </div>
            {/* Sección Derecha: Icono de Usuario (empujado a la derecha) */}
            {/* ml-auto no es necesario aquí porque la sección izquierda usa flex-1 */}
            <div className="flex items-center gap-2" ref={menuRef}>
                <button
                    onClick={handleProfileClick} // Navega al perfil
                    className="p-1 rounded-full text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    data-tooltip-id={userTooltipId}
                    data-tooltip-html={userInfoHtml}
                    data-tooltip-place="bottom-end" // Mostrar abajo a la derecha del icono
                    aria-label="Información de usuario"
                >
                    <UserIcon />
                </button>
                {/* El componente Tooltip asociado */}
                <Tooltip id={userTooltipId} className="tooltip-on-top" />
                {/* Botón Menú Desplegable (Tres Puntos) */}
                <div className="relative"> {/* Necesario para posicionar el menú */}
                    <button
                        onClick={() => setIsMenuOpen(prev => !prev)} // Alterna visibilidad
                        className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                        aria-label="Más opciones"
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                    >
                        <EllipsisVerticalIcon />
                    </button>

                    {/* El Menú Desplegable */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                                {/* Elementos del Menú */}
                                {/* Botón "Nueva Carpeta" (VERIFICACIÓN DIRECTA EN JSX) */}
                                {user?.role !== 'usuario' && ( // <--- MOSTRAR SOLO SI EL ROL NO ES 'residente/alumno'
                                    <button
                                        onClick={handleCreateFolderClick}
                                        className="text-gray-700 hover:bg-gray-100 w-full text-left px-4 py-2 text-sm flex items-center"
                                        role="menuitem"
                                    >
                                        <CreateFolderIcon /> Nueva Carpeta
                                    </button>
                                 )}
                                <button
                                    onClick={handleUploadClick}
                                    disabled={!currentFolder}
                                    className={`text-gray-700 hover:bg-gray-100  w-full text-left px-4 py-2 text-sm flex items-center ${!currentFolder ? 'opacity-50 cursor-not-allowed' : ''}`} role="menuitem"
                                >
                                    <UploadIcon /> Subir Archivo
                                </button>
                                <button
                                    onClick={handleAddLinkClick}
                                    disabled={!currentFolder}
                                    className={`text-gray-700 hover:bg-gray-100 k w-full text-left px-4 py-2 text-sm flex items-center ${!currentFolder ? 'opacity-50 cursor-not-allowed' : ''}`} role="menuitem"
                                >
                                    <LinkIcon /> Añadir Enlace
                                </button>
                                {/* Separador Opcional */}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={handleLogoutClick}
                                    className="text-gray-700 hover:bg-gray-100  w-full text-left px-4 py-2 text-sm flex items-center" role="menuitem"
                                >
                                   <LogoutIcon /> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default HomeHeader;