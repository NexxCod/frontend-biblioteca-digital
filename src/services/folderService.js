import api from './api'; // Importa la instancia configurada de Axios

// Función para listar carpetas (raíz o subcarpetas)
// parentFolderId = null (o no presente) para carpetas raíz
const listFolders = async (parentFolderId = null) => {
    try {
        // Construye la URL con el query parameter si es necesario
        const url = parentFolderId
            ? `/folders?parentFolder=${parentFolderId}`
            : '/folders';

        // Usa la instancia 'api' que ya incluye el token si existe
        const response = await api.get(url);
        return response.data; // Devuelve el array de carpetas
    } catch (error) {
        console.error(`Error listando carpetas ${parentFolderId ? `para ${parentFolderId}` : 'raíz'}:`, error);
        // Re-lanza el error para que el componente lo maneje
        // El interceptor ya podría haber formateado el error
        throw error;
    }
};

// Podríamos añadir aquí funciones para createFolder, updateFolder, deleteFolder
// const createFolder = async (name, parentFolder = null, assignedGroupId = null) => { ... }

// --- NUEVA Función para Crear Carpeta ---
const createFolder = async (name, parentFolderId = null, assignedGroupId = null) => {
    try {
        const payload = {
            name,
            parentFolder: parentFolderId,
            // Solo incluimos assignedGroupId si tiene un valor (no es null o undefined)
            ...(assignedGroupId && { assignedGroupId })
        };
        // Usa la instancia 'api' que ya incluye el token
        const response = await api.post('/folders', payload);
        return response.data; // Devuelve la carpeta creada por el backend
    } catch (error) {
        console.error("Error creando carpeta:", error);
        // Re-lanza el error formateado por el interceptor o un error genérico
        throw error;
    }
};

// --- NUEVA Función para Obtener Detalles de Carpeta ---
const getFolderDetails = async (folderId) => {
    if (!folderId) {
         // No tiene sentido llamar sin ID, podría devolver null o lanzar error
         return null;
     }
    try {
        const response = await api.get(`/folders/${folderId}`);
        return response.data; // Devuelve el objeto de la carpeta
    } catch (error) {
        console.error(`Error obteniendo detalles para carpeta ${folderId}:`, error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// --- NUEVA Función para Eliminar Carpeta ---
const deleteFolder = async (folderId) => {
    if (!folderId) throw new Error("Se requiere folderId para eliminar carpeta.");
    try {
        // DELETE /api/folders/:id - Esperamos un status 204 No Content si tiene éxito
        await api.delete(`/folders/${folderId}`);
         // No devuelve nada en éxito (204)
    } catch (error) {
        console.error(`Error eliminando carpeta ${folderId}:`, error);
         // El backend podría devolver 400 si la carpeta no está vacía, el interceptor lo pasará
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// --- NUEVA Función para Actualizar Carpeta ---
const updateFolder = async (folderId, updateData) => {
    // updateData debe ser un objeto con los campos a cambiar, ej: { name: 'Nuevo Nombre', assignedGroupId: '...' }
    if (!folderId) throw new Error("Se requiere folderId para actualizar carpeta.");
    if (!updateData || Object.keys(updateData).length === 0) {
         // Evitar llamadas vacías
         console.warn("updateFolder llamado sin datos para actualizar.");
         return null; // O podrías devolver la carpeta sin cambios si la tuvieras
     }
    try {
        // PUT /api/folders/:id
        const response = await api.put(`/folders/${folderId}`, updateData);
        return response.data; // Devuelve la carpeta actualizada
    } catch (error) {
        console.error(`Error actualizando carpeta ${folderId}:`, error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// Exportamos las funciones del servicio
const folderService = {
    listFolders,
    createFolder,
    getFolderDetails,
    deleteFolder,
    updateFolder,
    // ...
};

export default folderService;