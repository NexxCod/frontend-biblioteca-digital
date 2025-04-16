import React from 'react';

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
    return (
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            {/* Izquierda: Título y Usuario */}
            <div className="flex-grow">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    {/* Botón Atrás (condicional) */}
                    {canGoBack && (
                        <button onClick={handleBackClick} title="Volver" className="mr-3 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    )}
                    Carpeta: {currentFolderName}
                </h1>
                <p className="text-gray-600 text-sm mt-1">Usuario: {user?.username} ({user?.role})</p>
            </div>

            {/* Derecha: Botones de Acción */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
                <button onClick={openCreateFolderModal} title="Crear Nueva Carpeta" className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none text-sm inline-flex items-center">
                    <CreateFolderIcon /> Nueva Carpeta
                </button>
                <button
                    onClick={openUploadModal}
                    title="Subir Archivo"
                    className={`px-3 py-2 text-white rounded focus:outline-none text-sm inline-flex items-center ${!currentFolder ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'}`}
                    disabled={!currentFolder} // Deshabilitado si estamos en Raíz
                >
                    <UploadIcon /> Subir
                </button>
                 <button
                    onClick={openAddLinkModal}
                    title="Añadir Enlace de Video"
                    className={`px-3 py-2 text-white rounded focus:outline-none text-sm inline-flex items-center ${!currentFolder ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-700'}`}
                    disabled={!currentFolder} // Deshabilitado si estamos en Raíz
                >
                    <LinkIcon /> Enlace
                 </button>
                <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-gray-700 focus:outline-none text-sm">
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export default HomeHeader;