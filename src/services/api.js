import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

console.log("Usando API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

const isOnAuthPage = () => {
  const path = window.location.pathname || '';
  return AUTH_PAGES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

const redirectToLoginExpired = () => {
  if (isOnAuthPage()) {
    return;
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  const redirectTarget = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({ expired: '1' });
  if (redirectTarget && redirectTarget !== '/') {
    params.set('redirect', redirectTarget);
  }
  window.location.replace(`/login?${params.toString()}`);
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en respuesta de API:', error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      redirectToLoginExpired();
    }

    return Promise.reject(error.response?.data || error);
  }
);


export default api;
