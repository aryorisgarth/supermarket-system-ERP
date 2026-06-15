-- V29__add_uom_and_conversions.sql
-- 1. Crear tabla de marcas
CREATE TABLE IF NOT EXISTS brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Modificar tabla de productos para marcas y UOM base
ALTER TABLE products 
    ADD COLUMN brand_id BIGINT NULL,
    ADD COLUMN uom_base VARCHAR(10) NOT NULL DEFAULT 'UN',
    ADD CONSTRAINT fk_products_brand_id FOREIGN KEY (brand_id) REFERENCES brands(id);

-- 3. Crear tabla de conversiones de UOM
CREATE TABLE IF NOT EXISTS product_uom_conversions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    barcode VARCHAR(50) NOT NULL,
    label VARCHAR(40) NOT NULL,
    factor DECIMAL(12, 4) NOT NULL,
    sale_price DECIMAL(12, 4) NULL,
    is_purchase_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_sale_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_uom_conversions_products FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT uq_uom_conversions_barcode UNIQUE (barcode),
    CONSTRAINT chk_uom_conversion_factor CHECK (factor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_uom_conversions_product ON product_uom_conversions(product_id);

-- 4. Modificar tablas transaccionales para asociar la conversión y auditoría
ALTER TABLE purchase_order_items ADD COLUMN uom_conversion_id BIGINT NULL,
    ADD CONSTRAINT fk_po_items_uom FOREIGN KEY (uom_conversion_id) REFERENCES product_uom_conversions(id);

ALTER TABLE sale_details ADD COLUMN uom_conversion_id BIGINT NULL,
    ADD CONSTRAINT fk_sale_details_uom FOREIGN KEY (uom_conversion_id) REFERENCES product_uom_conversions(id);

ALTER TABLE inventory_movements 
    ADD COLUMN uom_conversion_id BIGINT NULL,
    ADD COLUMN uom_label VARCHAR(40) NULL,
    ADD COLUMN uom_factor DECIMAL(12, 4) NULL,
    ADD COLUMN uom_quantity DECIMAL(12, 4) NULL,
    ADD CONSTRAINT fk_movements_uom FOREIGN KEY (uom_conversion_id) REFERENCES product_uom_conversions(id);

-- 5. Crear conversiones por defecto (factor = 1.0000) para todos los productos existentes
INSERT INTO product_uom_conversions (product_id, barcode, label, factor, sale_price, is_purchase_default, is_sale_default)
SELECT id, barcode, 'UN', 1.0000, sale_price, TRUE, TRUE
FROM products;
