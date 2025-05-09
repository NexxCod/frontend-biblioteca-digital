import React, { useState, memo } from "react";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";

// Importa o define FileIcon aquí si lo moviste
const FileIcon = ({ fileType }) => {
  let color = "text-gray-500";
  if (fileType === "pdf") color = "text-red-500";
  else if (fileType === "image") color = "text-blue-500";
  else if (fileType === "word") color = "text-blue-700";
  else if (fileType === "video_link") color = "text-red-700";
  else if (fileType === "generic_link") color = "text-black-500";
  else if (fileType === "video") color = "text-red-500";
  else if (fileType === "audio") color = "text-green-500";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto ${color}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
};

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

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function FileItem({ file, onDeleteClick, onEditClick, user }) {
  const [isDownloading, setIsDownloading] = useState(false); // Estado para indicar descarga
  const [downloadError, setDownloadError] = useState(""); // Estado para errores de descarga

  // --- Lógica de Permisos ---
  const isAdmin = user?.role === "admin";
  const isOwner = user && file.uploadedBy && file.uploadedBy._id === user._id;
  const canModify = isAdmin || isOwner;
  // --------------------------
  // --- Información para el Tooltip (formateada como HTML simple) ---
  const tagString =
    file.tags?.length > 0
      ? file.tags.map((tag) => tag.name).join(", ")
      : "Ninguna";

  let detailsHtml = `
<div>
  <p><strong>Tipo:</strong> ${file.fileType || "N/A"}</p>
  <p><strong>Creado por:</strong> ${
    file.uploadedBy?.username || "Desconocido"
  }</p>
  <p><strong>Fecha:</strong> ${
    file.createdAt
      ? format(new Date(file.createdAt), "dd/MM/yyyy HH:mm")
      : "N/A"
  }</p>
  <p><strong>Descripción:</strong> ${file.description || "Ninguna"}</p>
  <p><strong>Etiquetas:</strong> ${tagString}</p>
`;

  // Añadir tamaño solo si no es un enlace y el tamaño existe
  if (
    file.fileType !== "video_link" &&
    file.fileType !== "generic_link" &&
    file.size !== undefined &&
    file.size !== null
  ) {
    detailsHtml += `<p><strong>Tamaño:</strong> ${formatBytes(file.size)}</p>`;
  }

  detailsHtml += `</div>`; // Cierra el div

  // Genera un ID único para el tooltip de este archivo
  const tooltipId = `file-info-${file._id}`;

  // --- NUEVA FUNCIÓN PARA MANEJAR LA DESCARGA ---
  const handleDownloadClick = async (e) => {
    // Solo intenta descargar/abrir archivos que tienen un secureUrl (enlace compartido de Drive)
    if (
      !file.secureUrl ||
      file.fileType === "video_link" ||
      file.fileType === "generic_link"
    ) {
      console.warn(
        "No hay secureUrl válido o es un enlace externo para descargar."
      );
      setDownloadError("No disponible para descarga directa."); // Mensaje si no hay URL válida
      return;
    }

    e.preventDefault(); // Prevenir la navegación normal del enlace
    setIsDownloading(true); // Mostrar indicador de carga (opcional)
    setDownloadError(""); // Limpiar error previo

    // URL original de Cloudinary (no necesitamos ?fl_attachment=true aquí)
    const fileUrl = file.secureUrl;
    // Nombre de archivo saneado desde la BD
    const filename = file.filename;

    try {
      // El fetch como blob aún puede funcionar si file.secureUrl es un enlace directo de descarga
      // Pero si es un webViewLink (para ver en el navegador), o si quieres más control,
      // podrías redirigir directamente a la URL de Google Drive o usar un endpoint backend.
      // Opción 1: Simplemente redirigir a la URL de Google Drive
      window.open(fileUrl, '_blank'); // Abre en nueva pestaña

      // Opción 2: Si quieres forzar la descarga con JS (puede no funcionar para todos los tipos de enlaces de Drive)
      /*
      const response = await fetch(fileUrl);
      if (!response.ok) {
          throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      const tempUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = tempUrl;
      tempLink.setAttribute('download', filename); // ¡Nombre de archivo correcto!
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(tempUrl);
      */

  } catch (error) {
      console.error("Error en la descarga/apertura JS:", error);
      setDownloadError('No se pudo abrir/descargar el archivo.'); // Mostrar error al usuario
  } finally {
      setIsDownloading(false); // Ocultar indicador de carga
  }
  };
  // --- FIN NUEVA FUNCIÓN ---
  const isLink =
    file.fileType === "video_link" || file.fileType === "generic_link";

  return (
    <div
      className="relative bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-200 text-center flex flex-col justify-between"
      title={file.filename}
    >
      <div className="absolute top-1 right-1 flex gap-1 z-10">
        {/* --- Botón de Información con react-tooltip --- */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-gray-400 hover:text-sky-600 rounded-full hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300"
          data-tooltip-id={tooltipId} // Asigna el ID único
          data-tooltip-html={detailsHtml} // Pasa el contenido HTML
          data-tooltip-place="top" // Posición del tooltip
          aria-label={`Información sobre ${file.filename}`} // Accesibilidad
        >
          <InfoIcon />
        </button>
        {/* --- Fin Botón de Información --- */}
        {/* Botón Editar */}
        {canModify && onEditClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(file, "file");
            }}
            className="p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            title="Editar Archivo"
          >
            <PencilIcon />
          </button>
        )}
        {/* Botón Eliminar (posición absoluta) */}
        {canModify &&
          onDeleteClick && ( // Mostrar solo si la función es pasada
            <button
              onClick={(e) => {
                e.stopPropagation(); // IMPORTANTE: Evita que se dispare el clic del div padre
                onDeleteClick(file, "file"); // Llama a la función pasada desde HomePage, indicando el tipo
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
              title="Eliminar Archivo"
            >
              <TrashIcon />
            </button>
          )}
      </div>
      <div>
        {/* Contenedor para icono y nombre */}
        <FileIcon fileType={file.fileType} />
        <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
          {file.filename}
        </p>
        {/* Mostrar error de descarga si existe */}
        {downloadError && !isLink && (
          <p className="text-red-500 text-xs mt-1">{downloadError}</p>
        )}
      </div>
      {/* Enlace/Botón para abrir */}

      {isLink ? (
        // Si es un LINK: Renderiza un enlace normal
        <a
          href={file.secureUrl} // Apunta directamente a la URL del enlace
          target="_blank" // Abrir en nueva pestaña
          rel="noopener noreferrer"
          className="mt-2 text-xs text-blue-500 hover:underline block"
          onClick={(e) => e.stopPropagation()} // Opcional: si aún quieres evitar que se propague el clic al div padre
        >
          Abrir Enlace
        </a>
      ) : (
        // Si es un ARCHIVO: Renderiza el botón/enlace que llama a handleDownloadClick
        <a
          href={file.secureUrl} // El href es solo un fallback aquí
          rel="noopener noreferrer"
          onClick={file.secureUrl ? handleDownloadClick : (e) => e.preventDefault()} // Llama a la función de descarga JS
          download={file.secureUrl ? file.filename : undefined}
          target={file.secureUrl ? '_blank' : undefined}
          className="mt-2 text-xs text-blue-500 hover:underline block cursor-pointer"
        >
          {isDownloading ? "Descargando..." : "Descargar"}
        </a>
      )}
      {/* --- Componente Tooltip --- */}
      {/* Recuerda importar 'react-tooltip/dist/react-tooltip.css' globalmente */}
      <Tooltip id={tooltipId} className="tooltip-on-top" />
    </div>
  );
}

export default React.memo(FileItem);
