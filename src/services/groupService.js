import api from './api'; // Importa la instancia configurada de Axios

// Función para listar todos los grupos (requiere token de admin si la ruta está protegida así)
// Nota: Si quieres que cualquier usuario logueado pueda ver los grupos a los que asignar,
// asegúrate que el endpoint GET /api/groups requiera solo 'protect' y no 'admin'.
// Si GET /api/groups requiere admin, esta llamada fallará para no-admins.
// Asumiremos por ahora que GET /api/groups es accesible para usuarios logueados (solo 'protect').
// Si no, necesitaríamos otro endpoint o ajustar permisos en backend.
const listGroups = async () => {
    try {
        const response = await api.get('/groups');
        return response.data; // Devuelve el array de grupos
    } catch (error) {
        console.error("Error listando grupos:", error);
        // Devuelve array vacío o lanza error según prefieras manejarlo en el componente
        // throw error;
        return []; // Devolver array vacío puede ser más seguro para el UI
    }
};

const groupService = {
    listGroups,
    // Aquí irían createGroup, addMember, etc., si el frontend los necesitara
};

export default groupService;