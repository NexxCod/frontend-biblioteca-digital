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
                <label htmlFor="username" className="field-label">
                    Nombre de Usuario:
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                     // Puedes añadir readOnly={true} si no quieres permitir cambiarlo
                    className="app-input disabled:bg-gray-100"
                    required
                     disabled={isLoading} // Deshabilitar mientras se guarda
                />
            </div>

            {/* Email (puede ser de solo lectura) */}
            <div className="mb-4">
                <label htmlFor="email" className="field-label">
                    Email:
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                     // Puedes añadir readOnly={true} si no quieres permitir cambiarlo
                    className="app-input disabled:bg-gray-100"
                    required
                    disabled={isLoading} // Deshabilitar mientras se guarda
                />
            </div>


            {/* Rol del Usuario */}
            <div className="mb-4">
                <label htmlFor="role" className="field-label">
                    Rol:
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="app-select"
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
                <label htmlFor="userGroups" className="field-label">
                    Asignar Grupos (Ctrl+Click para seleccionar varios):
                </label>
                <select
                    id="userGroups"
                    name="groups"
                    multiple // Habilita selección múltiple
                    value={formData.groups} // Espera un array de IDs seleccionados
                    onChange={handleGroupsChange} // Usa el handler específico para grupos
                     // Ajusta la altura según la cantidad de grupos
                    className="app-select h-32"
                     disabled={isLoading} // Deshabilitar mientras se guarda
                >
                    {allGroups.map(group => (
                        <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                </select>
            </div>


            {/* Error */}
            {error && <p className="status-error mb-3">{error}</p>}

            {/* Botones */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="app-button-ghost"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`app-button-primary ${
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
