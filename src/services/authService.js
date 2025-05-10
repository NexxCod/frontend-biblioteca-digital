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
      
        return response.data;
    }  catch (error) {
        console.error("Error en authService.register:", error);
        throw error;
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
        throw error || new Error('Error desconocido en el login');
    }
};

const verifyEmail = async (token) => {
    try {
        const response = await api.get(`/users/verify-email/${token}`);
        return response.data; // Espera { message: '...' }
    } catch (error) {
        console.error("Error en servicio de verificación de email:", error.response?.data || error.message);
        throw error.response?.data || new Error('Error al verificar el email.');
    }
};

const forgotPassword = async (email) => {
    try {
        const response = await api.post(`/users/forgot-password`, { email });
        return response.data; // Espera { message: '...' }
    } catch (error) {
        console.error("Error en servicio de olvido de contraseña:", error.response?.data || error.message);
        throw error.response?.data || new Error('Error al solicitar restablecimiento de contraseña.');
    }
};

const resetPassword = async (token, password, confirmPassword) => {
    try {
        const response = await api.post(`/users/reset-password/${token}`, { password, confirmPassword });
        return response.data; // Espera { message: '...' }
    } catch (error) {
        console.error("Error en servicio de restablecimiento de contraseña:", error.response?.data || error.message);
        throw error.response?.data || new Error('Error al restablecer la contraseña.');
    }
};

const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
    try {
        // Este endpoint requiere autenticación, el token se añade automáticamente por el interceptor de 'api.js'
        const response = await api.put(`/users/change-password`, { currentPassword, newPassword, confirmNewPassword });
        return response.data; // Espera { message: '...' }
    } catch (error) {
        console.error("Error en servicio de cambio de contraseña:", error.response?.data || error.message);
        throw error || new Error('Error al cambiar la contraseña.');
    }
};

const resendVerificationEmail = async (email) => {
    try {
        const response = await api.post(`/users/resend-verification`, { email });
        return response.data; // Espera { message: '...' }
    } catch (error) {
        console.error("Error en servicio de reenvío de verificación:", error.response?.data || error.message);
        throw error || new Error('Error al reenviar el correo de verificación.');
    }
};

const authService = {
    register,
    login,
    verifyEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    resendVerificationEmail,
};

export default authService;