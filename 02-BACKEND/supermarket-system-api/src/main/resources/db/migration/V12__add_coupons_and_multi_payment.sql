-- ============================================================
-- V12__add_coupons_and_multi_payment.sql
-- Supermarket System - Soporte para Multi-pago y Cupones/GiftCards
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
    id                BIGINT        NOT NULL AUTO_INCREMENT,
    code              VARCHAR(50)   NOT NULL UNIQUE,
    original_amount   DECIMAL(12,4) NOT NULL,
    remaining_balance DECIMAL(12,4) NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, USED, EXPIRED, VOIDED
    expiration_date   DATETIME      NULL,
    created_at        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at           DATETIME      NULL,
    version           BIGINT        NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT chk_coupons_balance CHECK (remaining_balance >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX idx_coupons_code ON coupons(code);

ALTER TABLE sale_payments 
    ADD COLUMN coupon_id BIGINT NULL,
    ADD CONSTRAINT fk_sale_payments_coupons FOREIGN KEY (coupon_id) REFERENCES coupons (id);

CREATE INDEX idx_sale_payments_coupon_id ON sale_payments(coupon_id);
