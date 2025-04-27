import api from './api'; // Importa instancia Axios configurada

const getMe = async () => {
    try {
        const response = await api.get('/users/me'); // Llama al nuevo endpoint
        return response.data; // Devuelve los datos del usuario (incluye grupos)
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};

// --- NUEVO: Función para obtener todos los usuarios (Admin Only) ---
const getAllUsers = async () => {
    try {
        // Llama a la nueva ruta GET /api/users/
        const response = await api.get('/users');
        return response.data; // Espera un array de usuarios
    } catch (error) {
        console.error("Error fetching all users (Admin):", error);
        throw error; // Deja que el componente maneje el error
    }
};

// --- NUEVO: Función para obtener un usuario por ID (Admin Only) ---
const getUserById = async (userId) => {
     if (!userId) throw new Error("Se requiere userId.");
    try {
        // Llama a la nueva ruta GET /api/users/:id
        const response = await api.get(`/users/${userId}`);
        return response.data; // Espera el objeto de usuario
    } catch (error) {
        console.error(`Error fetching user ${userId} (Admin):`, error);
        throw error;
    }
};


// --- NUEVO: Función para actualizar un usuario (Admin Only) ---
// updateData puede contener { username, email, role, groups }
const updateUser = async (userId, updateData) => {
     if (!userId || !updateData) throw new Error("Se requiere userId y datos de actualización.");
    try {
        // Llama a la nueva ruta PUT /api/users/:id
        const response = await api.put(`/users/${userId}`, updateData);
        return response.data; // Espera el usuario actualizado
    } catch (error) {
        console.error(`Error updating user ${userId} (Admin):`, error);
        throw error;
    }
};

// --- NUEVO: Función para eliminar un usuario (Admin Only) ---
const deleteUser = async (userId) => {
     if (!userId) throw new Error("Se requiere userId.");
    try {
        // Llama a la nueva ruta DELETE /api/users/:id
        await api.delete(`/users/${userId}`);
        return true; // Indica éxito (la API devuelve 204 No Content)
    } catch (error) {
        console.error(`Error deleting user ${userId} (Admin):`, error);
        throw error;
    }
};

const userService = {
    getMe,
    getAllUsers, // Exportar nuevo servicio
    getUserById, // Exportar nuevo servicio
    updateUser, // Exportar nuevo servicio
    deleteUser // Exportar nuevo servicio
};

export default userService;