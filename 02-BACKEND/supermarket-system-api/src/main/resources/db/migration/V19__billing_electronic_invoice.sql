-- Permiso para ver e imprimir facturas electrónicas (tabla ya creada en V3)
INSERT IGNORE INTO permissions (code, description)
VALUES ('EINVOICE_VIEW', 'Ver e imprimir facturas electrónicas');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code = 'EINVOICE_VIEW'
WHERE r.name IN ('ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR', 'CAJERO');
