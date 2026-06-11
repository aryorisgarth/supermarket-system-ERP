import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'supermarket',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'supermarket-app',
};

const keycloak = new Keycloak(keycloakConfig);

let initPromise = null;

export const getKeycloak = () => keycloak;

export const initKeycloak = (options = {}) => {
  if (!initPromise) {
    const initConfig = {
      pkceMethod: 'S256',
      checkLoginIframe: false,
      ...options,
    };
    if (!initConfig.token) {
      initConfig.onLoad = 'check-sso';
    }
    initPromise = keycloak.init(initConfig);
  }

  return initPromise;
};

export const isKeycloakAuthenticated = () => Boolean(keycloak.authenticated && keycloak.token);

export const getValidToken = async (minValidity = 30) => {
  if (!keycloak.authenticated) return null;

  try {
    await keycloak.updateToken(minValidity);
    if (keycloak.token) localStorage.setItem('kc_token', keycloak.token);
    if (keycloak.refreshToken) localStorage.setItem('kc_refreshToken', keycloak.refreshToken);
    if (keycloak.idToken) localStorage.setItem('kc_idToken', keycloak.idToken);
    return keycloak.token || null;
  } catch (error) {
    console.error('No se pudo refrescar el token de Keycloak:', error);
    return null;
  }
};

export const loginWithDirectGrant = async (username, password) => {
  const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', keycloakConfig.clientId);
  params.append('username', username);
  params.append('password', password);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error_description || 'Usuario o contraseña incorrectos.');
  }

  const data = await response.json();

  if (data.access_token) {
    localStorage.setItem('kc_token', data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem('kc_refreshToken', data.refresh_token);
  }
  if (data.id_token) {
    localStorage.setItem('kc_idToken', data.id_token);
  }

  return true;
};

export const doLogin = (options = {}) =>
  keycloak.login({
    redirectUri: `${window.location.origin}/`,
    ...options,
  });

export const doLogout = (options = {}) =>
  keycloak.logout({
    redirectUri: `${window.location.origin}/login`,
    ...options,
  });


export const doUpdatePassword = (options = {}) =>
  keycloak.login({
    action: 'UPDATE_PASSWORD',
    redirectUri: `${window.location.origin}/mi-perfil`,
    ...options,
  });

export const getAccountConsoleUrl = () =>
  `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account/#/security/signingin`;

export const buildUserFromToken = () => {
  const token = keycloak.tokenParsed;
  if (!token) return null;

  const realmRoles = token.realm_access?.roles || [];
  const clientRoles = token.resource_access?.[keycloakConfig.clientId]?.roles || [];
  const roles = [...realmRoles, ...clientRoles].map(normalizeRole);
  const roleName = resolveApplicationRole(roles);

  return {
    id: token.sub,
    username: token.preferred_username || token.email || '',
    email: token.email || '',
    fullName: token.name || token.preferred_username || token.email || '',
    role: roleName ? { name: roleName } : null,
    permissions: [],
  };
};

const normalizeRole = (role = '') => {
  const normalized = role
    .trim()
    .replace(/^ROLE_/i, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .toUpperCase();

  if (normalized === 'ADMINISTRADOR_INGENIERO' || normalized === 'ADMININGENIERO') {
    return 'ADMIN_INGENIERO';
  }

  return normalized;
};

const resolveApplicationRole = (roles = []) =>
  ['ADMIN_INGENIERO', 'ADMINISTRADOR', 'SUPERVISOR', 'CAJERO', 'CONSULTOR'].find((role) => roles.includes(role)) || null;


export const initAuth = initKeycloak;
export const getToken = getValidToken;
export const loginUser = doLogin;
export const logoutUser = doLogout;
export const isAuthenticated = isKeycloakAuthenticated;