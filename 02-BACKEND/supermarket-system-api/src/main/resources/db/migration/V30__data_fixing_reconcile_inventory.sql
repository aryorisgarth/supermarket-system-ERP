-- V30__data_fixing_reconcile_inventory.sql
-- 1. Reconciliación del Kardex: Crear movimientos de tipo ENTRY el 2026-01-01 por la diferencia
INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, factor, previous_stock, new_stock, notes, created_at)
SELECT 
    p.id, 
    1, -- Administrador
    'ENTRY', 
    p.current_stock - COALESCE(SUM(im.quantity * im.factor), 0) AS diferencia_inicial,
    1, 
    0.0000, 
    p.current_stock - COALESCE(SUM(im.quantity * im.factor), 0), 
    'Reconciliación contable automática: Carga de stock inicial omitida en semillas',
    '2026-01-01 00:00:00'
FROM products p
LEFT JOIN inventory_movements im ON im.product_id = p.id
GROUP BY p.id, p.current_stock
HAVING (p.current_stock - COALESCE(SUM(im.quantity * im.factor), 0)) > 0;

-- 2. Reconciliación de Lotes: Crear lotes genéricos de apertura para productos sin lotes
INSERT INTO product_batches (product_id, batch_code, initial_quantity, current_quantity, entry_date, expiration_date, created_at)
SELECT 
    p.id,
    CONCAT('LOT-INIT-', p.barcode),
    p.current_stock,
    p.current_stock,
    '2026-01-01',
    '2031-01-01', -- 5 años de vigencia para evitar bloqueos por caducidad en el POS
    NOW()
FROM products p
LEFT JOIN product_batches b ON b.product_id = p.id
WHERE p.current_stock > 0 
  AND b.id IS NULL;
