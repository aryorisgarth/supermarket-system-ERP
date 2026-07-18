-- Cebolla Amarilla PLU 1234 (ejemplo etiqueta balanza 2001234020008)
INSERT INTO products (
  barcode, name, description, purchase_price, sale_price, current_stock, minimum_stock,
  uom_base, is_active, created_at, updated_at, category_id, supplier_id, tax_category_id, min_stock_exhibicion
) VALUES (
  '1234', 'Cebolla Amarilla', 'Cebolla amarilla a granel, precio por peso', 7.00, 11.00, 250, 20,
  'LB', 1, NOW(), NOW(), 10, 2, 1, 5
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  uom_base = VALUES(uom_base),
  is_active = 1,
  updated_at = NOW();

INSERT INTO product_locations (product_id, location_id, stock, created_at, updated_at)
SELECT p.id, bod.id, p.current_stock, NOW(), NOW()
FROM products p
CROSS JOIN (SELECT id FROM locations WHERE location_code = 'BOD-DEFAULT' LIMIT 1) bod
WHERE p.barcode = '1234'
  AND NOT EXISTS (
    SELECT 1 FROM product_locations pl WHERE pl.product_id = p.id AND pl.location_id = bod.id
  );
