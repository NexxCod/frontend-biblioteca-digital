// src/components/Modals/ConfirmDeleteModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import fileService from '../../services/fileService';
import folderService from '../../services/folderService';

function ConfirmDeleteModal({ isOpen, onClose, itemToDelete, onItemDeleted, onDeletionError }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(''); // Error específico de este modal

  useEffect(() => {
    if (isOpen) {
      setError(''); // Limpiar error al abrir
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    setError('');

    try {
      if (itemToDelete.type === "file") {
        await fileService.deleteFile(itemToDelete._id);
      } else if (itemToDelete.type === "folder") {
        await folderService.deleteFolder(itemToDelete._id);
      }
      onItemDeleted(); // Llama al callback para refrescar datos en HomePage
      onClose();       // Cierra el modal
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || "Error al eliminar el elemento.";
      setError(errorMessage);
      if (onDeletionError) { // Opcional: notificar a HomePage sobre el error
        onDeletionError(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Eliminación">
      <div className="text-center">
        <p className="mb-4">
          ¿Estás seguro de que quieres eliminar el {itemToDelete?.type === 'folder' ? 'la carpeta' : 'el archivo'}{" "}
          <strong>"{itemToDelete?.name || itemToDelete?.filename}"</strong>?
        </p>
        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>
        )}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={onClose} // El botón cancelar del form llama directamente a onClose
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800 focus:outline-none ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;