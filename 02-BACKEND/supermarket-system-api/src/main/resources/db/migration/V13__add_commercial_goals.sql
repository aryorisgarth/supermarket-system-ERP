-- ============================================================
-- V13__add_commercial_goals.sql
-- Supermarket System - Módulo de Metas Comerciales Atómicas
-- ============================================================

CREATE TABLE IF NOT EXISTS commercial_goals (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    name           VARCHAR(100)   NOT NULL,
    target_amount  DECIMAL(12,4)  NOT NULL,
    goal_type      VARCHAR(20)    NOT NULL, -- DAILY, WEEKLY, MONTHLY, ANNUAL, CUSTOM
    status         VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, FAILED, CANCELLED
    start_date     DATETIME       NOT NULL,
    end_date       DATETIME       NOT NULL,
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version        BIGINT         NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    CONSTRAINT chk_goals_target CHECK (target_amount > 0),
    CONSTRAINT chk_goals_dates CHECK (start_date < end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_goals_dates ON commercial_goals(start_date, end_date);
CREATE INDEX idx_goals_type_status ON commercial_goals(goal_type, status);
