INSERT IGNORE INTO permissions (code, description) VALUES
('SALE_DISCOUNT', 'Aplicar descuentos en facturacion POS');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'SALE_DISCOUNT'
WHERE r.name IN ('ADMIN_INGENIERO', 'ADMINISTRADOR', 'SUPERVISOR');
