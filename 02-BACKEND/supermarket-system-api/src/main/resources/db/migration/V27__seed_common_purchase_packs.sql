-- Presentaciones comunes de compra para el catalogo demo (ademas de UN creada en V26)
INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJILLA', 6, 0, 1
FROM products p;

INSERT IGNORE INTO product_purchase_packs (product_id, label, factor, is_default, sort_order)
SELECT p.id, 'CAJA', 24, 0, 2
FROM products p;
