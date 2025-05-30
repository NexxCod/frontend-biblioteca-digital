// src/components/Admin/TagForm.jsx
import React from 'react';

function TagForm({
    formData, // { name }
    setFormData, // Setter para actualizar formData
    onSubmit,
    onCancel,
    isLoading,
    error,
    submitButtonText = 'Guardar', // Texto del botón submit
}) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Nombre de la Etiqueta */}
            <div className="mb-4">
                <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Etiqueta:
                </label>
                <input
                    type="text"
                    id="tagName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    autoFocus
                />
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

export default TagForm;