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

// Exportamos las funciones del servicio
const folderService = {
    listFolders,
    createFolder,
    // ...
};

export default folderService;