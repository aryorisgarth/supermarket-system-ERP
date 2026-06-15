-- Migración para eliminar los clientes ficticios / demo creados en semillas previas
-- Se actualizan las ventas previas que puedan hacer referencia a estos clientes para asociarlas con "Consumidor Final" (id: 1)
-- y se eliminan los clientes ficticios (id > 1)

UPDATE sales SET customer_id = 1 WHERE customer_id > 1;
DELETE FROM customers WHERE id > 1;
