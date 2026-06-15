DROP PROCEDURE IF EXISTS AddColumnIfMissing;
DROP PROCEDURE IF EXISTS CreateIndexSafe;

DELIMITER //

CREATE PROCEDURE AddColumnIfMissing(
    IN tableName VARCHAR(64),
    IN columnName VARCHAR(64),
    IN columnDefinition VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = tableName
          AND column_name = columnName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE CreateIndexSafe(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN columnList VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.statistics
        WHERE table_schema = DATABASE()
          AND table_name = tableName
          AND index_name = indexName
    ) THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, ' (', columnList, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

CALL AddColumnIfMissing('inventory_movements', 'previous_stock', 'DECIMAL(12,4) NULL');
CALL AddColumnIfMissing('inventory_movements', 'new_stock', 'DECIMAL(12,4) NULL');
CALL AddColumnIfMissing('inventory_movements', 'unit_cost', 'DECIMAL(12,4) NULL');
CALL AddColumnIfMissing('inventory_movements', 'total_cost', 'DECIMAL(12,4) NULL');
CALL AddColumnIfMissing('inventory_movements', 'source_type', 'VARCHAR(30) NULL');
CALL AddColumnIfMissing('inventory_movements', 'reference_line_id', 'BIGINT NULL');

CALL AddColumnIfMissing('sale_details', 'unit_cost', 'DECIMAL(12,4) NULL');
CALL AddColumnIfMissing('sale_details', 'gross_profit', 'DECIMAL(12,4) NULL');

CALL CreateIndexSafe('inventory_movements', 'idx_movements_product_date', 'product_id, created_at');
CALL CreateIndexSafe('inventory_movements', 'idx_movements_type_date', 'movement_type, created_at');
CALL CreateIndexSafe('sale_details', 'idx_sale_details_product_sale', 'product_id, sale_id');

DROP PROCEDURE IF EXISTS AddColumnIfMissing;
DROP PROCEDURE IF EXISTS CreateIndexSafe;
