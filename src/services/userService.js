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

const userService = {
    getMe,
};

export default userService;