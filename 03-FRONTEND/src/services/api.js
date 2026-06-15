import axios from 'axios';
import Swal from 'sweetalert2';
import AuthService from './AuthService';


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


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.detail ||
      (typeof payload === 'string' ? payload : null) ||
      error.message;

    if (status === 401) {
      if (window.location.pathname !== '/login') {
        await AuthService.logout();
      }
    } else if (status === 403) {
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'No tienes permisos suficientes para realizar esta acción.',
        confirmButtonColor: '#4f46e5',
      });
    } else if (status >= 500) {
      Swal.fire({
        icon: 'error',
        title: 'Error del Servidor',
        text: message || 'Ocurrió un error interno en el servidor.',
        confirmButtonColor: '#ef4444',
      });
    } else if (!error.response) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Conexión',
        text: 'No se pudo establecer conexión con el servidor. Verifica tu conexión a internet.',
        confirmButtonColor: '#f59e0b',
      });
    }

    return Promise.reject(message);
  }
);

export default api;
