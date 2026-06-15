-- Facturación electrónica y transacciones de pasarela de pago

CREATE TABLE IF NOT EXISTS electronic_invoices (
    id                   BIGINT       NOT NULL AUTO_INCREMENT,
    sale_id              BIGINT       NOT NULL,
    country_code         VARCHAR(5)   NOT NULL,
    provider_code        VARCHAR(40)  NOT NULL,
    status               VARCHAR(20)  NOT NULL,
    authorization_number VARCHAR(100),
    fiscal_uuid          VARCHAR(100),
    issuer_tax_id        VARCHAR(30)  NOT NULL,
    receiver_tax_id      VARCHAR(30),
    error_message        TEXT,
    authorized_at        DATETIME,
    created_at           DATETIME     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_electronic_invoices_sale (sale_id),
    CONSTRAINT fk_electronic_invoices_sales FOREIGN KEY (sale_id) REFERENCES sales (id)
);

CREATE TABLE IF NOT EXISTS payment_gateway_transactions (
    id                 BIGINT        NOT NULL AUTO_INCREMENT,
    sale_id            BIGINT        NOT NULL,
    provider_code      VARCHAR(40)   NOT NULL,
    external_reference VARCHAR(120),
    amount             DECIMAL(12,4) NOT NULL,
    currency           VARCHAR(3)    NOT NULL DEFAULT 'GTQ',
    status             VARCHAR(20)   NOT NULL,
    payment_method     VARCHAR(20)   NOT NULL,
    raw_response       JSON,
    created_at         DATETIME      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_payment_gateway_sales FOREIGN KEY (sale_id) REFERENCES sales (id)
);

CREATE INDEX idx_electronic_invoices_status ON electronic_invoices (status);
CREATE INDEX idx_payment_gateway_sale ON payment_gateway_transactions (sale_id);
