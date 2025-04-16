import React from 'react';

// Importa o define FileIcon aquí si lo moviste
const FileIcon = ({ fileType }) => {
    let color = "text-gray-500";
    if (fileType === 'pdf') color = "text-red-500";
    else if (fileType === 'image') color = "text-blue-500";
    else if (fileType === 'word') color = "text-blue-700";
    else if (fileType === 'video_link') color = "text-red-700";

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 sm:h-12 sm:w-12 mx-auto ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );
};

// Recibe 'file' como prop
function FileItem({ file }) {
  return (
    <div
        key={file._id} // key ya no es necesaria aquí si se pone en el map del padre
        className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-200 text-center flex flex-col justify-between"
        title={file.filename}
    >
        <div> {/* Contenedor para icono y nombre */}
            <FileIcon fileType={file.fileType} />
            <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 break-words">
                {file.filename}
            </p>
        </div>
        {/* Enlace/Botón para abrir */}
        <a
            href={file.secureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs text-blue-500 hover:underline block"
            onClick={(e) => e.stopPropagation()} // Evita que el clic en el enlace dispare el onClick del div (si lo tuviera)
        >
            {file.fileType === 'video_link' ? 'Ver Video' : 'Abrir/Descargar'}
        </a>
        {/* Podríamos añadir más detalles o botones de acción aquí */}
    </div>
  );
}

export default FileItem;