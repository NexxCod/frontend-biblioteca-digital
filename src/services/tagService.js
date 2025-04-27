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

// Podrías añadir aquí otras funciones si tuvieras endpoints para crear, actualizar o eliminar tags
// const createTag = async (tagName) => { ... }
// const updateTag = async (tagId, newName) => { ... }
// const deleteTag = async (tagId) => { ... }


// Exporta las funciones del servicio
const tagService = {
    listTags,
    // Incluye aquí las otras funciones si las añades
};

export default tagService;