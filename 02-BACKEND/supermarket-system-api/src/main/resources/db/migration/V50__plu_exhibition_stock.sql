-- Stock en piso de venta para productos PLU (demo balanza / POS)
INSERT INTO locations (warehouse, aisle, shelf, level, location_code, is_piso_venta, created_at, updated_at)
SELECT 'Piso Venta', 'Frutas', '1', '1', 'PV-FRUTAS-PLU', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE location_code = 'PV-FRUTAS-PLU');

INSERT INTO product_locations (product_id, location_id, stock, created_at, updated_at)
SELECT p.id, pv.id, GREATEST(p.current_stock * 0.4, 50), NOW(), NOW()
FROM products p
CROSS JOIN (SELECT id FROM locations WHERE location_code = 'PV-FRUTAS-PLU' LIMIT 1) pv
WHERE p.barcode IN ('4011','4065','4056','3045','4959','3085','3124','4543','4384','1234','4196')
  AND p.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM product_locations pl WHERE pl.product_id = p.id AND pl.location_id = pv.id
  );
