import { AlertTriangle, FileWarning, ShieldCheck } from 'lucide-react';

export const initialFilters = {
  search: '',
  action: '',
  affectedTable: '',
  fromDate: '',
  toDate: '',
};

export const actionOptions = [
  'SALE_CREATE',
  'SALE_CANCEL',
  'CASH_OPEN',
  'CASH_CLOSE',
  'CASH_MOVEMENT',
  'INVENTORY_ADJUSTMENT',
  'CREATE',
  'INSERT',
  'UPDATE',
  'DELETE',
  'REMOVE',
  'LOGIN',
  'LOGOUT',
  'ACCESS_DENIED',
];

export const criticalActions = ['SALE_CANCEL', 'DELETE', 'REMOVE'];
export const highRiskActions = ['ACCESS_DENIED', 'CASH_CLOSE', 'CASH_MOVEMENT', 'INVENTORY_ADJUSTMENT'];
export const mediumRiskActions = ['SALE_CREATE', 'CASH_OPEN', 'UPDATE'];

export const moduleLabels = {
  sales: 'Facturación',
  sale_details: 'Detalle de venta',
  sale_payments: 'Pagos',
  cash_register_sessions: 'Caja',
  cash_register_movements: 'Movimientos de caja',
  products: 'Inventario',
  product_batches: 'Lotes',
  inventory_movements: 'Kardex / Inventario',
  purchases: 'Compras',
  purchase_orders: 'Compras',
  users: 'Usuarios',
  user: 'Usuarios',
  roles: 'Roles y permisos',
  permissions: 'Permisos',
  payment_accounts: 'Finanzas',
};

export const actionLabels = {
  SALE_CREATE: 'Venta realizada',
  SALE_CANCEL: 'Venta anulada / devolución',
  CASH_OPEN: 'Caja abierta',
  CASH_CLOSE: 'Caja cerrada',
  CASH_MOVEMENT: 'Movimiento manual de caja',
  INVENTORY_ADJUSTMENT: 'Ajuste de inventario',
  ACCESS_DENIED: 'Acceso denegado',
  CREATE: 'Creación',
  INSERT: 'Creación',
  UPDATE: 'Actualización',
  DELETE: 'Eliminación',
  REMOVE: 'Eliminación',
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
};

export const highRiskTables = ['users', 'user', 'roles', 'permissions', 'payment_accounts', 'cash_register_sessions', 'cash_register_movements'];

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const toApiDateTime = (value, endOfDay = false) => {
  if (!value) return undefined;
  return `${value}T${endOfDay ? '23:59:59' : '00:00:00'}`;
};

export const parseJson = (value) => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getRisk = (log) => {
  const action = String(log.action || '').toUpperCase();
  const table = String(log.affectedTable || '').toLowerCase();

  if (criticalActions.includes(action)) {
    return { label: 'Crítico', tone: 'red', icon: AlertTriangle };
  }
  if (highRiskActions.includes(action)) {
    return { label: 'Alto', tone: 'red', icon: AlertTriangle };
  }
  if (highRiskTables.includes(table)) {
    return { label: 'Alto', tone: 'red', icon: AlertTriangle };
  }
  if (mediumRiskActions.includes(action)) {
    return { label: 'Medio', tone: 'amber', icon: FileWarning };
  }
  return { label: 'Bajo', tone: 'green', icon: ShieldCheck };
};

export const getModuleLabel = (affectedTable) => {
  const table = String(affectedTable || '').toLowerCase();
  return moduleLabels[table] || affectedTable || 'Sistema';
};

export const getActionLabel = (action) => {
  const normalized = String(action || '').toUpperCase();
  return actionLabels[normalized] || action || 'Evento';
};

export const getActionTone = (action) => {
  const normalized = String(action || '').toUpperCase();
  if (criticalActions.includes(normalized) || highRiskActions.includes(normalized)) return 'red';
  if (mediumRiskActions.includes(normalized)) return 'amber';
  if (['CREATE', 'INSERT', 'LOGIN'].includes(normalized)) return 'green';
  return 'neutral';
};

export const buildLocalSummary = (logs) => {
  const today = new Date().toISOString().slice(0, 10);
  const tableCounts = logs.reduce((acc, log) => {
    if (log.affectedTable) acc[log.affectedTable] = (acc[log.affectedTable] || 0) + 1;
    return acc;
  }, {});
  const mostAffectedTable = Object.entries(tableCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    totalLogs: logs.length,
    todayLogs: logs.filter((log) => String(log.logDate || '').startsWith(today)).length,
    deleteLogs: logs.filter((log) => criticalActions.includes(String(log.action || '').toUpperCase())).length,
    highRiskLogs: logs.filter((log) => ['Alto', 'Crítico'].includes(getRisk(log).label)).length,
    activeUsers: new Set(logs.map((log) => log.userId).filter(Boolean)).size,
    mostAffectedTable,
  };
};

export const buildOperationalSummary = (logs) => ({
  salesEvents: logs.filter((log) => String(log.action || '').startsWith('SALE_')).length,
  cashEvents: logs.filter((log) => String(log.affectedTable || '').startsWith('cash_register')).length,
  inventoryEvents: logs.filter((log) => ['products', 'product_batches', 'inventory_movements'].includes(String(log.affectedTable || '').toLowerCase())).length,
  deniedEvents: logs.filter((log) => String(log.action || '').toUpperCase() === 'ACCESS_DENIED').length,
});
