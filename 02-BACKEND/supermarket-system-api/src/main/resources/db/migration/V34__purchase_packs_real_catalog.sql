-- V33 usó nombres del catálogo demo; aquí se aplican plantillas al catálogo real del usuario.

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJILLA', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Bebidas') AND LOWER(p.name) NOT LIKE '%huevo%';

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Bebidas') AND LOWER(p.name) NOT LIKE '%huevo%';

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Lacteos', 'Congelados') AND LOWER(p.name) NOT LIKE '%huevo%';

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Lacteos', 'Congelados') AND LOWER(p.name) NOT LIKE '%huevo%';

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos basicos', 'General', 'Snacks', 'Panaderia', 'Mascotas');

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'FARDO', 12, 0, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos basicos', 'General', 'Snacks', 'Panaderia', 'Mascotas');

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'SACO', 50, 1, 3 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Granos basicos', 'General', 'Snacks', 'Panaderia', 'Mascotas');

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'PAQ', 6, 0, 1 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Limpieza', 'Higiene Personal');

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 12, 1, 2 FROM products p
JOIN categories c ON c.id = p.category_id
WHERE c.name IN ('Limpieza', 'Higiene Personal');

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
