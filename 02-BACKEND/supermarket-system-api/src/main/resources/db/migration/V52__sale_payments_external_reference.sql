ALTER TABLE sale_payments
    ADD COLUMN external_reference VARCHAR(120) NULL AFTER amount;
