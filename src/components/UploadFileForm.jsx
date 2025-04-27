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
    // Determinar si mostrar la barra (ej: solo cuando está subiendo y el progreso es > 0 y < 100)
     // La barra se mostrará desde que empieza la subida (isLoading=true) hasta que termina (isLoading=false).
     // Podemos añadir condición de > 0 para que no aparezca hasta el primer reporte de progreso.
     const showProgressBar = isLoading && uploadProgress > 0 && uploadProgress < 100;
     // Mostrar 100% brevemente al final si quieres
    const showCompleted = !isLoading && uploadProgress === 100;

    return (
        <form onSubmit={onSubmit}>
            {/* Input Archivo */}
            <div className="mb-4">
                 <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-1">Archivo:</label>
                 <input type="file" id="fileUpload" onChange={onFileChange} required
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>

        {/* --- BARRA DE PROGRESO DE SUBIDA (NUEVO) --- */}
        {(showProgressBar || showCompleted) && (
                <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 relative overflow-hidden"> {/* relative y overflow-hidden para texto centrado */}
                     <div
                         className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                         style={{ width: `${uploadProgress}%` }} // Controla el ancho
                     ></div>
                     {/* Opcional: Texto del porcentaje centrado */}
                     {/*
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-800 font-bold">
                        {uploadProgress}%
                     </div>
                     */}
                </div>
            )}
            {/* --- FIN BARRA DE PROGRESO --- */}

            {/* Mensaje de "Subiendo..." o "Subido!" */}
            {isLoading && uploadProgress > 0 && <p className="text-sm text-center text-blue-600 mb-3">Subiendo: {uploadProgress}%</p>}
             {showCompleted && <p className="text-sm text-center text-green-600 mb-3">Subida completa!</p>}


            {/* Descripción */}
             <div className="mb-4">
                <label htmlFor="uploadDesc" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional):</label>
                <textarea id="uploadDesc" value={description} onChange={(e) => setDescription(e.target.value)} rows="2"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
            </div>
            {/* Tags */}
             <div className="mb-4">
                <label htmlFor="uploadTags" className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (Opcional, separadas por coma):</label>
                <input type="text" id="uploadTags" value={tags} onChange={(e) => setTags(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            {/* Grupo */}
             <div className="mb-4">
                <label htmlFor="uploadGroup" className="block text-sm font-medium text-gray-700 mb-1">Asignar a Grupo (Opcional):</label>
                <select id="uploadGroup" value={groupId} onChange={(e) => setGroupId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white">
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
                <button type="submit" disabled={!hasFileSelected || isLoading} className={`px-4 py-2 text-white bg-green-600 rounded hover:bg-green-800 focus:outline-none ${!hasFileSelected ? 'opacity-50 cursor-not-allowed' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoading ? 'Subiendo...' : 'Subir Archivo'}
                </button>
            </div>
        </form>
    );
}

export default UploadFileForm;