import React from 'react';
import FolderItem from './FolderItem';

// Ya no necesita showEmptyMessage
function FolderGrid({ folders, isLoading, onFolderClick }) {
  // Si está cargando, muestra el mensaje de carga
  if (isLoading) {
    return <p className="text-gray-500">Cargando carpetas...</p>;
  }

  // Si no está cargando y no hay carpetas, no renderiza nada desde aquí
  if (!folders || folders.length === 0) {
    return null;
  }

  // Si hay carpetas, renderiza la cuadrícula
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[80px]">
      {folders.map((folder) => (
        <FolderItem
          key={folder._id}
          folder={folder}
          onFolderClick={onFolderClick}
        />
      ))}
    </div>
  );
}

export default FolderGrid;