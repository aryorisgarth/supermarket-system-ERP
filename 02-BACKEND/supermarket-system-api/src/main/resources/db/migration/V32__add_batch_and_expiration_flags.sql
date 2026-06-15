-- ============================================================
-- V32__add_batch_and_expiration_flags.sql
-- ============================================================

-- 1. Agregar flags a la tabla categories
ALTER TABLE categories 
ADD COLUMN default_requires_batch BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN default_requires_expiration BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Agregar flags a la tabla products
ALTER TABLE products 
ADD COLUMN requires_batch BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN requires_expiration BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Modificar la tabla de líneas de conteo físico para soportar lotes
ALTER TABLE inventory_count_lines 
ADD COLUMN batch_id BIGINT NULL,
ADD CONSTRAINT fk_count_lines_batches FOREIGN KEY (batch_id) REFERENCES product_batches(id);

-- 4. Eliminar la restricción de clave única antigua
ALTER TABLE inventory_count_lines 
DROP INDEX uq_count_line_session_product;

-- 5. Crear la nueva restricción única incluyendo batch_id
-- Nota: En MySQL, múltiples combinaciones con valores NULL en batch_id son permitidas por el motor,
-- lo cual nos permite mantener conteos sin lote de forma compatible.
ALTER TABLE inventory_count_lines 
ADD CONSTRAINT uq_count_line_session_product_batch UNIQUE (session_id, product_id, batch_id);
