// src/components/Modals/UploadFileModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import UploadFileForm from '../UploadFileForm';
import fileService from '../../services/fileService';

function UploadFileModal({ isOpen, onClose, targetFolderId, groupsToShow, onFileUploaded }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [hasFileSelected, setHasFileSelected] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState(''); // String separado por comas
  const [groupId, setGroupId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setUploadFile(null);
      setHasFileSelected(false);
      setDescription('');
      setTags('');
      setGroupId('');
      setError('');
      setUploadProgress(0);
      setIsUploading(false);
      // Limpiar el input file visualmente (esto es un poco un truco, puede no funcionar en todos los navegadores o configuraciones)
      const fileInput = document.getElementById('fileUpload'); // Asumiendo que tu input tiene id="fileUpload"
      if (fileInput) {
        fileInput.value = "";
      }
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setHasFileSelected(true);
      setError('');
    } else {
      setUploadFile(null);
      setHasFileSelected(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !targetFolderId) {
      setError("Selecciona un archivo. Asegúrate de que una carpeta esté seleccionada para la subida.");
      return;
    }
    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("folderId", targetFolderId);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    if (groupId) formData.append("assignedGroupId", groupId);

    try {
      await fileService.uploadFile(formData, (progress) => setUploadProgress(progress));
      onFileUploaded();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Error al subir el archivo.");
      setUploadProgress(0); // Reset progress on error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Subir Nuevo Archivo">
      <UploadFileForm
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
        groupId={groupId}
        setGroupId={setGroupId}
        groupsToShow={groupsToShow}
        onFileChange={handleFileChange} // El formulario necesita este handler
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isUploading}
        error={error}
        hasFileSelected={hasFileSelected} // El formulario lo usa para habilitar/deshabilitar el submit
        uploadProgress={uploadProgress}
      />
    </Modal>
  );
}

export default UploadFileModal;