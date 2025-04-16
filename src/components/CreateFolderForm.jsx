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
    error // Mensaje de error (createFolderError de HomePage)
}) {
    return (
        <form onSubmit={onSubmit}>
            {/* Input Nombre */}
            <div className="mb-4">
                <label htmlFor="newFolderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Carpeta:
                </label>
                <input
                    type="text"
                    id="newFolderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoFocus
                />
            </div>
            {/* Selector de Grupo */}
            <div className="mb-4">
                <label htmlFor="createFolderGroup" className="block text-sm font-medium text-gray-700 mb-1">
                    Asignar a Grupo (Opcional):
                </label>
                <select
                    id="createFolderGroup"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="">Público (Ninguno)</option>
                    {groupsToShow?.map(group => (
                        <option key={group._id} value={group._id}>{group.name}</option>
                    ))}
                </select>
            </div>
            {/* Error */}
            {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
            )}
            {/* Botones */}
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
                    disabled={isLoading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? 'Creando...' : 'Crear Carpeta'}
                </button>
            </div>
        </form>
    );
}

export default CreateFolderForm;