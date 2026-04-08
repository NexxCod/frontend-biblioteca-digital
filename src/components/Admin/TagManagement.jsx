// src/components/Admin/TagManagement.jsx
import React, { useState, useEffect } from 'react';
import tagService from '../../services/tagService';
import Modal from '../Modal'; // Reutilizamos tu componente Modal

// Componente de formulario para crear/editar etiqueta (lo crearemos después)
import TagForm from './TagForm';


function TagManagement() {
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

    // Estado para la etiqueta seleccionada en edición o eliminación
    const [selectedTag, setSelectedTag] = useState(null);

    // Estado para el formulario de etiqueta (creación o edición)
    const [tagFormData, setTagFormData] = useState({ name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false); // Para formularios
    const [formError, setFormError] = useState(null); // Errores específicos del formulario


    // --- Cargar etiquetas ---
    const fetchTags = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const tagsData = await tagService.listTags();
            setTags(tagsData);
        } catch (err) {
            console.error('Error cargando etiquetas:', err);
            setError(err.message || 'Error al cargar etiquetas.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []); // Cargar al montar el componente


    // --- Handlers de Modales ---
    const openCreateModal = () => {
        setTagFormData({ name: '' }); // Resetear formulario
        setFormError(null);
        setIsCreateModalOpen(true);
    };
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setTagFormData({ name: '' }); // Limpiar al cerrar
        setFormError(null);
    };

    const openEditModal = (tag) => {
        setSelectedTag(tag); // Guardar etiqueta a editar
        setTagFormData({ name: tag.name }); // Cargar datos al formulario
        setFormError(null);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTag(null); // Limpiar al cerrar
        setTagFormData({ name: '' });
        setFormError(null);
    };

    const openDeleteConfirmModal = (tag) => {
        setSelectedTag(tag); // Guardar etiqueta a eliminar
         setFormError(null); // Limpiar errores de eliminación
        setIsDeleteConfirmModalOpen(true);
    };
    const closeDeleteConfirmModal = () => {
        setIsDeleteConfirmModalOpen(false);
        setSelectedTag(null); // Limpiar al cerrar
        setFormError(null);
    };


    // --- Handlers de Acciones (Crear, Editar, Eliminar) ---

    const handleCreateTag = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        if (!tagFormData.name.trim()) {
            setFormError('El nombre de la etiqueta es obligatorio.');
            setIsSubmitting(false);
            return;
        }

        try {
            await tagService.createTag(tagFormData);
            fetchTags(); // Recargar la lista de etiquetas
            closeCreateModal(); // Cerrar modal
        } catch (err) {
            console.error('Error creando etiqueta:', err);
            setFormError(err?.response?.data?.message || err?.message || 'Error al crear la etiqueta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTag = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

         if (!selectedTag || !tagFormData.name.trim()) {
             setFormError('Faltan datos para actualizar.');
             setIsSubmitting(false);
             return;
         }

        try {
            await tagService.updateTag(selectedTag._id, tagFormData);
            fetchTags(); // Recargar la lista de etiquetas
            closeEditModal(); // Cerrar modal
        } catch (err) {
            console.error(`Error actualizando etiqueta ${selectedTag?._id}:`, err);
            setFormError(err?.response?.data?.message || err?.message || 'Error al actualizar la etiqueta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTag = async () => {
         if (!selectedTag) return;

         setFormError(null); // Limpiar errores de eliminación
         setIsSubmitting(true); // Usamos isSubmitting para el botón de eliminar también


         try {
             await tagService.deleteTag(selectedTag._id);
             fetchTags(); // Recargar la lista de etiquetas
             closeDeleteConfirmModal(); // Cerrar modal de confirmación
         } catch (err) {
             console.error(`Error eliminando etiqueta ${selectedTag?._id}:`, err);
              // Mostrar error en el modal de confirmación
             setFormError(err?.response?.data?.message || err?.message || 'Error al eliminar la etiqueta.');
         } finally {
              setIsSubmitting(false);
         }

    };


    if (isLoading) {
        return <div className="text-center text-[var(--text-muted)]">Cargando etiquetas...</div>;
    }

    if (error) {
        return <div className="status-error">Error: {error}</div>;
    }


    return (
        <div>
            <h2 className="text-2xl text-[var(--text-main)]">Gestión de Etiquetas</h2>
            <p className="mt-2 mb-6 text-sm text-[var(--text-muted)]">
                Ordena la clasificación del contenido con una vista más simple y centrada en mantenimiento rápido.
            </p>

            {/* Botón para crear nueva etiqueta */}
            <button
                onClick={openCreateModal}
                className="app-button-primary mb-6"
            >
                Crear Nueva Etiqueta
            </button>

            {/* Tabla de Etiquetas */}
            <div className="app-table-shell">
                <table className="app-table">
                    <thead>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado Por</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tags.map((tag) => (
                            <tr key={tag._id}>
                                <td className="whitespace-nowrap text-sm font-medium text-[var(--text-main)]">{tag.name}</td>
                                <td className="whitespace-nowrap text-sm text-[var(--text-muted)]">{tag.createdBy?.username || 'N/A'}</td> {/* Mostrar nombre del creador */}
                                <td className="whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(tag)}
                                        className="table-action mr-4"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirmModal(tag)}
                                        className="table-action-danger"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* --- Modales --- */}

            {/* Modal Crear Etiqueta */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Crear Nueva Etiqueta">
                <TagForm
                    formData={tagFormData}
                    setFormData={setTagFormData}
                    onSubmit={handleCreateTag}
                    onCancel={closeCreateModal}
                    isLoading={isSubmitting}
                    error={formError}
                    submitButtonText="Crear Etiqueta"
                />
            </Modal>

            {/* Modal Editar Etiqueta */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Editar Etiqueta: ${selectedTag?.name || ''}`}>
                 <TagForm
                    formData={tagFormData}
                    setFormData={setTagFormData}
                    onSubmit={handleUpdateTag}
                    onCancel={closeEditModal}
                    isLoading={isSubmitting}
                    error={formError}
                    submitButtonText="Guardar Cambios"
                />
            </Modal>

            {/* Modal Confirmar Eliminación */}
            <Modal isOpen={isDeleteConfirmModalOpen} onClose={closeDeleteConfirmModal} title="Confirmar Eliminación">
                <div className="text-center">
                    <p className="mb-4">
                        ¿Estás seguro de que quieres eliminar la etiqueta{" "}
                        <strong>"{selectedTag?.name}"</strong>?
                    </p>
                     {formError && ( // Mostrar error si hay un problema al eliminar
                        <p className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{formError}</p>
                     )}
                    <div className="flex justify-center gap-4">
                        <button
                            type="button"
                            onClick={closeDeleteConfirmModal}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteTag}
                            disabled={isSubmitting}
                            className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-800 focus:outline-none ${
                                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            {isSubmitting ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}

export default TagManagement;
