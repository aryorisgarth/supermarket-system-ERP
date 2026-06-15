-- ============================================================
-- V1__initial_schema.sql
-- Supermarket System - Migración inicial completa
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT      NOT NULL AUTO_INCREMENT,
    name        VARCHAR(30)  NOT NULL UNIQUE,
    description VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    full_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME     NOT NULL,
    role_id    TINYINT      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_users_roles FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE IF NOT EXISTS categories (
    id          SMALLINT     NOT NULL AUTO_INCREMENT,
    name        VARCHAR(60)  NOT NULL UNIQUE,
    description TEXT,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS suppliers (
    id           INTEGER      NOT NULL AUTO_INCREMENT,
    company_name VARCHAR(100) NOT NULL UNIQUE,
    contact_name VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(100),
    address      VARCHAR(255),
    created_at   DATETIME     NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tax_categories (
    id         INTEGER     NOT NULL AUTO_INCREMENT,
    name       VARCHAR(50) NOT NULL UNIQUE,
    percentage DECIMAL(5,2) NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    barcode         VARCHAR(50)   NOT NULL UNIQUE,
    name            VARCHAR(100)  NOT NULL,
    description     TEXT,
    purchase_price  DECIMAL(12,4) NOT NULL,
    sale_price      DECIMAL(12,4) NOT NULL,
    current_stock   DECIMAL(12,4) NOT NULL DEFAULT 0,
    minimum_stock   DECIMAL(12,4) NOT NULL DEFAULT 5,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME      NOT NULL,
    category_id     SMALLINT      NOT NULL,
    supplier_id     INTEGER       NOT NULL,
    tax_category_id INTEGER       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_products_categories FOREIGN KEY (category_id)     REFERENCES categories (id),
    CONSTRAINT fk_products_suppliers  FOREIGN KEY (supplier_id)      REFERENCES suppliers (id),
    CONSTRAINT fk_products_taxes      FOREIGN KEY (tax_category_id)  REFERENCES tax_categories (id)
);

CREATE TABLE IF NOT EXISTS product_batches (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    batch_code       VARCHAR(50)   NOT NULL UNIQUE,
    initial_quantity DECIMAL(12,4) NOT NULL,
    current_quantity DECIMAL(12,4) NOT NULL,
    entry_date       DATE          NOT NULL,
    expiration_date  DATE          NOT NULL,
    created_at       DATETIME      NOT NULL,
    product_id       BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_batches_products FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS customers (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100) NOT NULL,
    document_id VARCHAR(20)  UNIQUE,
    email       VARCHAR(100),
    phone       VARCHAR(20),
    address     TEXT,
    created_at  DATETIME     NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cash_register_sessions (
    id                        BIGINT        NOT NULL AUTO_INCREMENT,
    opened_at                 DATETIME      NOT NULL,
    closed_at                 DATETIME,
    opening_balance           DECIMAL(12,4) NOT NULL,
    system_calculated_balance DECIMAL(12,4),
    actual_closing_balance    DECIMAL(12,4),
    difference                DECIMAL(12,4),
    status                    VARCHAR(20)   NOT NULL,
    notes                     TEXT,
    user_id                   BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cash_session_users FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS sales (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    invoice_number VARCHAR(50)   NOT NULL UNIQUE,
    status         VARCHAR(20)   NOT NULL,
    subtotal       DECIMAL(12,4) NOT NULL,
    total_tax      DECIMAL(12,4) NOT NULL,
    total_amount   DECIMAL(12,4) NOT NULL,
    change_amount  DECIMAL(12,4) NOT NULL DEFAULT 0,
    sale_date      DATETIME      NOT NULL,
    customer_id    BIGINT,
    user_id        BIGINT        NOT NULL,
    session_id     BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sales_customers FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_sales_users     FOREIGN KEY (user_id)     REFERENCES users (id),
    CONSTRAINT fk_sales_session   FOREIGN KEY (session_id)  REFERENCES cash_register_sessions (id)
);

CREATE TABLE IF NOT EXISTS sale_details (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    quantity        DECIMAL(12,4) NOT NULL,
    unit_price      DECIMAL(12,4) NOT NULL,
    tax_applied     DECIMAL(5,2)  NOT NULL,
    discount_amount DECIMAL(12,4) NOT NULL DEFAULT 0,
    subtotal        DECIMAL(12,4) NOT NULL,
    sale_id         BIGINT        NOT NULL,
    product_id      BIGINT        NOT NULL,
    batch_id        BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_sale_details_sales    FOREIGN KEY (sale_id)    REFERENCES sales (id),
    CONSTRAINT fk_sale_details_products FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_sale_details_batches  FOREIGN KEY (batch_id)   REFERENCES product_batches (id)
);

CREATE TABLE IF NOT EXISTS sale_payments (
    id             BIGINT        NOT NULL AUTO_INCREMENT,
    payment_method VARCHAR(20)   NOT NULL,
    amount         DECIMAL(12,4) NOT NULL,
    sale_id        BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sale_payments_sales FOREIGN KEY (sale_id) REFERENCES sales (id)
);

CREATE TABLE IF NOT EXISTS credit_notes (
    id         BIGINT        NOT NULL AUTO_INCREMENT,
    amount     DECIMAL(12,4) NOT NULL,
    reason     VARCHAR(255)  NOT NULL,
    created_at DATETIME      NOT NULL,
    sale_id    BIGINT        NOT NULL UNIQUE,
    session_id BIGINT        NOT NULL,
    user_id    BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_credit_notes_sales   FOREIGN KEY (sale_id)    REFERENCES sales (id),
    CONSTRAINT fk_credit_notes_session FOREIGN KEY (session_id) REFERENCES cash_register_sessions (id),
    CONSTRAINT fk_credit_notes_users   FOREIGN KEY (user_id)    REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id            BIGINT        NOT NULL AUTO_INCREMENT,
    movement_type VARCHAR(30)   NOT NULL,
    quantity      DECIMAL(12,4) NOT NULL,
    factor        TINYINT       NOT NULL,
    reference_id  BIGINT,
    notes         TEXT,
    created_at    DATETIME      NOT NULL,
    product_id    BIGINT        NOT NULL,
    batch_id      BIGINT,
    user_id       BIGINT        NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_movements_products FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_movements_batches  FOREIGN KEY (batch_id)   REFERENCES product_batches (id),
    CONSTRAINT fk_movements_users    FOREIGN KEY (user_id)    REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    user_id        BIGINT,
    action         VARCHAR(50),
    affected_table VARCHAR(50),
    record_id      BIGINT,
    old_values     TEXT,
    new_values     TEXT,
    ip_address     VARCHAR(45),
    log_date       DATETIME     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_users FOREIGN KEY (user_id) REFERENCES users (id)
);
