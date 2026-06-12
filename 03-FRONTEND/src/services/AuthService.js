import {
  buildUserFromToken,
  doLogin,
  doLogout,
  doUpdatePassword,
  getAccountConsoleUrl,
  getKeycloak,
  getValidToken,
  initKeycloak,
  isKeycloakAuthenticated,
  loginWithDirectGrant,
} from './KeycloakService';
import api from './api';
import { getEffectivePermissions, normalizeRoleName } from '../utils/rolePermissions';

const USER_STORAGE_KEY = 'user';

const normalizeRole = normalizeRoleName;

const isAdminEngineer = (user) => {
  const role = normalizeRole(user?.role?.name);
  return role === 'ADMIN_INGENIERO' || role === 'ADMINISTRADOR_INGENIERO' || (role.includes('ADMIN') && role.includes('INGEN'));
};

const readStoredUser = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const storeUser = (user) => {
  if (!user) return null;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
};

const syncUserFromBackend = async () => {
  const token = await getValidToken();
  if (!token) return null;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return storeUser(buildUserFromToken());
    }

    const user = await response.json();
    return storeUser(user || buildUserFromToken());
  } catch (error) {
    console.warn('No se pudo sincronizar el usuario autenticado:', error);
    return storeUser(buildUserFromToken());
  }
};

const AuthService = {
  init: async () => {
    const token = localStorage.getItem('kc_token');
    const refreshToken = localStorage.getItem('kc_refreshToken');
    const idToken = localStorage.getItem('kc_idToken');

    const initOptions = token
      ? { token, refreshToken, idToken, onLoad: 'check-sso' }
      : { onLoad: 'check-sso' };

    try {
      const authenticated = await initKeycloak(initOptions);
      if (authenticated) {
        if (getKeycloak().token) localStorage.setItem('kc_token', getKeycloak().token);
        if (getKeycloak().refreshToken) localStorage.setItem('kc_refreshToken', getKeycloak().refreshToken);
        if (getKeycloak().idToken) localStorage.setItem('kc_idToken', getKeycloak().idToken);
        await syncUserFromBackend();
      } else {
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refreshToken');
        localStorage.removeItem('kc_idToken');
        localStorage.removeItem(USER_STORAGE_KEY);
      }
      return authenticated;
    } catch (error) {
      console.warn('Fallo al inicializar Keycloak con tokens guardados. Limpiando sesión...', error);
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_refreshToken');
      localStorage.removeItem('kc_idToken');
      localStorage.removeItem(USER_STORAGE_KEY);
      return false;
    }
  },

  login: async (username) => {
    await doLogin({
      loginHint: username || undefined,
    });
    return null;
  },

  loginDirect: async (username, password) => {
    await loginWithDirectGrant(username, password);
    const user = await syncUserFromBackend();
    return user;
  },

  loginWithKeycloakRedirect: () => doLogin(),

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('kc_token');
    localStorage.removeItem('kc_refreshToken');
    localStorage.removeItem('kc_idToken');

    if (isKeycloakAuthenticated()) {
      await doLogout();
    }
  },

  getCurrentUser: () => {
    const user = readStoredUser();
    if (user) return user;

    return buildUserFromToken();
  },

  isAuthenticated: () => isKeycloakAuthenticated(),

  hasPermission: (permission) => {
    const user = AuthService.getCurrentUser();
    if (isAdminEngineer(user)) return true;
    return getEffectivePermissions(user).includes(permission);
  },

  hasAnyPermission: (permissions = []) => {
    const user = AuthService.getCurrentUser();
    if (isAdminEngineer(user)) return true;
    const effective = getEffectivePermissions(user);
    return permissions.some((p) => effective.includes(p));
  },

  getEffectivePermissions: () => getEffectivePermissions(AuthService.getCurrentUser()),

  getToken: () => getKeycloak()?.token || null,
  getValidToken,
  refreshCurrentUser: () => syncUserFromBackend(),

  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  
  changePasswordViaKeycloak: () => doUpdatePassword(),

  getAccountConsoleUrl,
};

export default AuthService;