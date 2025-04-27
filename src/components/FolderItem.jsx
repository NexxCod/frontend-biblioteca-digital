import React from "react";
import { format } from "date-fns";
import { Tooltip } from 'react-tooltip';

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

const PencilIcon = () => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const InfoIcon = () => (
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
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Recibe 'folder' y 'onFolderClick' como props
function FolderItem({
  folder,
  onFolderClick,
  onDeleteClick,
  onEditClick,
  user,
}) {
  // --- Lógica de Permisos ---
  const isAdmin = user?.role === "admin";
  const isOwner = user && folder.createdBy && folder.createdBy._id === user._id;
  const canModify = isAdmin || isOwner;
  // --------------------------

  // --- Información para el Tooltip (formateada como HTML simple) ---
  const infoHtml = `
    <div>
      <p><strong>Creado por:</strong> ${folder.createdBy?.username || 'Desconocido'}</p>
      <p><strong>Fecha:</strong> ${folder.createdAt ? format(new Date(folder.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}</p>
    </div>
  `;

  // Genera un ID único para el tooltip de esta carpeta
  const tooltipId = `folder-info-${folder._id}`;

  return (
    <div
      className="relative bg-white p-3 pt-5 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer border border-gray-200 text-center"
      onClick={() => onFolderClick(folder)} // Click principal para navegar
      title={folder.name}
    >
      <div className="absolute top-1 right-1 flex gap-1 z-10">
         {/* --- Botón de Información con react-tooltip --- */}
         <button
            onClick={(e) => e.stopPropagation()} // Evita que se abra la carpeta
            className="p-1 text-gray-400 hover:text-sky-600 rounded-full hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300"
            data-tooltip-id={tooltipId} // Asigna el ID único
            data-tooltip-html={infoHtml} // Pasa el contenido HTML
            data-tooltip-place="top" // Posición del tooltip (puedes cambiarla)
            aria-label={`Información sobre ${folder.name}`} // Para accesibilidad
          >
            <InfoIcon />
         </button>
         {/* --- Fin Botón de Información --- */}
        {/* Botón Editar */}
        {canModify && onEditClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(folder, "folder");
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            title="Editar Carpeta"
          >
            <PencilIcon />
          </button>
        )}
        {/* Botón Eliminar (posición absoluta) */}
        {canModify &&
          onDeleteClick && ( // Mostrar solo si la función es pasada
            <button
              onClick={(e) => {
                e.stopPropagation(); // IMPORTANTE: Evita que se dispare onFolderClick
                onDeleteClick(folder, "folder"); // Llama a la función pasada desde HomePage, indicando el tipo
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
              title="Eliminar Carpeta"
            >
              <TrashIcon />
            </button>
          )}
      </div>
      <FolderIcon />
      <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
        {folder.name}
      </p>
      {/* --- Componente Tooltip (se renderiza aquí pero se posiciona globalmente) --- */}
      {/* Puedes añadir clases para estilo: className='custom-tooltip-style' */}
      {/* Asegúrate de importar el CSS base de react-tooltip en tu App.jsx o index.js */}
      {/* import 'react-tooltip/dist/react-tooltip.css'; */}
      <Tooltip id={tooltipId} />
    </div>
  );
}

export default FolderItem;
