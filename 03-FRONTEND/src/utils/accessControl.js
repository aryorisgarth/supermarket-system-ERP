import AuthService from '../services/AuthService';

export const canViewReports = () => AuthService.hasPermission('REPORT_VIEW');

export const canViewSystemAlerts = () => AuthService.hasPermission('REPORT_VIEW');

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
