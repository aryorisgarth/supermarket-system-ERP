
export const ROLE_DEFAULT_PERMISSIONS = {
  CAJERO: ['SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE'],
  BODEGUERO: [
    'PURCHASE_RECEIVE',
    'INVENTORY_VIEW',
    'BATCH_MANAGE',
    'WAREHOUSE_LOCATION',
    'QC_REGISTER',
    'REPORT_VIEW',
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
  if (role === 'ADMIN_INGENIERO' || role === 'ADMINISTRADOR_INGENIERO') {
    return Object.values(ROLE_DEFAULT_PERMISSIONS).flat();
  }
  const defaults = ROLE_DEFAULT_PERMISSIONS[role] || [];
  const fromApi = Array.isArray(user.permissions) ? user.permissions : [];
  if (fromApi.length === 0) return defaults;
  return [...new Set([...defaults, ...fromApi])];
};
