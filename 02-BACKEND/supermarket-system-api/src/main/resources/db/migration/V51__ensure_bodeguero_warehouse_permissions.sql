-- Asegura permisos de bodega para traslados y ubicaciones (idempotente)

INSERT IGNORE INTO permissions (code, description) VALUES
('WAREHOUSE_LOCATION', 'Asignar ubicacion en bodega'),
('PURCHASE_RECEIVE', 'Recibir mercaderia de compras'),
('INVENTORY_VIEW', 'Consultar inventario y productos'),
('BATCH_MANAGE', 'Registrar lotes en recepcion');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'WAREHOUSE_LOCATION',
    'PURCHASE_RECEIVE',
    'INVENTORY_VIEW',
    'BATCH_MANAGE',
    'INVENTORY_ADJUST',
    'REPORT_VIEW'
)
WHERE r.name IN ('BODEGUERO', 'SUPERVISOR', 'ADMINISTRADOR', 'ADMIN_INGENIERO');
