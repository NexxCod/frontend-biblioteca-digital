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

// --- NUEVA Función para Añadir Enlace de Video ---
// Recibe el payload como objeto JSON
const addVideoLink = async (payload) => {
    try {
        const response = await api.post('/files/add-link', payload);
        return response.data; // Devuelve el registro del enlace creado
    } catch (error) {
        console.error("Error añadiendo enlace:", error);
        throw error;
    }
};

// Podríamos añadir aquí funciones para uploadFile, addVideoLink, updateFile, deleteFile
// usando la instancia 'api'



const fileService = {
    listFiles,
    uploadFile, 
    addVideoLink,
};

export default fileService;