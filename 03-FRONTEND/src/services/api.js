import axios from 'axios';
import AuthService from './AuthService';

// Creamos la instancia de Axios con la URL base desde las variables de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenRefreshPromise = null;

const getFreshToken = async () => {
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = AuthService.getValidToken()
      .finally(() => {
        tokenRefreshPromise = null;
      });
  }

  return tokenRefreshPromise;
};

// Interceptor de Petición: adjunta el token administrado por Keycloak
api.interceptors.request.use(
  async (config) => {
    const token = await getFreshToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Respuesta: si Keycloak rechaza la sesión, vuelve al login centralizado.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 && window.location.pathname !== '/login') {
      await AuthService.logout();
    }

    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.detail ||
      (typeof payload === 'string' ? payload : null) ||
      error.message;
    return Promise.reject(message);
  }
);

export default api;
