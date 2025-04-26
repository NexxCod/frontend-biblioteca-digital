// src/components/EditFileForm.jsx
import React from 'react';

function EditFileForm({
    formData, // Objeto con { filename, description, tags, assignedGroupId }
    setFormData, // Función para actualizar formData en HomePage
    groupsToShow,
    onSubmit,
    onCancel,
    isLoading,
    error
}) {

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Nombre/Título */}
            <div className="mb-4">
                <label htmlFor="editFilename" className="block text-sm font-medium text-gray-700 mb-1">Nombre/Título:</label>
                <input
                    type="text"
                    id="editFilename"
                    name="filename" // Nombre del campo debe coincidir con la clave en formData
                    value={formData.filename || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

             {/* Descripción */}
             <div className="mb-4">
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional):</label>
                <textarea
                    id="editDescription"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>

             {/* Tags */}
             <div className="mb-4">
                <label htmlFor="editTags" className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (Opcional, separadas por coma):</label>
                <input
                    type="text"
                    id="editTags"
                    name="tags"
                    value={formData.tags || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                 />
            </div>

             {/* Grupo */}
             <div className="mb-4">
                <label htmlFor="editGroupId" className="block text-sm font-medium text-gray-700 mb-1">Asignar a Grupo (Opcional):</label>
                <select
                    id="editGroupId"
                    name="assignedGroupId"
                    value={formData.assignedGroupId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                     <option value="">Público (Ninguno)</option>
                     {groupsToShow?.map(group => (
                        <option key={group._id} value={group._id}>{group.name}</option>
                     ))}
                 </select>
             </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            {/* Botones */}
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none">Cancelar</button>
                <button type="submit" disabled={isLoading} className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
        </form>
    );
}

export default EditFileForm;