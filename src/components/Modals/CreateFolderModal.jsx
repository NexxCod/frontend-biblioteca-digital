// src/components/Modals/CreateFolderModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; // Tu componente Modal genérico
import CreateFolderForm from '../CreateFolderForm'; // El componente de formulario que ya tienes
import folderService from '../../services/folderService';

function CreateFolderModal({ isOpen, onClose, parentFolderId, groupsToShow, onFolderCreated }) {
  const [folderName, setFolderName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Resetear el formulario cuando el modal se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setGroupId('');
      setError('');
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError("El nombre de la carpeta no puede estar vacío.");
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await folderService.createFolder(folderName, parentFolderId, groupId || null);
      onFolderCreated(); // Llama al callback para refrescar datos en HomePage
      onClose();         // Cierra el modal
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo crear la carpeta.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Carpeta">
      <CreateFolderForm
        folderName={folderName}
        setFolderName={setFolderName}
        groupId={groupId}
        setGroupId={setGroupId}
        groupsToShow={groupsToShow}
        onSubmit={handleSubmit}
        onCancel={onClose} // El botón cancelar del form llama directamente a onClose
        isLoading={isCreating}
        error={error}
        submitButtonText="Crear Carpeta"
        isEditing={false} // Este formulario es solo para crear
      />
    </Modal>
  );
}

export default CreateFolderModal;