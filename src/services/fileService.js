import api from './api'; // Importa la instancia configurada de Axios

// Función para listar archivos (filtrando por carpeta y otros criterios opcionales)
// params: objeto opcional con filtros { fileType, tags, startDate, endDate, search }
const listFiles = async (folderId, params = {}) => {
    if (!folderId) {
        // En este contexto, siempre deberíamos tener un folderId para listar archivos
        // Podríamos lanzar un error o devolver un array vacío
        console.error("listFiles requiere un folderId");
        return [];
        // throw new Error("Se requiere folderId para listar archivos.");
    }
    try {
        // Construye los query parameters, empezando por el folderId obligatorio
        const queryParams = new URLSearchParams({ folderId, ...params });

        // Elimina parámetros vacíos o nulos si es necesario
        for (let key in params) {
            if (!params[key]) {
                queryParams.delete(key);
            }
        }

        const url = `/files?${queryParams.toString()}`;
        const response = await api.get(url);
        return response.data; // Devuelve el array de archivos/enlaces
    } catch (error) {
        console.error(`Error listando archivos para carpeta ${folderId}:`, error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// --- NUEVA Función para Subir Archivo ---
// Recibe un objeto FormData
const uploadFile = async (formData) => {
    try {
        // Al enviar FormData, Axios establece automáticamente
        // Content-Type: multipart/form-data
        const response = await api.post('/files/upload', formData, {
            // Opcional: Configuración para progreso de subida si se implementa
            // onUploadProgress: progressEvent => { ... }
        });
        return response.data; // Devuelve el registro del archivo creado
    } catch (error) {
        console.error("Error subiendo archivo:", error);
        throw error;
    }
};

// --- NUEVA Función para Añadir Enlace ---
// Recibe el payload como objeto JSON
const addLink = async (payload) => {
    try {
        const response = await api.post('/files/add-link', payload);
        return response.data; // Devuelve el registro del enlace creado
    } catch (error) {
        console.error("Error añadiendo enlace:", error);
        throw error;
    }
};

// --- NUEVA Función para Eliminar Archivo ---
const deleteFile = async (fileId) => {
    if (!fileId) throw new Error("Se requiere fileId para eliminar archivo.");
    try {
        // DELETE /api/files/:id - Esperamos un status 204 No Content si tiene éxito
        await api.delete(`/files/${fileId}`);
        // No devuelve nada en éxito (204)
    } catch (error) {
        console.error(`Error eliminando archivo ${fileId}:`, error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};

// --- NUEVA Función para Actualizar Archivo/Enlace ---
const updateFile = async (fileId, updateData) => {
    // updateData: { filename: '...', description: '...', tags: '...', assignedGroupId: '...' }
    if (!fileId) throw new Error("Se requiere fileId para actualizar archivo/enlace.");
     if (!updateData || Object.keys(updateData).length === 0) {
         console.warn("updateFile llamado sin datos para actualizar.");
         return null;
     }
    try {
         // PUT /api/files/:id
        const response = await api.put(`/files/${fileId}`, updateData);
        return response.data; // Devuelve el archivo/enlace actualizado
    } catch (error) {
        console.error(`Error actualizando archivo/enlace ${fileId}:`, error);
        throw error; // Re-lanza para que el componente lo maneje
    }
};



const fileService = {
    listFiles,
    uploadFile, 
    addLink,
    deleteFile,
    updateFile,
};

export default fileService;