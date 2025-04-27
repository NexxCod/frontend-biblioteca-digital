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

// --- NUEVO: Función para crear un nuevo grupo ---
const createGroup = async (groupData) => {
    // groupData debe ser un objeto { name: '...', description: '...' }
    if (!groupData || !groupData.name) throw new Error("Se requiere el nombre del grupo.");
   try {
       const response = await api.post('/groups', groupData);
       return response.data; // Devuelve el grupo creado
   } catch (error) {
       console.error("Error creando grupo:", error);
       throw error;
   }
};

// --- NUEVO: Función para actualizar un grupo ---
// updateData puede contener { name: '...', description: '...' }
const updateGroup = async (groupId, updateData) => {
    if (!groupId || !updateData) throw new Error("Se requiere groupId y datos de actualización.");
   try {
       const response = await api.put(`/groups/${groupId}`, updateData);
       return response.data; // Devuelve el grupo actualizado
   } catch (error) {
       console.error(`Error actualizando grupo ${groupId}:`, error);
       throw error;
   }
};

// --- NUEVO: Función para eliminar un grupo ---
const deleteGroup = async (groupId) => {
    if (!groupId) throw new Error("Se requiere groupId.");
   try {
       await api.delete(`/groups/${groupId}`);
       return true; // Indica éxito (la API devuelve 204 No Content)
   } catch (error) {
       console.error(`Error eliminando grupo ${groupId}:`, error);
       throw error;
   }
};

// --- NUEVO: Funciones para gestionar miembros (usadas en UserManagement, pero definidas aquí para coherencia del servicio de grupos) ---
// Aunque la lógica de añadir/quitar miembros actualiza tanto al usuario como al grupo en el backend,
// desde el frontend podrías optar por gestionar esto principalmente desde la vista de Usuarios.
// Sin embargo, definimos las funciones aquí por si las necesitas directamente.

const addMemberToGroup = async (groupId, userId) => {
    if (!groupId || !userId) throw new Error("Se requieren groupId y userId.");
   try {
       const response = await api.post(`/groups/${groupId}/members`, { userId });
       return response.data.group; // Devuelve el grupo actualizado (con memberCount actualizado por backend)
   } catch (error) {
       console.error(`Error añadiendo miembro ${userId} a grupo ${groupId}:`, error);
       throw error;
   }
};

const removeMemberFromGroup = async (groupId, userId) => {
    if (!groupId || !userId) throw new Error("Se requieren groupId y userId.");
   try {
       const response = await api.delete(`/groups/${groupId}/members/${userId}`);
        return response.data.group; // Devuelve el grupo actualizado
   } catch (error) {
       console.error(`Error quitando miembro ${userId} de grupo ${groupId}:`, error);
       throw error;
   }
};


const groupService = {
   listGroups,
   createGroup, // Exportar nuevo servicio
   updateGroup, // Exportar nuevo servicio
   deleteGroup, // Exportar nuevo servicio
   addMemberToGroup, // Exportar nuevo servicio
   removeMemberFromGroup // Exportar nuevo servicio
};

export default groupService;