-- Presentaciones de compra (caja, cajilla, unidad) y trazabilidad en ordenes de compra
CREATE TABLE IF NOT EXISTS product_purchase_packs (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    product_id  BIGINT         NOT NULL,
    label       VARCHAR(40)    NOT NULL,
    factor      DECIMAL(12, 4) NOT NULL,
    is_default  TINYINT(1)     NOT NULL DEFAULT 0,
    sort_order  INT            NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT fk_purchase_packs_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT uk_product_purchase_pack_label UNIQUE (product_id, label),
    CONSTRAINT chk_purchase_pack_factor CHECK (factor > 0)
);

CREATE INDEX idx_purchase_packs_product ON product_purchase_packs (product_id);

ALTER TABLE purchase_order_items
    ADD COLUMN pack_label        VARCHAR(40)    NULL AFTER line_total,
    ADD COLUMN quantity_in_packs DECIMAL(12, 4) NULL AFTER pack_label,
    ADD COLUMN cost_per_pack     DECIMAL(12, 4) NULL AFTER quantity_in_packs,
    ADD COLUMN units_per_pack    DECIMAL(12, 4) NULL AFTER cost_per_pack;

-- Unidad base de venta/inventario para todos los productos existentes
INSERT INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'UN', 1, 1, 0
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM product_purchase_packs pp WHERE pp.product_id = p.id
);
