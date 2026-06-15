CREATE TABLE IF NOT EXISTS purchase_orders (
    id              BIGINT         NOT NULL AUTO_INCREMENT,
    order_number    VARCHAR(40)    NOT NULL UNIQUE,
    status          VARCHAR(20)    NOT NULL,
    subtotal        DECIMAL(12,4)  NOT NULL DEFAULT 0,
    notes           VARCHAR(255),
    ordered_at      DATETIME,
    received_at     DATETIME,
    created_at      DATETIME       NOT NULL,
    updated_at      DATETIME       NOT NULL,
    supplier_id     INTEGER        NOT NULL,
    created_by_id   BIGINT         NOT NULL,
    received_by_id  BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT fk_purchase_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_purchase_orders_created_by FOREIGN KEY (created_by_id) REFERENCES users (id),
    CONSTRAINT fk_purchase_orders_received_by FOREIGN KEY (received_by_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id                  BIGINT         NOT NULL AUTO_INCREMENT,
    quantity_ordered    DECIMAL(12,4)  NOT NULL,
    quantity_received   DECIMAL(12,4)  NOT NULL DEFAULT 0,
    unit_cost           DECIMAL(12,4)  NOT NULL,
    line_total          DECIMAL(12,4)  NOT NULL,
    purchase_order_id   BIGINT         NOT NULL,
    product_id          BIGINT         NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_purchase_items_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id),
    CONSTRAINT fk_purchase_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE INDEX idx_purchase_orders_status ON purchase_orders (status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders (supplier_id);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders (created_at);
CREATE INDEX idx_purchase_items_order ON purchase_order_items (purchase_order_id);
CREATE INDEX idx_purchase_items_product ON purchase_order_items (product_id);
