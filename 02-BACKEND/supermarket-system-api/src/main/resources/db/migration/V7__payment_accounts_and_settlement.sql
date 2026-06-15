CREATE TABLE IF NOT EXISTS payment_accounts (
    id                    BIGINT        NOT NULL AUTO_INCREMENT,
    name                  VARCHAR(100)  NOT NULL,
    bank_name             VARCHAR(100)  NOT NULL,
    account_holder        VARCHAR(120)  NOT NULL,
    account_number        VARCHAR(60)   NOT NULL,
    account_type          VARCHAR(30)   NOT NULL,
    currency              VARCHAR(3)    NOT NULL DEFAULT 'GTQ',
    tax_id                VARCHAR(30),
    gateway_provider      VARCHAR(40)   NOT NULL DEFAULT 'MOCK',
    merchant_id           VARCHAR(80),
    terminal_id           VARCHAR(80),
    commission_percentage DECIMAL(7,4)  NOT NULL DEFAULT 0.0000,
    settlement_days       INT           NOT NULL DEFAULT 2,
    is_default            BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

ALTER TABLE payment_gateway_transactions
    ADD COLUMN payment_account_id BIGINT NULL,
    ADD COLUMN commission_amount DECIMAL(12,4) NULL,
    ADD COLUMN net_amount DECIMAL(12,4) NULL,
    ADD COLUMN settlement_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN expected_settlement_date DATE NULL,
    ADD COLUMN settled_at DATETIME NULL;

ALTER TABLE payment_gateway_transactions
    ADD CONSTRAINT fk_payment_gateway_account
    FOREIGN KEY (payment_account_id) REFERENCES payment_accounts (id);

CREATE INDEX idx_payment_accounts_active_default ON payment_accounts (is_active, is_default);
CREATE INDEX idx_payment_gateway_settlement ON payment_gateway_transactions (settlement_status, expected_settlement_date);
