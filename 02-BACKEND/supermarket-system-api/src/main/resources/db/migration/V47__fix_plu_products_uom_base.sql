-- Alinear uom_base de productos PLU (código corto numérico) para balanza e inventario.
UPDATE products
SET uom_base = CASE
  WHEN LOWER(COALESCE(description, '')) LIKE '%pieza%'
    OR LOWER(COALESCE(description, '')) LIKE '%por pieza%'
    OR LOWER(COALESCE(name, '')) LIKE '%pieza%'
    THEN 'UN'
  ELSE 'KG'
END
WHERE is_active = TRUE
  AND barcode REGEXP '^[0-9]{1,6}$'
  AND (uom_base IS NULL OR uom_base = '' OR uom_base = 'UN');
