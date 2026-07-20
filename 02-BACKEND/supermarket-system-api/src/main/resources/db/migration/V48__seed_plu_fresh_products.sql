-- Catálogo PLU (frutas/verduras por peso) para balanza y POS.
-- Reutiliza categoría existente por nombre (Nicaragua demo puede tener id distinto de 10).

INSERT INTO categories (name, description, default_requires_batch, default_requires_expiration)
SELECT 'Frutas y Verduras', 'Productos frescos vendidos por peso (PLU)', 0, 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Frutas y Verduras');

INSERT IGNORE INTO products (
  barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock,
  uom_base, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id, min_stock_exhibicion
)
SELECT
  seed.barcode,
  seed.name,
  seed.description,
  seed.purchase_price,
  seed.sale_price,
  seed.current_stock,
  seed.minimum_stock,
  seed.uom_base,
  1,
  NOW(),
  NOW(),
  cat.id,
  COALESCE(
    (SELECT id FROM suppliers WHERE id = seed.supplier_id LIMIT 1),
    (SELECT id FROM suppliers ORDER BY id LIMIT 1)
  ),
  COALESCE(
    (SELECT id FROM tax_categories WHERE is_active = 1 ORDER BY id LIMIT 1),
    1
  ),
  seed.min_stock_exhibicion
FROM (
  SELECT '4011' AS barcode, 'Plátano / Banana' AS name, 'Plátano maduro, precio por kg' AS description,
         8.00 AS purchase_price, 12.50 AS sale_price, 250 AS current_stock, 20 AS minimum_stock,
         'KG' AS uom_base, 1 AS supplier_id, 5 AS min_stock_exhibicion
  UNION ALL SELECT '4065', 'Mango Ataulfo', 'Mango fresco, precio por kg', 10.00, 18.00, 180, 15, 'KG', 1, 5
  UNION ALL SELECT '4056', 'Naranja Valencia', 'Naranja jugosa, precio por kg', 7.00, 11.00, 220, 25, 'KG', 1, 5
  UNION ALL SELECT '3045', 'Manzana Roja', 'Manzana importada, precio por kg', 22.00, 35.00, 120, 15, 'KG', 1, 5
  UNION ALL SELECT '4959', 'Aguacate Hass', 'Aguacate, precio por kg', 35.00, 55.00, 140, 15, 'KG', 1, 5
  UNION ALL SELECT '3085', 'Papa Blanca', 'Papa a granel, precio por kg', 6.00, 9.50, 400, 30, 'KG', 2, 5
  UNION ALL SELECT '3124', 'Tomate Bola', 'Tomate rojo, precio por kg', 8.00, 13.00, 300, 25, 'KG', 2, 5
  UNION ALL SELECT '4543', 'Zanahoria', 'Zanahoria fresca, precio por kg', 5.50, 8.50, 280, 20, 'KG', 2, 5
  UNION ALL SELECT '4384', 'Pepino', 'Pepino fresco, precio por kg', 5.00, 8.00, 200, 15, 'KG', 2, 5
  UNION ALL SELECT '1234', 'Cebolla Amarilla', 'Cebolla amarilla a granel, precio por peso', 7.00, 11.00, 250, 20, 'LB', 2, 5
  UNION ALL SELECT '4196', 'Piña', 'Piña golden, precio por pieza', 15.00, 25.00, 80, 10, 'UN', 1, 5
) seed
CROSS JOIN (SELECT id FROM categories WHERE name = 'Frutas y Verduras' LIMIT 1) cat;

UPDATE products p
INNER JOIN (
  SELECT '4011' AS barcode, 'Plátano / Banana' AS name, 'Plátano maduro, precio por kg' AS description,
         8.00 AS purchase_price, 12.50 AS sale_price, 'KG' AS uom_base
  UNION ALL SELECT '4065', 'Mango Ataulfo', 'Mango fresco, precio por kg', 10.00, 18.00, 'KG'
  UNION ALL SELECT '4056', 'Naranja Valencia', 'Naranja jugosa, precio por kg', 7.00, 11.00, 'KG'
  UNION ALL SELECT '3045', 'Manzana Roja', 'Manzana importada, precio por kg', 22.00, 35.00, 'KG'
  UNION ALL SELECT '4959', 'Aguacate Hass', 'Aguacate, precio por kg', 35.00, 55.00, 'KG'
  UNION ALL SELECT '3085', 'Papa Blanca', 'Papa a granel, precio por kg', 6.00, 9.50, 'KG'
  UNION ALL SELECT '3124', 'Tomate Bola', 'Tomate rojo, precio por kg', 8.00, 13.00, 'KG'
  UNION ALL SELECT '4543', 'Zanahoria', 'Zanahoria fresca, precio por kg', 5.50, 8.50, 'KG'
  UNION ALL SELECT '4384', 'Pepino', 'Pepino fresco, precio por kg', 5.00, 8.00, 'KG'
  UNION ALL SELECT '1234', 'Cebolla Amarilla', 'Cebolla amarilla a granel, precio por peso', 7.00, 11.00, 'LB'
  UNION ALL SELECT '4196', 'Piña', 'Piña golden, precio por pieza', 15.00, 25.00, 'UN'
) seed ON p.barcode = seed.barcode
CROSS JOIN (SELECT id FROM categories WHERE name = 'Frutas y Verduras' LIMIT 1) cat
SET
  p.name = seed.name,
  p.description = seed.description,
  p.uom_base = seed.uom_base,
  p.sale_price = seed.sale_price,
  p.category_id = cat.id,
  p.is_active = 1,
  p.updated_at = NOW();

-- Stock en bodega por defecto para productos PLU nuevos
INSERT INTO product_locations (product_id, location_id, stock, created_at, updated_at)
SELECT p.id, bod.id, p.current_stock, NOW(), NOW()
FROM products p
CROSS JOIN (SELECT id FROM locations WHERE location_code = 'BOD-DEFAULT' LIMIT 1) bod
WHERE p.barcode IN ('4011','4065','4056','3045','4959','3085','3124','4543','4384','1234','4196')
  AND NOT EXISTS (
    SELECT 1 FROM product_locations pl WHERE pl.product_id = p.id AND pl.location_id = bod.id
  );
