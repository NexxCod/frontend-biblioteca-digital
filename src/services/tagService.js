// frontend/src/services/tagService.js
import api from './api'; // Importa la instancia configurada de Axios

// Función para listar todas las etiquetas disponibles
const listTags = async () => {
    try {
        // Realiza una petición GET al endpoint de tags
        // La instancia 'api' ya incluye la lógica para añadir el token de autenticación
        const response = await api.get('/tags');

        // Devuelve los datos de la respuesta (se espera un array de tags)
        return response.data;
    } catch (error) {
        console.error('Error en servicio de tags - listTags:', error);
        // Puedes lanzar el error para que el componente que llama lo maneje,
        // o devolver un array vacío o null dependiendo de cómo quieras gestionarlo.
        // Lanzar el error es generalmente mejor para manejarlo centralizadamente en los componentes.
        throw error;
    }
};

// --- NUEVO: Función para crear una nueva etiqueta ---
const createTag = async (tagData) => {
    // tagData debe ser un objeto { name: '...' }
     if (!tagData || !tagData.name) throw new Error("Se requiere el nombre de la etiqueta.");
   try {
       const response = await api.post('/tags', tagData);
       return response.data; // Devuelve la etiqueta creada
   } catch (error) {
       console.error("Error creando etiqueta:", error);
       throw error;
   }
};

// --- NUEVO: Función para actualizar una etiqueta ---
// updateData debe ser un objeto { name: '...' }
const updateTag = async (tagId, updateData) => {
    if (!tagId || !updateData || !updateData.name) throw new Error("Se requiere tagId y el nuevo nombre.");
   try {
       const response = await api.put(`/tags/${tagId}`, updateData);
       return response.data; // Devuelve la etiqueta actualizada
   } catch (error) {
       console.error(`Error actualizando etiqueta ${tagId}:`, error);
       throw error;
   }
};

// --- NUEVO: Función para eliminar una etiqueta ---
const deleteTag = async (tagId) => {
    if (!tagId) throw new Error("Se requiere tagId.");
   try {
       await api.delete(`/tags/${tagId}`);
       return true; // Indica éxito (la API devuelve 204 No Content)
   } catch (error) {
       console.error(`Error eliminando etiqueta ${tagId}:`, error);
       throw error;
   }
};


const tagService = {
   listTags,
   createTag, // Exportar nuevo servicio
   updateTag, // Exportar nuevo servicio
   deleteTag, // Exportar nuevo servicio
};

export default tagService;