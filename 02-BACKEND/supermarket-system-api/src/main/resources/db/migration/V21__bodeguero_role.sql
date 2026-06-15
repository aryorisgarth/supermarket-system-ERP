-- Rol BODEGUERO y permisos de bodega

INSERT IGNORE INTO roles (name, description) VALUES
('BODEGUERO', 'Recepcion de mercaderia, lotes, vencimientos y ordenamiento en bodega');

INSERT IGNORE INTO permissions (code, description) VALUES
('INVENTORY_VIEW', 'Consultar inventario y productos'),
('BATCH_MANAGE', 'Registrar lotes en recepcion'),
('WAREHOUSE_LOCATION', 'Asignar ubicacion en bodega'),
('QC_REGISTER', 'Registrar control de calidad en recepcion');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'PURCHASE_RECEIVE',
    'INVENTORY_VIEW',
    'BATCH_MANAGE',
    'WAREHOUSE_LOCATION',
    'QC_REGISTER',
    'REPORT_VIEW'
)
WHERE r.name = 'BODEGUERO';

-- Trazabilidad lote ↔ linea de compra + ubicacion en bodega
ALTER TABLE product_batches
    ADD COLUMN purchase_order_item_id BIGINT NULL,
    ADD COLUMN warehouse_zone VARCHAR(80) NULL,
    ADD COLUMN qc_notes VARCHAR(500) NULL;

ALTER TABLE product_batches
    ADD CONSTRAINT fk_batches_purchase_order_item
        FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items (id);
