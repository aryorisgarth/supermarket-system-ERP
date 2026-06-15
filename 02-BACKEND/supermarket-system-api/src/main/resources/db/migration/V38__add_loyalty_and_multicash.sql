CREATE TABLE cash_registers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cash_register_sessions
ADD COLUMN cash_register_id BIGINT,
ADD CONSTRAINT fk_sessions_cash_registers FOREIGN KEY (cash_register_id) REFERENCES cash_registers(id);

ALTER TABLE customers
ADD COLUMN points INT NOT NULL DEFAULT 0;

ALTER TABLE sales
ADD COLUMN points_earned INT NOT NULL DEFAULT 0,
ADD COLUMN points_redeemed INT NOT NULL DEFAULT 0,
ADD COLUMN points_value DECIMAL(12, 4) NOT NULL DEFAULT 0.0000;

INSERT INTO cash_registers (name, status, description, created_at) VALUES
('Caja Terminal 01', 'ACTIVE', 'Caja registradora principal del pasillo 1', CURRENT_TIMESTAMP),
('Caja Terminal 02', 'ACTIVE', 'Caja registradora secundaria del pasillo 2', CURRENT_TIMESTAMP),
('Caja Rapida 03', 'ACTIVE', 'Caja rapida para compras menores de 10 articulos', CURRENT_TIMESTAMP);
