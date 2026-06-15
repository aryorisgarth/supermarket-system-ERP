-- ============================================================
-- V2__performance_indexes.sql
-- Creación de índices inteligente para MySQL (Idempotente)
-- ============================================================

DROP PROCEDURE IF EXISTS CreateIndexSafe;

DELIMITER //

CREATE PROCEDURE CreateIndexSafe(
    IN tableName VARCHAR(64),
    IN indexName VARCHAR(64),
    IN columnList VARCHAR(255)
)
BEGIN
    -- Verificar si la columna existe (solo para el primer campo si es compuesta)
    -- Tomamos la primera columna antes de la coma si es compuesta
    SET @firstColumn = SUBSTRING_INDEX(columnList, ',', 1);
    
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = tableName 
        AND column_name = @firstColumn
    ) AND NOT EXISTS (
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

-- Productos
CALL CreateIndexSafe('products', 'idx_products_barcode', 'barcode');
CALL CreateIndexSafe('products', 'idx_products_is_active', 'is_active');
CALL CreateIndexSafe('products', 'idx_products_category', 'category_id');
CALL CreateIndexSafe('products', 'idx_products_supplier', 'supplier_id');
CALL CreateIndexSafe('products', 'idx_products_tax_category', 'tax_category_id');

-- Lotes
CALL CreateIndexSafe('product_batches', 'idx_batches_expiration', 'expiration_date');
CALL CreateIndexSafe('product_batches', 'idx_batches_product', 'product_id');

-- Ventas
CALL CreateIndexSafe('sales', 'idx_sales_sale_date', 'sale_date');
CALL CreateIndexSafe('sales', 'idx_sales_status', 'status');
CALL CreateIndexSafe('sales', 'idx_sales_user', 'user_id');
CALL CreateIndexSafe('sales', 'idx_sales_session', 'session_id');
CALL CreateIndexSafe('sales', 'idx_sales_invoice_number', 'invoice_number');

-- Clientes
CALL CreateIndexSafe('customers', 'idx_customers_document_id', 'document_id');

-- Usuarios
CALL CreateIndexSafe('users', 'idx_users_email', 'email');
CALL CreateIndexSafe('users', 'idx_users_role', 'role_id');

-- Sesiones de caja
CALL CreateIndexSafe('cash_register_sessions', 'idx_sessions_user_status', 'user_id, status');

-- Movimientos
CALL CreateIndexSafe('inventory_movements', 'idx_movements_product', 'product_id');
CALL CreateIndexSafe('inventory_movements', 'idx_movements_created_at', 'created_at');
CALL CreateIndexSafe('inventory_movements', 'idx_movements_type', 'movement_type');

-- Notas de crédito
CALL CreateIndexSafe('credit_notes', 'idx_credit_notes_session', 'session_id');

-- Pagos
CALL CreateIndexSafe('sale_payments', 'idx_sale_payments_sale', 'sale_id');
CALL CreateIndexSafe('sale_payments', 'idx_sale_payments_method', 'payment_method');

DROP PROCEDURE CreateIndexSafe;
