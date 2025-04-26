import axios from 'axios';

// Define la URL base de tu API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Fallback para desarrollo local

console.log("Usando API Base URL:", API_BASE_URL);

// Crea una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_BASE_URL,
});

// *** Interceptor de Peticiones ***
// Se ejecuta ANTES de que cada petición sea enviada desde esta instancia 'api'
api.interceptors.request.use(
  (config) => {
    // Intenta obtener el token de localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Si existe el token, lo añade a la cabecera Authorization
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Devuelve la configuración modificada (o la original si no hay token)
  },
  (error) => {
    // Maneja errores durante la configuración de la petición
    return Promise.reject(error);
  }
);

// *** Interceptor de Respuestas (Opcional, pero útil) ***
// Se ejecuta DESPUÉS de recibir una respuesta (exitosa o errónea)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (status 2xx), simplemente la devuelve
    return response;
  },
  (error) => {
    // Si hay un error en la respuesta (ej: 401 Unauthorized, 403 Forbidden)
    console.error('Error en respuesta de API:', error.response?.status, error.response?.data);

    // Podrías añadir lógica aquí para manejar errores globales,
    // por ejemplo, si recibes un 401 (token inválido/expirado), podrías
    // forzar el logout del usuario.
    if (error.response && error.response.status === 401) {
        console.log("Error 401 detectado, posible token expirado/inválido.");
        // Aquí podrías llamar a una función de logout global si la tuvieras accesible
        // O emitir un evento para que AuthContext reaccione.
        // Por ahora, solo lo logueamos. El componente que hizo la llamada manejará el error.
        // ¡Importante! No llamar a logout() de useAuth aquí directamente porque es un hook.
    }

    // Rechaza la promesa para que el .catch() en el servicio o componente se active
    return Promise.reject(error.response?.data || error);
  }
);


export default api; // Exporta la instancia configurada