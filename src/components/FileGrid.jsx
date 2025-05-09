// src/components/FileGrid.jsx
import React from 'react';
import FileItem from './FileItem';

function FileGrid({ files, isLoading, showEmptyMessage, onDeleteClick, onEditClick, user }) {
  // Muestra "Cargando archivos..." solo si isLoading es true Y no hay archivos previos para mostrar.
  if (isLoading && (!files || files.length === 0)) {
      return <p className="text-gray-500">Cargando archivos...</p>;
  }

  // Si no está cargando, Y no hay archivos, Y se debe mostrar el mensaje de vacío.
  if (!isLoading && (!files || files.length === 0) && showEmptyMessage) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[80px]">
        <p className="text-gray-500 text-sm col-span-full italic">
          (Esta carpeta está vacía)
        </p>
      </div>
    );
  }

  // Si hay archivos (incluso si isLoading es true pero ya teníamos archivos de la vista anterior), los renderizamos.
  if (files && files.length > 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[80px]">
        {files.map((file) => (
          <FileItem
            key={file._id}
            file={file}
            onDeleteClick={onDeleteClick}
            onEditClick={onEditClick}
            user={user}
          />
        ))}
      </div>
    );
  }

  // Si ninguna de las condiciones anteriores se cumple (ej: no está cargando, no hay archivos, pero showEmptyMessage es false)
  return null; 
}

export default FileGrid;