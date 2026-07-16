export const ROLE_LABELS = {
  ADMIN_INGENIERO: 'Ingeniero de sistemas',
  ADMINISTRADOR: 'Administrador general',
  SUPERVISOR: 'Supervisor de tienda',
  BODEGUERO: 'Bodeguero',
  CAJERO: 'Cajero',
  CONSULTOR: 'Consultor',
};

export const PERMISSION_LABELS = {
  SALE_CREATE: 'Facturar ventas',
  SALE_CANCEL: 'Anular o reembolsar ventas',
  SALE_DISCOUNT: 'Aplicar descuentos',
  CASH_OPEN: 'Abrir caja',
  CASH_CLOSE: 'Cerrar caja',
  CASH_MOVE: 'Registrar movimientos de caja',
  PURCHASE_MANAGE: 'Gestionar compras',
  PURCHASE_RECEIVE: 'Recibir mercadería',
  INVENTORY_VIEW: 'Consultar inventario',
  INVENTORY_ADJUST: 'Ajustar inventario',
  INVENTORY_COUNT: 'Aprobar conteos cíclicos',
  BATCH_MANAGE: 'Gestionar lotes',
  WAREHOUSE_LOCATION: 'Gestionar ubicaciones',
  QC_REGISTER: 'Registrar control de calidad',
  REPORT_VIEW: 'Ver reportes',
  FINANCE_VIEW: 'Ver finanzas',
  FINANCE_MANAGE: 'Gestionar finanzas',
  USER_MANAGE: 'Gestionar usuarios',
  AUDIT_VIEW: 'Ver auditoría',
  EINVOICE_VIEW: 'Ver facturas electrónicas',
  PROMO_MANAGE: 'Gestionar promociones',
  MAINTENANCE_MANAGE: 'Acceder a mantenimiento',
};

export const PERMISSION_DESCRIPTIONS = {
  SALE_CREATE: 'Permite registrar cobros y emitir ventas en caja.',
  SALE_CANCEL: 'Permite anular ventas o procesar devoluciones.',
  SALE_DISCOUNT: 'Permite aplicar descuentos manuales.',
  CASH_OPEN: 'Permite abrir turnos y cajas registradoras.',
  CASH_CLOSE: 'Permite cerrar cajas y generar cierre diario.',
  CASH_MOVE: 'Permite registrar ingresos o egresos de caja.',
  PURCHASE_MANAGE: 'Permite crear, ordenar y administrar órdenes de compra.',
  PURCHASE_RECEIVE: 'Permite recibir compras y actualizar stock.',
  INVENTORY_VIEW: 'Permite consultar existencias, kardex y ubicaciones.',
  INVENTORY_ADJUST: 'Permite ajustar stock, lotes y movimientos.',
  INVENTORY_COUNT: 'Permite ejecutar y aprobar conteos cíclicos.',
  BATCH_MANAGE: 'Permite administrar lotes y vencimientos.',
  WAREHOUSE_LOCATION: 'Permite editar ubicaciones de bodega y exhibición.',
  QC_REGISTER: 'Permite registrar notas de calidad en recepción.',
  REPORT_VIEW: 'Permite consultar paneles, métricas y reportes.',
  FINANCE_VIEW: 'Permite consultar información financiera.',
  FINANCE_MANAGE: 'Permite administrar cuentas y conciliaciones.',
  USER_MANAGE: 'Permite crear, editar y desactivar usuarios.',
  AUDIT_VIEW: 'Permite ver auditoría y trazabilidad del sistema.',
  EINVOICE_VIEW: 'Permite consultar facturas electrónicas.',
  PROMO_MANAGE: 'Permite crear y modificar promociones.',
  MAINTENANCE_MANAGE: 'Permite usar herramientas de mantenimiento del sistema.',
};

export const formatRoleLabel = (roleName = '') =>
  ROLE_LABELS[roleName] || roleName.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export const formatPermissionLabel = (permissionCode = '') =>
  PERMISSION_LABELS[permissionCode] || permissionCode.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export const formatPermissionDescription = (permissionCode = '', fallback = '') =>
  PERMISSION_DESCRIPTIONS[permissionCode] || fallback || 'Permiso operativo del sistema.';
