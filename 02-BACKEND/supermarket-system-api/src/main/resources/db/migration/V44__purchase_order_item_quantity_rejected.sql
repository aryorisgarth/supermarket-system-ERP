ALTER TABLE purchase_order_items
    ADD COLUMN quantity_rejected DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 AFTER quantity_received;
