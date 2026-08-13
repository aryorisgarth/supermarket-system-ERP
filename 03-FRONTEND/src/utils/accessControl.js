import AuthService from '../services/AuthService';
import { canAccess } from './canAccess';

export const canViewReports = () =>
  canAccess({
    user: AuthService.getCurrentUser(),
    roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CONSULTOR'],
    permissions: ['REPORT_VIEW'],
    allowPermissionOverride: true,
  });

export const canViewSystemAlerts = () => {
  const user = AuthService.getCurrentUser();
  return canAccess({
    user,
    roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'],
    permissions: ['REPORT_VIEW'],
    allowPermissionOverride: true,
  });
};

export const canViewFinance = () => AuthService.hasPermission('FINANCE_VIEW');

export const canViewPurchases = () =>
  AuthService.hasPermission('PURCHASE_MANAGE') || AuthService.hasPermission('PURCHASE_RECEIVE');

export const canViewDailyClose = () =>
  canAccess({
    user: AuthService.getCurrentUser(),
    roles: ['ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR'],
    permissions: ['CASH_CLOSE'],
    allowPermissionOverride: true,
  });

export const canViewCashRegisterReport = () => canViewDailyClose();
