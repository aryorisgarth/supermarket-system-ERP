/** Indica en esta pestaña que el cajero abrió turno (evita GET /current al cargar con caja cerrada). */
export const CASH_REGISTER_OPEN_KEY = 'pos_cash_register_open';

export const ROLES_WITH_CASH_REGISTER = [
  'CAJERO',
  'ADMINISTRADOR',
  'ADMIN_INGENIERO',
  'SUPERVISOR',
];

export function roleUsesCashRegister(roleName) {
  return ROLES_WITH_CASH_REGISTER.includes(roleName);
}

export function isCashRegisterMarkedOpen() {
  return sessionStorage.getItem(CASH_REGISTER_OPEN_KEY) === 'true';
}

export function markCashRegisterOpen() {
  sessionStorage.setItem(CASH_REGISTER_OPEN_KEY, 'true');
}

export function markCashRegisterClosed() {
  sessionStorage.removeItem(CASH_REGISTER_OPEN_KEY);
}
