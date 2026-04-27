// src/components/Admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import groupService from '../../services/groupService';
import Modal from '../Modal'; // Reutilizamos tu componente Modal

// Componente de formulario para editar usuario (lo crearemos después)
import UserForm from './UserForm';


function UserManagement() {
    const [users, setUsers] = useState([]);
    const [allGroups, setAllGroups] = useState([]); // Para mostrar grupos disponibles en el formulario
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para modales
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);

    // Estado para el usuario seleccionado en edición o eliminación
    const [selectedUser, setSelectedUser] = useState(null);

    // Estado para el formulario de usuario (edición)
     // Inicializar con estructura esperada, incluso si está vacío
    const [userFormData, setUserFormData] = useState({
         username: '',
         email: '',
         role: '',
         groups: [] // Array de IDs de grupo
    });
    const [isSubmitting, setIsSubmitting] = useState(false); // Para formularios
    const [formError, setFormError] = useState(null); // Errores específicos del formulario

     // Roles disponibles (hardcodeados por ahora, podrías obtenerlos del backend si tuvieras un endpoint para ello)
     const availableRoles = ['admin', 'docente', 'residente', 'usuario'];


    // --- Cargar usuarios y grupos ---
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Cargar todos los usuarios
            const usersData = await userService.getAllUsers();
            setUsers(usersData);

            // Cargar todos los grupos disponibles para la asignación
            const groupsData = await groupService.listGroups(); // Esta ya existe
            setAllGroups(groupsData);

        } catch (err) {
            console.error('Error cargando datos de admin:', err);
            setError(err.message || 'Error al cargar datos de administración.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Array de dependencias vacío para ejecutar solo al montar


    // --- Handlers de Modales ---

    const openEditModal = (user) => {
        setSelectedUser(user); // Guardar usuario a editar
        // Cargar datos del usuario al formulario, mapeando IDs de grupo si es necesario
        setUserFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            groups: (user.groups || []).map(group => group._id) // Cargar solo los IDs de grupo
        });
        setFormError(null);
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null); // Limpiar al cerrar
        setUserFormData({ username: '', email: '', role: '', groups: [] });
        setFormError(null);
    };

    const openDeleteConfirmModal = (user) => {
        setSelectedUser(user); // Guardar usuario a eliminar
         setFormError(null); // Limpiar errores de eliminación
        setIsDeleteConfirmModalOpen(true);
    };
    const closeDeleteConfirmModal = () => {
        setIsDeleteConfirmModalOpen(false);
        setSelectedUser(null); // Limpiar al cerrar
        setFormError(null);
    };


    // --- Handlers de Acciones (Editar, Eliminar) ---

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setFormError(null);
        setIsSubmitting(true);

         if (!selectedUser) {
             setFormError('Usuario no seleccionado para actualizar.');
             setIsSubmitting(false);
             return;
         }
         // Validaciones adicionales del formulario si son necesarias

        try {
            // Llama al servicio para actualizar usuario con los datos del formulario
            await userService.updateUser(selectedUser._id, userFormData);
            fetchData(); // Recargar la lista de usuarios y grupos
            closeEditModal(); // Cerrar modal
        } catch (err) {
            console.error(`Error actualizando usuario ${selectedUser?._id}:`, err);
            setFormError(err?.response?.data?.message || err?.message || 'Error al actualizar el usuario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async () => {
         if (!selectedUser) return;

         setFormError(null); // Limpiar errores de eliminación
         setIsSubmitting(true); // Usamos isSubmitting para el botón de eliminar también


         try {
             await userService.deleteUser(selectedUser._id);
             fetchData(); // Recargar la lista de usuarios y grupos
             closeDeleteConfirmModal(); // Cerrar modal de confirmación
         } catch (err) {
             console.error(`Error eliminando usuario ${selectedUser?._id}:`, err);
              // Mostrar error en el modal de confirmación
             setFormError(err?.response?.data?.message || err?.message || 'Error al eliminar el usuario.');
         } finally {
              setIsSubmitting(false);
         }

    };


    if (isLoading) {
        return <div className="text-center text-[var(--text-muted)]">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="status-error">Error: {error}</div>;
    }

    // Renderizar la tabla de usuarios
    return (
        <div>
            <h2 className="text-2xl text-[var(--text-main)]">Gestión de Usuarios</h2>
            <p className="mt-2 mb-6 text-sm text-[var(--text-muted)]">
                Administra accesos, roles y pertenencia a grupos desde una vista más limpia y fácil de revisar.
            </p>

             {/* Opcional: Botón para crear nuevo usuario si implementas esa función para admins */}
             {/* <button
                 onClick={openCreateModal}
                 className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none mb-6"
             >
                 Crear Nuevo Usuario
             </button> */}


            {/* Tabla de Usuarios */}
            <div className="app-table-shell">
                <table className="app-table">
                    <thead>
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th> {/* Editar, Eliminar */}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="whitespace-nowrap text-sm font-medium text-[var(--text-main)]">{user.username}</td>
                                <td className="whitespace-nowrap text-sm text-[var(--text-muted)]">{user.email}</td>
                                <td className="whitespace-nowrap text-sm text-[var(--text-muted)]">{user.role}</td>
                                <td className="whitespace-nowrap text-sm text-[var(--text-muted)]">
                                    {(user.groups || []).map(group => group.name).join(', ') || 'Ninguno'}
                                </td>
                                <td className="whitespace-nowrap text-right text-sm font-medium">
                                     {/* Botones de Editar y Eliminar */}
                                    <button onClick={() => openEditModal(user)} className="table-action mr-4">Editar</button>
                                    <button onClick={() => openDeleteConfirmModal(user)} className="table-action-danger">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* --- Modales --- */}

            {/* Modal Editar Usuario */}
             <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Editar Usuario: ${selectedUser?.username || ''}`}>
                  <UserForm
                      formData={userFormData}
                      setFormData={setUserFormData}
                      allGroups={allGroups} // Pasar todos los grupos disponibles
                      availableRoles={availableRoles} // Pasar roles disponibles
                      onSubmit={handleUpdateUser}
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
                          ¿Estás seguro de que quieres eliminar al usuario{" "}
                          <strong>"{selectedUser?.username}"</strong>?
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
                              onClick={handleDeleteUser}
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

export default UserManagement;
