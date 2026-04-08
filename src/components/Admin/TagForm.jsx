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
                <label htmlFor="tagName" className="field-label">
                    Nombre de la Etiqueta:
                </label>
                <input
                    type="text"
                    id="tagName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="app-input"
                    required
                    autoFocus
                />
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

export default TagForm;
