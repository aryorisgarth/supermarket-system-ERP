CREATE TABLE IF NOT EXISTS cash_register_movements (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    session_id  BIGINT         NOT NULL,
    user_id     BIGINT         NOT NULL,
    type        VARCHAR(20)    NOT NULL,
    amount      DECIMAL(12,4)  NOT NULL,
    reason      VARCHAR(255)   NOT NULL,
    created_at  DATETIME       NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cash_movements_session FOREIGN KEY (session_id) REFERENCES cash_register_sessions (id),
    CONSTRAINT fk_cash_movements_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_cash_movements_session ON cash_register_movements (session_id);
CREATE INDEX idx_cash_movements_type ON cash_register_movements (type);

ALTER TABLE cash_register_sessions
    ADD COLUMN expected_cash DECIMAL(12,4),
    ADD COLUMN expected_card DECIMAL(12,4),
    ADD COLUMN expected_transfer DECIMAL(12,4),
    ADD COLUMN counted_cash DECIMAL(12,4),
    ADD COLUMN counted_card DECIMAL(12,4),
    ADD COLUMN counted_transfer DECIMAL(12,4),
    ADD COLUMN card_difference DECIMAL(12,4),
    ADD COLUMN transfer_difference DECIMAL(12,4);
