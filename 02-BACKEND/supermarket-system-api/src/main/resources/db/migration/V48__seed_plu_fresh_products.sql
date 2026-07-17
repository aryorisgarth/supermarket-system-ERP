-- Catálogo PLU (frutas/verduras por peso) para balanza y POS.
-- El catálogo V35 no incluía códigos cortos; sin esto las etiquetas EAN-13 no resuelven en caja.

INSERT INTO categories (id, name, description, default_requires_batch, default_requires_expiration)
VALUES (10, 'Frutas y Verduras', 'Productos frescos vendidos por peso (PLU)', 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (
  barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock,
  uom_base, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id, min_stock_exhibicion
) VALUES
  ('4011', 'Plátano / Banana', 'Plátano maduro, precio por kg', 8.00, 12.50, 250, 20, 'KG', 1, NOW(), NOW(), 10, 1, 1, 5),
  ('4065', 'Mango Ataulfo', 'Mango fresco, precio por kg', 10.00, 18.00, 180, 15, 'KG', 1, NOW(), NOW(), 10, 1, 1, 5),
  ('4056', 'Naranja Valencia', 'Naranja jugosa, precio por kg', 7.00, 11.00, 220, 25, 'KG', 1, NOW(), NOW(), 10, 1, 1, 5),
  ('3045', 'Manzana Roja', 'Manzana importada, precio por kg', 22.00, 35.00, 120, 15, 'KG', 1, NOW(), NOW(), 10, 1, 1, 5),
  ('4959', 'Aguacate Hass', 'Aguacate, precio por kg', 35.00, 55.00, 140, 15, 'KG', 1, NOW(), NOW(), 10, 1, 1, 5),
  ('3085', 'Papa Blanca', 'Papa a granel, precio por kg', 6.00, 9.50, 400, 30, 'KG', 1, NOW(), NOW(), 10, 2, 1, 5),
  ('3124', 'Tomate Bola', 'Tomate rojo, precio por kg', 8.00, 13.00, 300, 25, 'KG', 1, NOW(), NOW(), 10, 2, 1, 5),
  ('4543', 'Zanahoria', 'Zanahoria fresca, precio por kg', 5.50, 8.50, 280, 20, 'KG', 1, NOW(), NOW(), 10, 2, 1, 5),
  ('4384', 'Pepino', 'Pepino fresco, precio por kg', 5.00, 8.00, 200, 15, 'KG', 1, NOW(), NOW(), 10, 2, 1, 5),
  ('4196', 'Piña', 'Piña golden, precio por pieza', 15.00, 25.00, 80, 10, 'UN', 1, NOW(), NOW(), 10, 1, 1, 5)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  uom_base = VALUES(uom_base),
  sale_price = VALUES(sale_price),
  is_active = 1,
  updated_at = NOW();

-- Stock en bodega por defecto para productos PLU nuevos
INSERT INTO product_locations (product_id, location_id, stock, created_at, updated_at)
SELECT p.id, bod.id, p.current_stock, NOW(), NOW()
FROM products p
CROSS JOIN (SELECT id FROM locations WHERE location_code = 'BOD-DEFAULT' LIMIT 1) bod
WHERE p.barcode IN ('4011','4065','4056','3045','4959','3085','3124','4543','4384','4196')
  AND NOT EXISTS (
    SELECT 1 FROM product_locations pl WHERE pl.product_id = p.id AND pl.location_id = bod.id
  );
