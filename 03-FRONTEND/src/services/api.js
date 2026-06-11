import axios from 'axios';
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
