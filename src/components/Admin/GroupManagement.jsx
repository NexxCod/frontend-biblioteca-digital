// src/components/Admin/GroupManagement.jsx
import React, { useState, useEffect } from 'react';
import groupService from '../../services/groupService';
import Modal from '../Modal'; // Reutilizamos tu componente Modal

// Componente de formulario para crear/editar grupo (lo crearemos después)
import GroupForm from './GroupForm';

function GroupManagement() {
    const [groups, setGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para modales
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

    // Estado para el grupo seleccionado en edición o eliminación
    const [selectedGroup, setSelectedGroup] = useState(null);

    // Estado para el formulario de grupo (creación o edición)
    const [groupFormData, setGroupFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false); // Para formularios
    const [formError, setFormError] = useState(null); // Errores específicos del formulario


    // --- Cargar grupos ---
    const fetchGroups = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const groupsData = await groupService.listGroups();
            setGroups(groupsData);
        } catch (err) {
            console.error('Error cargando grupos:', err);
            setError(err.message || 'Error al cargar grupos.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []); // Cargar al montar el componente


    // --- Handlers de Modales ---
    const openCreateModal = () => {
        setGroupFormData({ name: '', description: '' }); // Resetear formulario
        setFormError(null);
        setIsCreateModalOpen(true);
    };
    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setGroupFormData({ name: '', description: '' }); // Limpiar al cerrar
        setFormError(null);
    };

    const openEditModal = (group) => {
        setSelectedGroup(group); // Guardar grupo a editar
        setGroupFormData({ name: group.name, description: group.description || '' }); // Cargar datos al formulario
        setFormError(null);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedGroup(null); // Limpiar al cerrar
        setGroupFormData({ name: '', description: '' });
        setFormError(null);
    };

    const openDeleteConfirmModal = (group) => {
        setSelectedGroup(group); // Guardar grupo a eliminar
        setFormError(null); // Limpiar errores de eliminación previos
        setIsDeleteConfirmModalOpen(true);
    };
    const closeDeleteConfirmModal = () => {
        setIsDeleteConfirmModalOpen(false);
        setSelectedGroup(null); // Limpiar al cerrar
        setFormError(null);
    };


    // --- Handlers de Acciones (Crear, Editar, Eliminar) ---

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

        if (!groupFormData.name.trim()) {
            setFormError('El nombre del grupo es obligatorio.');
            setIsSubmitting(false);
            return;
        }

        try {
            await groupService.createGroup(groupFormData);
            fetchGroups(); // Recargar la lista de grupos
            closeCreateModal(); // Cerrar modal
        } catch (err) {
            console.error('Error creando grupo:', err);
            setFormError(err?.response?.data?.message || err?.message || 'Error al crear el grupo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

         if (!selectedGroup || !groupFormData.name.trim()) {
             setFormError('Faltan datos para actualizar.');
             setIsSubmitting(false);
             return;
         }


        try {
            await groupService.updateGroup(selectedGroup._id, groupFormData);
            fetchGroups(); // Recargar la lista de grupos
            closeEditModal(); // Cerrar modal
        } catch (err) {
            console.error(`Error actualizando grupo ${selectedGroup?._id}:`, err);
            setFormError(err?.response?.data?.message || err?.message || 'Error al actualizar el grupo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGroup = async () => {
         if (!selectedGroup) return;

         setFormError(null); // Limpiar errores de eliminación
         setIsSubmitting(true); // Usamos isSubmitting para el botón de eliminar también

         try {
             await groupService.deleteGroup(selectedGroup._id);
             fetchGroups(); // Recargar la lista de grupos
             closeDeleteConfirmModal(); // Cerrar modal de confirmación
         } catch (err) {
             console.error(`Error eliminando grupo ${selectedGroup?._id}:`, err);
              // Mostrar error en el modal de confirmación
             setFormError(err?.response?.data?.message || err?.message || 'Error al eliminar el grupo.');
         } finally {
              setIsSubmitting(false);
         }

    };


    if (isLoading) {
        return <div className="text-center">Cargando grupos...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">Error: {error}</div>;
    }


    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Gestión de Grupos</h2>

            {/* Botón para crear nuevo grupo */}
            <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none mb-6"
            >
                Crear Nuevo Grupo
            </button>

            {/* Tabla de Grupos */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miembros</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado Por</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groups.map((group) => (
                            <tr key={group._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{group.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.memberCount}</td> {/* Mostrar el conteo */}
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{group.createdBy?.username || 'N/A'}</td> {/* Mostrar nombre del creador */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(group)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => openDeleteConfirmModal(group)}
                                        className="text-red-600 hover:text-red-900"
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

            {/* Modal Crear Grupo */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Crear Nuevo Grupo">
                <GroupForm
                    formData={groupFormData}
                    setFormData={setGroupFormData}
                    onSubmit={handleCreateGroup}
                    onCancel={closeCreateModal}
                    isLoading={isSubmitting}
                    error={formError}
                    submitButtonText="Crear Grupo"
                />
            </Modal>

            {/* Modal Editar Grupo */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Editar Grupo: ${selectedGroup?.name || ''}`}>
                 <GroupForm
                    formData={groupFormData}
                    setFormData={setGroupFormData}
                    onSubmit={handleUpdateGroup}
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
                        ¿Estás seguro de que quieres eliminar el grupo{" "}
                        <strong>"{selectedGroup?.name}"</strong>?
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
                            onClick={handleDeleteGroup}
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

export default GroupManagement;