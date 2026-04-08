// frontend/src/components/UploadFileForm.jsx
import React from 'react';

function UploadFileForm({
    description, setDescription,
    tags, setTags,
    groupId, setGroupId,
    groupsToShow,
    onFileChange, // Handler para el input file
    onSubmit, onCancel,
    isLoading, error,
    hasFileSelected, uploadProgress // Booleano para habilitar/deshabilitar submit
}) {
     const showProgressBar = isLoading && uploadProgress > 0 && uploadProgress < 100;
    const showCompleted = !isLoading && uploadProgress === 100;

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="mb-4">
                 <label htmlFor="fileUpload" className="field-label">Archivo</label>
                 <input
                    type="file"
                    id="fileUpload"
                    onChange={onFileChange}
                    required
                    className="app-file-input"
                  />
            </div>

        {(showProgressBar || showCompleted) && (
                <div className="mb-4 w-full overflow-hidden rounded-full bg-[rgba(24,49,45,0.1)] h-2.5">
                     <div
                         className="h-2.5 rounded-full bg-[var(--brand)] transition-all duration-300 ease-out"
                         style={{ width: `${uploadProgress}%` }}
                     ></div>
                </div>
            )}

            {isLoading && uploadProgress > 0 && <p className="text-sm text-[var(--brand)]">Subiendo: {uploadProgress}%</p>}
             {showCompleted && <p className="text-sm text-[#1f5f4f]">Subida completa.</p>}

             <div className="mb-4">
                <label htmlFor="uploadDesc" className="field-label">Descripción</label>
                <textarea
                  id="uploadDesc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="app-textarea"
                ></textarea>
            </div>
             <div className="mb-4">
                <label htmlFor="uploadTags" className="field-label">Etiquetas</label>
                <input
                  type="text"
                  id="uploadTags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Separadas por coma"
                  className="app-input"
                />
            </div>
             <div className="mb-4">
                <label htmlFor="uploadGroup" className="field-label">Grupo</label>
                <select
                  id="uploadGroup"
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
            {error && <p className="status-error mb-3">{error}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onCancel} disabled={isLoading} className="app-button-ghost">Cancelar</button>
                <button type="submit" disabled={!hasFileSelected || isLoading} className={`app-button-primary ${!hasFileSelected ? 'opacity-50 cursor-not-allowed' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? 'Subiendo...' : 'Subir Archivo'}
                </button>
            </div>
        </form>
    );
}

export default UploadFileForm;
