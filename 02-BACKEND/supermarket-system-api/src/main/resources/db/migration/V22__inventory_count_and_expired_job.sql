-- Conteo cíclico + permiso INVENTORY_COUNT

INSERT IGNORE INTO permissions (code, description) VALUES
('INVENTORY_COUNT', 'Registrar conteos ciclicos de inventario');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'INVENTORY_COUNT'
WHERE r.name IN ('BODEGUERO', 'SUPERVISOR', 'ADMINISTRADOR', 'ADMIN_INGENIERO');

CREATE TABLE IF NOT EXISTS inventory_count_sessions (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    session_code    VARCHAR(30)   NOT NULL UNIQUE,
    status          VARCHAR(20)   NOT NULL,
    notes           VARCHAR(255),
    warehouse_zone  VARCHAR(80),
    created_by      BIGINT        NOT NULL,
    submitted_at    DATETIME,
    approved_by     BIGINT,
    approved_at     DATETIME,
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME      NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_count_sessions_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_count_sessions_approved_by FOREIGN KEY (approved_by) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS inventory_count_lines (
    id                BIGINT         NOT NULL AUTO_INCREMENT,
    session_id        BIGINT         NOT NULL,
    product_id        BIGINT         NOT NULL,
    barcode           VARCHAR(50),
    system_quantity   DECIMAL(12, 4) NOT NULL,
    counted_quantity  DECIMAL(12, 4) NOT NULL DEFAULT 0,
    variance          DECIMAL(12, 4) NOT NULL DEFAULT 0,
    notes             VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_count_lines_session FOREIGN KEY (session_id) REFERENCES inventory_count_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_count_lines_product FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT uq_count_line_session_product UNIQUE (session_id, product_id)
);

CREATE INDEX idx_count_sessions_status ON inventory_count_sessions (status);
CREATE INDEX idx_count_lines_session ON inventory_count_lines (session_id);
