// src/components/Admin/GroupForm.jsx
import React from 'react';

function GroupForm({
    formData, // { name, description }
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
            {/* Nombre del Grupo */}
            <div className="mb-4">
                <label htmlFor="groupName" className="field-label">
                    Nombre del Grupo:
                </label>
                <input
                    type="text"
                    id="groupName"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="app-input"
                    required
                    autoFocus
                />
            </div>

            {/* Descripción del Grupo (Opcional) */}
            <div className="mb-4">
                <label htmlFor="groupDescription" className="field-label">
                    Descripción (Opcional):
                </label>
                <textarea
                    id="groupDescription"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className="app-textarea"
                ></textarea>
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

export default GroupForm;
