CREATE TABLE IF NOT EXISTS promotions (
    id                  BIGINT        NOT NULL AUTO_INCREMENT,
    name                VARCHAR(120)  NOT NULL,
    description         TEXT,
    type                VARCHAR(20)   NOT NULL,
    value               DECIMAL(8,4)  NOT NULL,
    min_quantity        DECIMAL(12,4) NOT NULL DEFAULT 1,
    product_id          BIGINT,
    category_id         SMALLINT,
    expiry_days_trigger INT,
    start_date          DATE          NOT NULL,
    end_date            DATE          NOT NULL,
    is_active           TINYINT(1)    NOT NULL DEFAULT 1,
    created_at          DATETIME      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_promo_product  FOREIGN KEY (product_id)  REFERENCES products (id)  ON DELETE CASCADE,
    CONSTRAINT fk_promo_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX idx_promo_product  ON promotions (product_id);
CREATE INDEX idx_promo_category ON promotions (category_id);
CREATE INDEX idx_promo_dates    ON promotions (start_date, end_date, is_active);

INSERT IGNORE INTO permissions (code, description)
VALUES ('PROMO_MANAGE', 'Crear, editar y desactivar promociones');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r
JOIN permissions p ON p.code = 'PROMO_MANAGE'
WHERE r.name IN ('ADMINISTRADOR', 'ADMIN_INGENIERO', 'SUPERVISOR');
