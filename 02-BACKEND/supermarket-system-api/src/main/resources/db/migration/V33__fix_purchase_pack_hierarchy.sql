-- Corregir presentaciones de compra: V27 aplicó CAJILLA=6 y CAJA=24 a TODOS los productos.
-- Plantillas por categoría / huevos. Inventario siempre en unidades base (UN).
-- Barcodes de presentación: {barcode_producto}-{ETIQUETA} (único por empaque).

-- 1. Quitar empaques genéricos incorrectos (conservar UN)
DELETE FROM product_purchase_packs
WHERE label IN ('CAJILLA', 'CAJA', 'SIX', 'PAQ', 'FARDO', 'SACO', 'M-CAJ', 'REJILLA');

-- 2. Huevos: UN → M-CAJ(6) → CAJILLA(30) → CAJA(60) → REJILLA(360)
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'M-CAJ', 6, 0, 1 FROM products p WHERE LOWER(p.name) LIKE '%huevo%';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJILLA', 30, 0, 2 FROM products p WHERE LOWER(p.name) LIKE '%huevo%';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 60, 0, 3 FROM products p WHERE LOWER(p.name) LIKE '%huevo%';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'REJILLA', 360, 1, 4 FROM products p WHERE LOWER(p.name) LIKE '%huevo%';

-- 3. Bebidas
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJILLA', 6, 0, 1 FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Bebidas';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 1, 2 FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Bebidas';

-- 4. Lácteos (excepto huevos)
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name = 'Lácteos' AND LOWER(p.name) NOT LIKE '%huevo%';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name = 'Lácteos' AND LOWER(p.name) NOT LIKE '%huevo%';

-- 5. Despensa y granos
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id WHERE c.name IN ('Despensa', 'Granos y Cereales');
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'FARDO', 12, 0, 2 FROM products p
JOIN categories c ON c.id = p.category_id WHERE c.name IN ('Despensa', 'Granos y Cereales');
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'SACO', 50, 1, 3 FROM products p
JOIN categories c ON c.id = p.category_id WHERE c.name IN ('Despensa', 'Granos y Cereales');

-- 6. Limpieza
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Limpieza';
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 12, 1, 2 FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Limpieza';

-- 7. Eliminar conversiones UOM duplicadas por producto+etiqueta (conservar menor id sin movimientos)
DELETE uc_dup FROM product_uom_conversions uc_dup
INNER JOIN product_uom_conversions uc_keep
  ON uc_keep.product_id = uc_dup.product_id
 AND uc_keep.label = uc_dup.label
 AND uc_keep.id < uc_dup.id
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_movements im WHERE im.uom_conversion_id = uc_dup.id
);

-- 8. Quitar conversiones UOM huérfanas (sin movimientos) cuya etiqueta ya no está en purchase_packs
DELETE uc FROM product_uom_conversions uc
WHERE uc.label <> 'UN'
  AND NOT EXISTS (
    SELECT 1 FROM product_purchase_packs pp
    WHERE pp.product_id = uc.product_id AND pp.label = uc.label
  )
  AND NOT EXISTS (
    SELECT 1 FROM inventory_movements im WHERE im.uom_conversion_id = uc.id
  );

-- 9. Actualizar factores, flags y barcodes por etiqueta
UPDATE product_uom_conversions uc
JOIN products p ON p.id = uc.product_id
JOIN product_purchase_packs pp ON pp.product_id = p.id AND pp.label = uc.label
SET uc.factor = pp.factor,
    uc.is_purchase_default = pp.is_default,
    uc.sale_price = CASE WHEN pp.label = 'UN' THEN p.sale_price ELSE p.sale_price * pp.factor END,
    uc.barcode = CASE WHEN pp.label = 'UN' THEN p.barcode ELSE CONCAT(p.barcode, '-', REPLACE(pp.label, ' ', '')) END,
    uc.updated_at = NOW();

UPDATE product_uom_conversions uc
JOIN products p ON p.id = uc.product_id
SET uc.barcode = p.barcode,
    uc.factor = 1,
    uc.is_sale_default = 1,
    uc.sale_price = p.sale_price,
    uc.updated_at = NOW()
WHERE uc.label = 'UN';

-- 10. Crear conversiones UOM faltantes
INSERT INTO product_uom_conversions (product_id, barcode, label, factor, sale_price, is_purchase_default, is_sale_default, created_at, updated_at)
SELECT pp.product_id,
       CASE WHEN pp.label = 'UN' THEN p.barcode
            ELSE CONCAT(p.barcode, '-', REPLACE(pp.label, ' ', ''))
       END,
       pp.label,
       pp.factor,
       CASE WHEN pp.label = 'UN' THEN p.sale_price ELSE p.sale_price * pp.factor END,
       pp.is_default,
       CASE WHEN pp.label = 'UN' THEN 1 ELSE 0 END,
       NOW(),
       NOW()
FROM product_purchase_packs pp
JOIN products p ON p.id = pp.product_id
WHERE NOT EXISTS (
    SELECT 1 FROM product_uom_conversions uc
    WHERE uc.product_id = pp.product_id AND uc.label = pp.label
);
