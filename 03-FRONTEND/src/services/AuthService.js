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
const AUTH_NOTICE_KEY = 'auth_notice';
const INACTIVE_ACCOUNT_NOTICE = 'Tu cuenta está desactivada. Contacta al administrador para reactivarla.';

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

const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem('kc_token');
  localStorage.removeItem('kc_refreshToken');
  localStorage.removeItem('kc_idToken');
};

const getBackendToken = async () => {
  const liveToken = await getValidToken();
  if (liveToken) {
    return liveToken;
  }
  return localStorage.getItem('kc_token');
};

const storeAuthNotice = (message) => {
  if (!message) return;
  sessionStorage.setItem(AUTH_NOTICE_KEY, message);
};

const parseResponsePayload = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const resolveErrorMessage = (payload) =>
  payload?.message ||
  payload?.detail ||
  (typeof payload === 'string' ? payload : null) ||
  null;

const isInactiveAccountMessage = (message) =>
  typeof message === 'string' && /inactive|inactiva|inactivo/i.test(message);

const isKeycloakLookupFailure = (message) =>
  typeof message === 'string' && /Failed to query user by email in Keycloak/i.test(message);

const handleInactiveAccount = async (message = INACTIVE_ACCOUNT_NOTICE) => {
  storeAuthNotice(message);
  clearStoredSession();

  if (isKeycloakAuthenticated()) {
    try {
      await doLogout({ redirectUri: `${window.location.origin}/login` });
    } catch (error) {
      console.warn('No se pudo cerrar la sesión de Keycloak para usuario inactivo:', error);
    }
  }

  throw new Error('ACCOUNT_INACTIVE');
};

const syncUserFromBackend = async () => {
  const token = await getBackendToken();
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
      const errorPayload = await parseResponsePayload(response);
      const message = resolveErrorMessage(errorPayload);
      if (response.status === 403 && isInactiveAccountMessage(message)) {
        return handleInactiveAccount(message || INACTIVE_ACCOUNT_NOTICE);
      }
      if (response.status === 500 && isKeycloakLookupFailure(message)) {
        return handleInactiveAccount(INACTIVE_ACCOUNT_NOTICE);
      }
      if (response.status === 401) {
        clearStoredSession();
        throw new Error('SESSION_INVALID');
      }
      return storeUser(buildUserFromToken());
    }

    const user = await response.json();
    return storeUser(user || buildUserFromToken());
  } catch (error) {
    if (error?.message === 'ACCOUNT_INACTIVE' || error?.message === 'SESSION_INVALID') {
      throw error;
    }
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
    const idToken = localStorage.getItem('kc_idToken');

    clearStoredSession();

    if (isKeycloakAuthenticated()) {
      try {
        await doLogout();
        return;
      } catch (err) {
        console.warn('Error al llamar a doLogout de Keycloak, usando logout manual:', err);
      }
    }

    const baseUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
    const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'supermarket';
    const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'supermarket-app';
    const redirectUri = encodeURIComponent(window.location.origin + '/login');

    let logoutUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/logout?client_id=${clientId}&post_logout_redirect_uri=${redirectUri}`;
    if (idToken) {
      logoutUrl += `&id_token_hint=${idToken}`;
    }

    window.location.href = logoutUrl;
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
  consumeAuthNotice: () => {
    const message = sessionStorage.getItem(AUTH_NOTICE_KEY);
    if (message) {
      sessionStorage.removeItem(AUTH_NOTICE_KEY);
    }
    return message;
  },

  
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