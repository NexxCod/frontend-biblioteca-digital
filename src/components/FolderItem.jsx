import React from 'react';

// Importa o define FolderIcon aquí si lo moviste
const FolderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
);

// Recibe 'folder' y 'onFolderClick' como props
function FolderItem({ folder, onFolderClick }) {
  return (
    <div
        key={folder._id} // key ya no es necesaria aquí si se pone en el map del padre
        className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer border border-gray-200 text-center"
        onClick={() => onFolderClick(folder)} // Llama a la función pasada como prop
        title={folder.name}
    >
        <FolderIcon />
        <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
            {folder.name}
        </p>
        {/* Podríamos añadir más detalles aquí si los pasamos */}
    </div>
  );
}

export default FolderItem;