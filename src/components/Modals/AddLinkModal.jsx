// src/components/Modals/AddLinkModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import AddLinkForm from '../AddLinkForm'; // El componente de formulario que ya tienes
import fileService from '../../services/fileService';

function AddLinkModal({ isOpen, onClose, targetFolderId, groupsToShow, onLinkAdded }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [linkTags, setLinkTags] = useState(''); // String separado por comas
  const [linkGroupId, setLinkGroupId] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLinkUrl('');
      setLinkTitle('');
      setLinkDescription('');
      setLinkTags('');
      setLinkGroupId('');
      setError('');
      setIsAddingLink(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim() || !linkTitle.trim() || !targetFolderId) {
      setError("La URL y el título son obligatorios. Asegúrate de que una carpeta esté seleccionada.");
      return;
    }
    // Validación simple de URL (puedes mejorarla con una regex más robusta)
    try {
        new URL(linkUrl.trim());
    } catch (_) {
        setError("La URL proporcionada no parece ser válida.");
        return;
    }

    setIsAddingLink(true);
    setError('');

    const payload = {
      url: linkUrl.trim(),
      title: linkTitle.trim(),
      description: linkDescription.trim(),
      tags: linkTags.trim(),
      folderId: targetFolderId,
      assignedGroupId: linkGroupId || null,
    };

    try {
      await fileService.addLink(payload);
      onLinkAdded(); // Callback para refrescar datos en HomePage
      onClose();     // Cierra el modal
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al añadir el enlace.");
    } finally {
      setIsAddingLink(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Enlace">
      <AddLinkForm
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkTitle={linkTitle}
        setLinkTitle={setLinkTitle}
        linkDescription={linkDescription}
        setLinkDescription={setLinkDescription}
        linkTags={linkTags}
        setLinkTags={setLinkTags}
        linkGroupId={linkGroupId}
        setLinkGroupId={setLinkGroupId}
        groupsToShow={groupsToShow}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isAddingLink}
        error={error}
        // submitButtonText="Añadir Enlace" // El form ya tiene un default
      />
    </Modal>
  );
}

export default AddLinkModal;