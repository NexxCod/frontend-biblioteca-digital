// src/components/FolderGrid.jsx
import React from 'react';
import FolderItem from './FolderItem';

function FolderGrid({ folders, isLoading, onFolderClick, onDeleteClick, onEditClick, user }) {
  // Si está cargando Y NO hay carpetas para mostrar de la carga anterior, muestra el mensaje de carga.
  if (isLoading && (!folders || folders.length === 0)) {
    return <p className="text-gray-500">Cargando carpetas...</p>;
  }

  // Si no está cargando y sigue sin haber carpetas (después de la carga).
  if (!isLoading && (!folders || folders.length === 0)) {
    // No mostramos nada aquí directamente; HomePage manejará el mensaje de "(Esta carpeta está vacía)"
    // o "(No hay carpetas raíz creadas)" basado en el contexto general.
    return null; 
  }

  // Si hay carpetas (incluso si isLoading es true pero ya teníamos carpetas), las renderizamos.
  // El estado de carga general de la página (un spinner, etc.) puede manejarse en HomePage.
  if (folders && folders.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[80px]">
        {folders.map((folder) => (
          <FolderItem
            key={folder._id}
            folder={folder}
            onFolderClick={onFolderClick}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
            user={user}
          />
        ))}
      </div>
    );
  }
  return null; // Por si acaso
}

export default FolderGrid;