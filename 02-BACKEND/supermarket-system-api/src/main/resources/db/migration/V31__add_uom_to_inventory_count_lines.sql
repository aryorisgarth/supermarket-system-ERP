-- Migración V31: Agregar soporte UOM a las líneas de conteo físico de inventario
ALTER TABLE inventory_count_lines
ADD COLUMN uom_conversion_id BIGINT NULL,
ADD CONSTRAINT fk_inventory_count_lines_uom_conversions
FOREIGN KEY (uom_conversion_id) REFERENCES product_uom_conversions(id) ON DELETE SET NULL;
