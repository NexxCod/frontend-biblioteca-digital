// frontend/src/components/AddLinkForm.jsx
import React from 'react';

function AddLinkForm({
    linkUrl, setLinkUrl,
    linkTitle, setLinkTitle,
    linkDescription, setLinkDescription,
    linkTags, setLinkTags,
    linkGroupId, setLinkGroupId,
    groupsToShow,
    onSubmit, onCancel,
    isLoading, error
}) {
    return (
        <form onSubmit={onSubmit}>
            {/* URL */}
            <div className="mb-4"><label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">URL YouTube:</label><input type="url" id="linkUrl" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required placeholder="https://www.youtube.com/watch?v=..." className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            {/* Título */}
            <div className="mb-4"><label htmlFor="linkTitle" className="block text-sm font-medium text-gray-700 mb-1">Título:</label><input type="text" id="linkTitle" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            {/* Descripción */}
            <div className="mb-4"><label htmlFor="linkDesc" className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label><textarea id="linkDesc" value={linkDescription} onChange={(e) => setLinkDescription(e.target.value)} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea></div>
            {/* Tags */}
            <div className="mb-4"><label htmlFor="linkTags" className="block text-sm font-medium text-gray-700 mb-1">Etiquetas:</label><input type="text" id="linkTags" value={linkTags} onChange={(e) => setLinkTags(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            {/* Grupo */}
             <div className="mb-4"><label htmlFor="linkGroup" className="block text-sm font-medium text-gray-700 mb-1">Asignar Grupo:</label><select id="linkGroup" value={linkGroupId} onChange={(e) => setLinkGroupId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"><option value="">Público</option>{groupsToShow?.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}</select></div>
            {/* Error */}
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            {/* Botones */}
           <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} disabled={isLoading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none">Cancelar</button><button type="submit" disabled={isLoading} className={`px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-800 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>{isLoading ? 'Añadiendo...' : 'Añadir'}</button></div>
        </form>
    );
}

export default AddLinkForm;