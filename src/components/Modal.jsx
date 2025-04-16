import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Manejar clic fuera del contenido del modal para cerrar
  const handleBackdropClick = (e) => {
    // Si el clic fue directamente en el fondo (backdrop)
    if (e.target === e.currentTarget) {
      onClose(); // Llama a la función de cierre pasada como prop
    }
  };

  return (
    // Fondo semi-transparente que cubre toda la pantalla
    <div
        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center"
        onClick={handleBackdropClick} // Cierra al hacer clic fuera
    >
      {/* Contenedor del Modal */}
      <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        {/* Cabecera del Modal */}
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onClose} // Botón para cerrar el modal
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            {/* Icono 'X' */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Contenido del Modal (lo que pasemos como children) */}
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;