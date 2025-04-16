import axios from 'axios';

// Define la URL base de tu API backend
// Asegúrate que el puerto coincida con el de tu backend (5000 por defecto)
// En producción, esta sería la URL de tu backend desplegado.
const API_URL = 'http://localhost:5000/api/users';

// Función para registrar un usuario
const register = async (username, email, password) => {
    try {
        // Hacemos la petición POST al endpoint de registro
        const response = await axios.post(`${API_URL}/register`, {
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
        const response = await axios.post(`${API_URL}/login`, {
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