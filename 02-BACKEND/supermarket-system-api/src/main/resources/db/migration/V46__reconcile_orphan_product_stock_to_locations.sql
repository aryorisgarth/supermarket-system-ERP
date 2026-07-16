-- Reconcilia stock huérfano: products.current_stock > SUM(product_locations.stock)
-- Asigna la diferencia a BOD-DEFAULT para que el badge "Disponible" cuadre con ubicaciones.

INSERT INTO locations (warehouse, aisle, shelf, level, location_code, is_piso_venta, created_at, updated_at)
SELECT 'Bodega Central', 'A', '1', '1', 'BOD-DEFAULT', 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE location_code = 'BOD-DEFAULT');

-- Productos sin fila en BOD-DEFAULT: crear con el faltante (current_stock - suma ubicaciones)
INSERT INTO product_locations (product_id, location_id, stock, created_at, updated_at)
SELECT
	p.id,
	bod.id,
	(p.current_stock - COALESCE(loc.loc_sum, 0)),
	NOW(),
	NOW()
FROM products p
CROSS JOIN (SELECT id FROM locations WHERE location_code = 'BOD-DEFAULT' LIMIT 1) bod
LEFT JOIN (
	SELECT product_id, SUM(stock) AS loc_sum
	FROM product_locations
	GROUP BY product_id
) loc ON loc.product_id = p.id
WHERE p.current_stock > COALESCE(loc.loc_sum, 0)
	AND NOT EXISTS (
		SELECT 1 FROM product_locations pl
		WHERE pl.product_id = p.id AND pl.location_id = bod.id
	);

-- Productos que ya tienen BOD-DEFAULT (ej. en 0): sumar el faltante ahí
UPDATE product_locations pl
INNER JOIN products p ON p.id = pl.product_id
INNER JOIN locations bod ON bod.id = pl.location_id AND bod.location_code = 'BOD-DEFAULT'
INNER JOIN (
	SELECT product_id, SUM(stock) AS loc_sum
	FROM product_locations
	GROUP BY product_id
) loc ON loc.product_id = p.id
SET pl.stock = pl.stock + (p.current_stock - loc.loc_sum),
	pl.updated_at = NOW()
WHERE p.current_stock > loc.loc_sum;
