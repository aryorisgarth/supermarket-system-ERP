-- Devoluciones parciales y notas de crédito múltiples por venta.
-- La tabla credit_notes existía con una restricción UNIQUE en sale_id (una nota por venta).
-- La eliminamos para permitir varias devoluciones parciales y añadimos columnas + detalle.

DELIMITER //

DROP PROCEDURE IF EXISTS DropIndexSafe //
CREATE PROCEDURE DropIndexSafe(IN tbl VARCHAR(64), IN idx VARCHAR(64))
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` DROP INDEX `', idx, '`');
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END //

DROP PROCEDURE IF EXISTS AddColumnSafe //
CREATE PROCEDURE AddColumnSafe(IN tbl VARCHAR(64), IN col VARCHAR(64), IN definition VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = tbl AND column_name = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', definition);
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END //

DROP PROCEDURE IF EXISTS CreateIndexSafe2 //
CREATE PROCEDURE CreateIndexSafe2(IN tbl VARCHAR(64), IN idx VARCHAR(64), IN cols VARCHAR(255))
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics
        WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx
    ) THEN
        SET @sql = CONCAT('CREATE INDEX `', idx, '` ON `', tbl, '` (', cols, ')');
        PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- 1) Garantizar un índice no único que respalde la FK antes de quitar el UNIQUE.
CALL CreateIndexSafe2('credit_notes', 'idx_credit_notes_sale', 'sale_id');

-- 2) Quitar la restricción UNIQUE sobre sale_id (índice auto-generado "sale_id").
CALL DropIndexSafe('credit_notes', 'sale_id');

-- 3) Nuevas columnas en credit_notes.
CALL AddColumnSafe('credit_notes', 'credit_note_number', "VARCHAR(50) NULL");
CALL AddColumnSafe('credit_notes', 'type', "VARCHAR(20) NOT NULL DEFAULT 'FULL'");
CALL AddColumnSafe('credit_notes', 'subtotal', "DECIMAL(12,4) NOT NULL DEFAULT 0");
CALL AddColumnSafe('credit_notes', 'total_tax', "DECIMAL(12,4) NOT NULL DEFAULT 0");

-- Índice único parcial sobre el correlativo (permite múltiples NULL en MySQL).
CALL CreateIndexSafe2('credit_notes', 'uk_credit_notes_number', 'credit_note_number');

-- 4) Detalle de la nota de crédito (líneas devueltas).
CREATE TABLE IF NOT EXISTS credit_note_details (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    credit_note_id  BIGINT        NOT NULL,
    sale_detail_id  BIGINT        NOT NULL,
    product_id      BIGINT        NOT NULL,
    batch_id        BIGINT,
    quantity        DECIMAL(12,4) NOT NULL,
    unit_price      DECIMAL(12,4) NOT NULL,
    tax_applied     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    refund_amount   DECIMAL(12,4) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cn_details_credit_note FOREIGN KEY (credit_note_id) REFERENCES credit_notes (id),
    CONSTRAINT fk_cn_details_sale_detail FOREIGN KEY (sale_detail_id) REFERENCES sale_details (id),
    CONSTRAINT fk_cn_details_products    FOREIGN KEY (product_id)     REFERENCES products (id),
    CONSTRAINT fk_cn_details_batches     FOREIGN KEY (batch_id)       REFERENCES product_batches (id)
);

CALL CreateIndexSafe2('credit_note_details', 'idx_cn_details_credit_note', 'credit_note_id');
CALL CreateIndexSafe2('credit_note_details', 'idx_cn_details_sale_detail', 'sale_detail_id');

DROP PROCEDURE IF EXISTS DropIndexSafe;
DROP PROCEDURE IF EXISTS AddColumnSafe;
DROP PROCEDURE IF EXISTS CreateIndexSafe2;
