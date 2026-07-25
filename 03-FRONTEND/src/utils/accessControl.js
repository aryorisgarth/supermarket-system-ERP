import AuthService from '../services/AuthService';
import { normalizeRoleName } from './rolePermissions';

export const canViewReports = () => {
  const roleName = normalizeRoleName(AuthService.getCurrentUser()?.role?.name);
  return (
    ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR'].includes(roleName)
    && AuthService.hasPermission('REPORT_VIEW')
  );
};

export const canViewSystemAlerts = () => {
  const roleName = normalizeRoleName(AuthService.getCurrentUser()?.role?.name);
  return ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'].includes(roleName);
};

export const canViewFinance = () => AuthService.hasPermission('FINANCE_VIEW');

export const canViewPurchases = () =>
  AuthService.hasPermission('PURCHASE_MANAGE') || AuthService.hasPermission('PURCHASE_RECEIVE');

export const canViewDailyClose = () => {
  const roleName = AuthService.getCurrentUser()?.role?.name;
  return (
    ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'].includes(roleName)
    && AuthService.hasPermission('CASH_CLOSE')
  );
};

export const canViewCashRegisterReport = () => canViewDailyClose();
