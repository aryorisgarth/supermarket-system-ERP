import { getEffectivePermissions, normalizeRoleName } from './rolePermissions';

/**
 * Reglas de acceso para rutas y menú:
 * - solo permisos → basta con tener alguno (rol o adicional)
 * - solo roles → basta con el rol
 * - rol + permisos → rol y permiso efectivo
 * - allowPermissionOverride → un permiso en directPermissions desbloquea aunque el rol no esté listado
 *   (los permisos heredados del rol NO cuentan para override)
 */
export const canAccess = ({
  roles = [],
  permissions = [],
  allowPermissionOverride = false,
  user,
} = {}) => {
  const roleName = normalizeRoleName(user?.role?.name);
  const roleList = Array.isArray(roles) ? roles : [];
  const permissionList = Array.isArray(permissions) ? permissions : [];
  const effective = getEffectivePermissions(user);
  const directOnly = Array.isArray(user?.directPermissions) ? user.directPermissions : [];
  const isAdminEngineer = roleName === 'ADMIN_INGENIERO' || roleName === 'ADMINISTRADOR_INGENIERO';

  const roleAllowed = roleList.length === 0
    || roleList.some((role) => normalizeRoleName(role) === roleName);
  const hasRequiredPermission = permissionList.length === 0
    || isAdminEngineer
    || permissionList.some((code) => effective.includes(code));
  const hasDirectPermission = permissionList.length === 0
    || isAdminEngineer
    || permissionList.some((code) => directOnly.includes(code));

  if (permissionList.length > 0 && allowPermissionOverride && hasDirectPermission) {
    return true;
  }
  if (roleList.length > 0 && !roleAllowed) {
    return false;
  }
  return hasRequiredPermission;
};
