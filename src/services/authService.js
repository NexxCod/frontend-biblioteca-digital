import axios from 'axios';
import api from './api';


// Función para registrar un usuario
const register = async (username, email, password) => {
    try {
        // Hacemos la petición POST al endpoint de registro
        const response = await api.post(`/users/register`, {
            username,
            email,
            password,
        });
        // Si el backend responde con datos (como hicimos), los devolvemos.
        // Asumimos que devuelve { user_data..., token }
        return response.data;
    } catch (error) {
        // Si hay un error (ej: 400, 500), axios lo lanzará.
        // Podríamos manejarlo aquí o dejar que se maneje donde se llama la función.
        // Por ahora, lanzamos el error para que AuthContext lo capture.
        console.error("Error en servicio de registro:", error.response?.data || error.message);
        throw error.response?.data || new Error('Error desconocido en el registro');
    }
};

// Función para iniciar sesión
const login = async (email, password) => {
    try {
        // Hacemos la petición POST al endpoint de login
        const response = await api.post(`/users/login`, {
            email,
            password,
        });
        // Devolvemos los datos de la respuesta (que incluyen usuario y token)
        return response.data;
    } catch (error) {
        console.error("Error en servicio de login:", error.response?.data || error.message);
        throw error.response?.data || new Error('Error desconocido en el login');
    }
};

// Podríamos añadir aquí una función para verificar token si tuviéramos ese endpoint
// const verifyToken = async (token) => { ... }

// Exportamos las funciones del servicio
const authService = {
    register,
    login,
    // verifyToken
};

export default authService;