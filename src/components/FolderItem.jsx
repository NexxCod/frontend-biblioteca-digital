import React from "react";

// Importa o define FolderIcon aquí si lo moviste
const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-yellow-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// Recibe 'folder' y 'onFolderClick' como props
function FolderItem({ folder, onFolderClick, onDeleteClick }) {
  return (
    <div
      // Quita key={folder._id} si ya está en el map del padre (FolderGrid)
      className="relative bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer border border-gray-200 text-center"
      onClick={() => onFolderClick(folder)} // Click principal para navegar
      title={folder.name}
    >
      {/* Botón Eliminar (posición absoluta) */}
      {onDeleteClick && ( // Mostrar solo si la función es pasada
        <button
          onClick={(e) => {
            e.stopPropagation(); // IMPORTANTE: Evita que se dispare onFolderClick
            onDeleteClick(folder, "folder"); // Llama a la función pasada desde HomePage, indicando el tipo
          }}
          className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
          title="Eliminar Carpeta"
        >
          <TrashIcon />
        </button>
      )}
      <FolderIcon />
      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
        {folder.name}
      </p>
      {/* Podríamos añadir más detalles aquí si los pasamos */}
    </div>
  );
}

export default FolderItem;
