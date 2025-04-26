import React from 'react';
import FileItem from './FileItem'; // Importa el componente de ítem

// Recibe las props necesarias desde HomePage
function FileGrid({ files, isLoading, showEmptyMessage, onDeleteClick, onEditClick, user }) {
  return (
    <div>
      {isLoading && (
          <p className="text-gray-500">Cargando archivos...</p>
      )}
      {!isLoading && ( // Solo muestra la cuadrícula o el mensaje de vacío si no está cargando
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 min-h-[80px]">
          {files.length > 0 ? (
            files.map((file) => (
              <FileItem
                key={file._id}
                file={file}
                onDeleteClick={onDeleteClick}
                onEditClick={onEditClick} 
                user={user}
              />
            ))
           // Mostrar mensaje "(Vacío)" solo si showEmptyMessage es true
          ) : showEmptyMessage ? (
            <p className="text-gray-500 text-sm col-span-full italic">
              (Esta carpeta está vacía)
            </p>
           ) : null // No muestra nada si hay subcarpetas aunque no haya archivos
          }
        </div>
      )}
    </div>
  );
}

export default FileGrid;