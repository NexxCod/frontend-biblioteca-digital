// src/components/Modals/EditItemModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import CreateFolderForm from '../CreateFolderForm'; // Para editar carpetas
import EditFileForm from '../EditFileForm';       // Para editar archivos/enlaces
import folderService from '../../services/folderService';
import fileService from '../../services/fileService';

function EditItemModal({ isOpen, onClose, itemToEdit, groupsToShow, onItemUpdated }) {
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && itemToEdit) {
      if (itemToEdit.type === "folder") {
        setFormData({
          name: itemToEdit.name || "",
          assignedGroupId: itemToEdit.assignedGroup?._id || "",
        });
      } else { // file, video_link, generic_link
        setFormData({
          filename: itemToEdit.filename || "",
          description: itemToEdit.description || "",
          tags: itemToEdit.tags?.map((tag) => tag.name).join(", ") || "",
          assignedGroupId: itemToEdit.assignedGroup?._id || "",
        });
      }
      setError('');
      setIsUpdating(false);
    } else if (!isOpen) {
        // Limpiar formData cuando se cierra para evitar mostrar datos antiguos brevemente si se reabre rápido
        setFormData({});
    }
  }, [isOpen, itemToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemToEdit) return;

    setIsUpdating(true);
    setError('');

    try {
      if (itemToEdit.type === "folder") {
        const folderUpdateData = {
          name: formData.name?.trim(),
          assignedGroupId: formData.assignedGroupId || null,
        };
        if (!folderUpdateData.name) {
            setError("El nombre de la carpeta no puede estar vacío.");
            setIsUpdating(false);
            return;
        }
        await folderService.updateFolder(itemToEdit._id, folderUpdateData);
      } else { // file or link
        const fileUpdateData = {
          filename: formData.filename?.trim(),
          description: formData.description?.trim(),
          tags: formData.tags?.trim(), // Backend espera un string de tags
          assignedGroupId: formData.assignedGroupId || null,
        };
         if (!fileUpdateData.filename) {
            setError("El nombre del archivo/enlace no puede estar vacío.");
            setIsUpdating(false);
            return;
        }
        await fileService.updateFile(itemToEdit._id, fileUpdateData);
      }
      onItemUpdated(); // Callback para refrescar
      onClose();       // Cerrar modal
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al guardar los cambios.");
    } finally {
      setIsUpdating(false);
    }
  };

  const title = itemToEdit?.type === "folder"
    ? `Editar Carpeta: ${itemToEdit?.name || ''}`
    : `Editar Archivo/Enlace: ${itemToEdit?.filename || ''}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {itemToEdit?.type === "folder" && (
        <CreateFolderForm
          folderName={formData.name || ''}
          setFolderName={(value) => setFormData((prev) => ({ ...prev, name: value }))}
          groupId={formData.assignedGroupId || ''}
          setGroupId={(value) => setFormData((prev) => ({ ...prev, assignedGroupId: value }))}
          groupsToShow={groupsToShow}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isUpdating}
          error={error}
          submitButtonText="Guardar Cambios"
          isEditing={true}
        />
      )}
      {(itemToEdit?.type === "file" || itemToEdit?.type === "video_link" || itemToEdit?.type === "generic_link") && (
        <EditFileForm
          formData={formData} // EditFileForm espera un objeto formData
          setFormData={setFormData} // Y un setter para todo el objeto
          groupsToShow={groupsToShow}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isUpdating}
          error={error}
          // submitButtonText="Guardar Cambios" // EditFileForm ya tiene su default
        />
      )}
    </Modal>
  );
}

export default EditItemModal;