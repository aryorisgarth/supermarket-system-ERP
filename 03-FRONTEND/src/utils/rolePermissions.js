
export const ROLE_DEFAULT_PERMISSIONS = {
  CAJERO: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
  BODEGUERO: [
    'PURCHASE_RECEIVE',
    'INVENTORY_VIEW',
    'BATCH_MANAGE',
    'WAREHOUSE_LOCATION',
    'QC_REGISTER',
    'INVENTORY_COUNT',
  ],
  CONSULTOR: ['REPORT_VIEW'],
  SUPERVISOR: [
    'SALE_CREATE',
    'SALE_CANCEL',
    'CASH_OPEN',
    'CASH_CLOSE',
    'CASH_MOVE',
    'PURCHASE_MANAGE',
    'PURCHASE_RECEIVE',
    'INVENTORY_ADJUST',
    'REPORT_VIEW',
    'FINANCE_VIEW',
  ],
  ADMINISTRADOR: [
    'SALE_CREATE',
    'SALE_CANCEL',
    'CASH_OPEN',
    'CASH_CLOSE',
    'CASH_MOVE',
    'PURCHASE_MANAGE',
    'PURCHASE_RECEIVE',
    'INVENTORY_ADJUST',
    'FINANCE_VIEW',
    'FINANCE_MANAGE',
    'REPORT_VIEW',
    'USER_MANAGE',
    'AUDIT_VIEW',
    'EINVOICE_VIEW',
    'SALE_DISCOUNT',
    'PROMO_MANAGE',
  ],
};

export const normalizeRoleName = (roleName = '') =>
  roleName
    .trim()
    .replace(/^ROLE_/i, '')
    .replace(/\s+/g, '_')
    .replace(/-/g, '_')
    .toUpperCase();

export const getEffectivePermissions = (user) => {
  if (!user) return [];

  const role = normalizeRoleName(user.role?.name);
  const fromApi = Array.isArray(user.permissions) ? user.permissions : [];
  const syncedFromBackend = Array.isArray(user.directPermissions) || Number.isFinite(user.id);

  // Sesión sincronizada con /auth/me o listado de usuarios: confiar solo en el backend
  if (syncedFromBackend) {
    return fromApi;
  }

  // Fallback token Keycloak sin /auth/me (buildUserFromToken)
  if (role === 'ADMIN_INGENIERO' || role === 'ADMINISTRADOR_INGENIERO') {
    return Object.values(ROLE_DEFAULT_PERMISSIONS).flat();
  }
  return ROLE_DEFAULT_PERMISSIONS[role] || [];
};
