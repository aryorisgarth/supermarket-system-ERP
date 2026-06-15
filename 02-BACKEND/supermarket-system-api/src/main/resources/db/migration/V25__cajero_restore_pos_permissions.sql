-- Cajero: permisos mínimos para POS (venta + turno de caja).
-- Corrige estados donde faltó SALE_CREATE tras ediciones manuales del rol.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE')
WHERE r.name = 'CAJERO';

DELETE rp FROM role_permissions rp
INNER JOIN roles r ON r.id = rp.role_id
INNER JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'CAJERO'
  AND p.code NOT IN ('SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE');
