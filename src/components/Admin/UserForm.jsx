// src/components/Admin/UserForm.jsx
import React from 'react';

function UserForm({
    formData, // { username, email, role, groups }
    setFormData, // Setter para actualizar formData
    allGroups, // Array de todos los grupos disponibles [{ _id, name }]
    availableRoles, // Array de roles permitidos ['admin', 'docente', ...]
    onSubmit,
    onCancel,
    isLoading,
    error,
    submitButtonText = 'Guardar', // Texto del botón submit
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;
         // Para los campos de texto y select simple (role)
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleGroupsChange = (e) => {
        // Para el select múltiple de grupos
        const selectedOptions = Array.from(e.target.selectedOptions);
        const groupIds = selectedOptions.map(option => option.value);
        setFormData(prev => ({ ...prev, groups: groupIds }));
     };


    return (
        <form onSubmit={onSubmit}>
            {/* Nombre de Usuario (puede ser de solo lectura si no quieres que se cambie aquí) */}
            <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Usuario:
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                     // Puedes añadir readOnly={true} si no quieres permitir cambiarlo
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                     disabled={isLoading} // Deshabilitar mientras se guarda
                />
            </div>

            {/* Email (puede ser de solo lectura) */}
            <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email:
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                     // Puedes añadir readOnly={true} si no quieres permitir cambiarlo
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    required
                    disabled={isLoading} // Deshabilitar mientras se guarda
                />
            </div>


            {/* Rol del Usuario */}
            <div className="mb-4">
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Rol:
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                    disabled={isLoading} // Deshabilitar mientras se guarda
                >
                    <option value="">Selecciona un rol</option>
                    {availableRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>

             {/* Asignar Grupos (Select Múltiple) */}
            <div className="mb-4">
                <label htmlFor="userGroups" className="block text-sm font-medium text-gray-700 mb-1">
                    Asignar Grupos (Ctrl+Click para seleccionar varios):
                </label>
                <select
                    id="userGroups"
                    name="groups"
                    multiple // Habilita selección múltiple
                    value={formData.groups} // Espera un array de IDs seleccionados
                    onChange={handleGroupsChange} // Usa el handler específico para grupos
                     // Ajusta la altura según la cantidad de grupos
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white h-32"
                     disabled={isLoading} // Deshabilitar mientras se guarda
                >
                    {allGroups.map(group => (
                        <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                </select>
            </div>


            {/* Error */}
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Botones */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800 focus:outline-none ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {isLoading ? "Guardando..." : submitButtonText}
                </button>
            </div>
        </form>
    );
}

export default UserForm;