// frontend/src/components/CreateFolderForm.jsx
import React from 'react';

function CreateFolderForm({
    folderName, // Valor actual del nombre
    setFolderName, // Función para actualizar el nombre
    groupId, // Valor actual del grupo seleccionado
    setGroupId, // Función para actualizar el grupo
    groupsToShow, // Array de grupos a mostrar en el select
    onSubmit, // Función a llamar al hacer submit (handleCreateFolderSubmit de HomePage)
    onCancel, // Función para cerrar/cancelar (closeCreateFolderModal de HomePage)
    isLoading, // Booleano para estado de carga (isCreatingFolder de HomePage)
    error, // Mensaje de error (createFolderError de HomePage)
    submitButtonText = 'Crear Carpeta', // Valor por defecto
    isEditing = false // Valor por defecto
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="mb-4">
                <label htmlFor="newFolderName" className="field-label">
                    Nombre
                </label>
                <input
                    type="text"
                    id="newFolderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="app-input"
                    required
                    autoFocus={!isEditing}
                />
            </div>
            <div className="mb-4">
                <label htmlFor="createFolderGroup" className="field-label">
                    Grupo
                </label>
                <select
                    id="createFolderGroup"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="app-select"
                >
                    <option value="">Público</option>
                    {groupsToShow?.map(group => (
                        <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                </select>
            </div>
            {error && (
                <p className="status-error mb-3">{error}</p>
            )}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="app-button-ghost"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`app-button-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (isEditing ? 'Guardando...' : 'Creando...') : submitButtonText}
                </button>
            </div>
        </form>
    );
}

export default CreateFolderForm;
