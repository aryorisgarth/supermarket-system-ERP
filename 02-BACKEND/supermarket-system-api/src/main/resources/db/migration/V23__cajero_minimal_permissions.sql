-- Cajero: solo venta y turno de caja (sin facturas electrónicas ni módulos administrativos)
DELETE rp FROM role_permissions rp
INNER JOIN roles r ON r.id = rp.role_id
INNER JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'CAJERO'
  AND p.code IN ('EINVOICE_VIEW', 'REPORT_VIEW', 'USER_MANAGE', 'FINANCE_VIEW', 'FINANCE_MANAGE', 'PURCHASE_MANAGE', 'PURCHASE_RECEIVE');
