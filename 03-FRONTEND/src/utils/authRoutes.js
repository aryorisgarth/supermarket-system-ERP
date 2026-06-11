/** Ruta de inicio según rol (login y rutas no permitidas). */
export function getDefaultPathForRole(roleName) {
  const paths = {
    CAJERO: '/cajero',
    BODEGUERO: '/bodega',
    CONSULTOR: '/',
    SUPERVISOR: '/',
    ADMINISTRADOR: '/',
    ADMIN_INGENIERO: '/',
  };
  return paths[roleName] || '/mi-perfil';
}

export function getLoginSuccessMessage(roleName) {
  const messages = {
    CAJERO: 'Cargando tu turno de caja...',
    BODEGUERO: 'Cargando modulo de bodega...',
    CONSULTOR: 'Cargando panel de consulta...',
    SUPERVISOR: 'Cargando panel de supervision...',
  };
  return messages[roleName] || 'Cargando el panel administrativo...';
}
