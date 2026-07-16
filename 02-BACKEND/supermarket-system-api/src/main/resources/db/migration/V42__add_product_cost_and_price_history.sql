SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'last_purchase_cost'
);
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE products ADD COLUMN last_purchase_cost DECIMAL(12,4) NULL AFTER purchase_price',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'average_cost'
);
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE products ADD COLUMN average_cost DECIMAL(12,4) NULL AFTER last_purchase_cost',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'min_margin_percent'
);
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE products ADD COLUMN min_margin_percent DECIMAL(8,4) NOT NULL DEFAULT 20.0000 AFTER average_cost',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'products'
      AND COLUMN_NAME = 'pricing_policy'
);
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE products ADD COLUMN pricing_policy VARCHAR(30) NOT NULL DEFAULT ''MANUAL'' AFTER min_margin_percent',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE products
SET last_purchase_cost = purchase_price,
    average_cost = purchase_price
WHERE last_purchase_cost IS NULL
   OR average_cost IS NULL;

ALTER TABLE products
    MODIFY COLUMN last_purchase_cost DECIMAL(12,4) NOT NULL,
    MODIFY COLUMN average_cost DECIMAL(12,4) NOT NULL;

CREATE TABLE IF NOT EXISTS product_cost_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    purchase_order_id BIGINT NULL,
    purchase_order_item_id BIGINT NULL,
    supplier_id INT NULL,
    previous_last_cost DECIMAL(12,4) NULL,
    new_last_cost DECIMAL(12,4) NOT NULL,
    previous_average_cost DECIMAL(12,4) NULL,
    new_average_cost DECIMAL(12,4) NOT NULL,
    quantity_before DECIMAL(12,4) NOT NULL,
    quantity_received DECIMAL(12,4) NOT NULL,
    quantity_after DECIMAL(12,4) NOT NULL,
    cost_method VARCHAR(40) NOT NULL,
    reason VARCHAR(40) NOT NULL,
    user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_cost_history_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_product_cost_history_supplier
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    CONSTRAINT fk_product_cost_history_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_cost_history_product_created (product_id, created_at),
    INDEX idx_product_cost_history_supplier_created (supplier_id, created_at),
    INDEX idx_product_cost_history_purchase_order (purchase_order_id),
    INDEX idx_product_cost_history_reason (reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_sale_price_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    previous_sale_price DECIMAL(12,4) NOT NULL,
    new_sale_price DECIMAL(12,4) NOT NULL,
    cost_reference VARCHAR(40) NOT NULL,
    margin_before_percent DECIMAL(12,4) NULL,
    margin_after_percent DECIMAL(12,4) NULL,
    reason VARCHAR(40) NOT NULL,
    notes VARCHAR(255) NULL,
    user_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_sale_price_history_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_product_sale_price_history_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_product_sale_price_history_product_created (product_id, created_at),
    INDEX idx_product_sale_price_history_reason (reason)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
