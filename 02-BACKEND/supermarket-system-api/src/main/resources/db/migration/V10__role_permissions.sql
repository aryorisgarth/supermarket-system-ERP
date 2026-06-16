CREATE TABLE IF NOT EXISTS permissions (
    id          INTEGER      NOT NULL AUTO_INCREMENT,
    code        VARCHAR(80)  NOT NULL UNIQUE,
    description VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       TINYINT  NOT NULL,
    permission_id INTEGER  NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

INSERT IGNORE INTO roles (name, description) VALUES 
('ADMIN_INGENIERO', 'Acceso técnico total y gestión de backups'),
('ADMINISTRADOR', 'Acceso total a la gestión del negocio'),
('SUPERVISOR', 'Supervisión de operaciones y arqueos de caja'),
('CAJERO', 'Operaciones de venta y cobro en caja'),
('CONSULTOR', 'Acceso de solo lectura para auditoría y reportes'),
('BODEGUERO', 'Recepcion de mercaderia, lotes y ordenamiento en bodega');

INSERT IGNORE INTO permissions (code, description) VALUES
('SALE_CREATE', 'Registrar ventas'),
('SALE_CANCEL', 'Anular ventas'),
('CASH_OPEN', 'Abrir caja'),
('CASH_CLOSE', 'Cerrar caja'),
('CASH_MOVE', 'Registrar ingresos y retiros manuales de caja'),
('PURCHASE_MANAGE', 'Crear y administrar compras'),
('PURCHASE_RECEIVE', 'Recibir mercaderia de compras'),
('INVENTORY_ADJUST', 'Ajustar inventario manualmente'),
('FINANCE_VIEW', 'Ver modulo financiero'),
('FINANCE_MANAGE', 'Administrar cuentas financieras'),
('REPORT_VIEW', 'Ver reportes'),
('USER_MANAGE', 'Administrar usuarios'),
('AUDIT_VIEW', 'Ver auditoria'),
('MAINTENANCE_MANAGE', 'Ejecutar mantenimiento del sistema');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
WHERE r.name = 'ADMIN_INGENIERO';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'SALE_CREATE', 'SALE_CANCEL', 'CASH_OPEN', 'CASH_CLOSE', 'CASH_MOVE',
    'PURCHASE_MANAGE', 'PURCHASE_RECEIVE', 'INVENTORY_ADJUST', 'FINANCE_VIEW',
    'FINANCE_MANAGE', 'REPORT_VIEW', 'USER_MANAGE', 'AUDIT_VIEW'
)
WHERE r.name = 'ADMINISTRADOR';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'SALE_CREATE', 'SALE_CANCEL', 'CASH_OPEN', 'CASH_CLOSE', 'CASH_MOVE',
    'PURCHASE_MANAGE', 'PURCHASE_RECEIVE', 'INVENTORY_ADJUST', 'REPORT_VIEW'
)
WHERE r.name = 'SUPERVISOR';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('SALE_CREATE', 'CASH_OPEN', 'CASH_CLOSE')
WHERE r.name = 'CAJERO';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('REPORT_VIEW')
WHERE r.name = 'CONSULTOR';
