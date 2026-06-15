-- ============================================================
-- V28__create_notification_rules.sql
-- Creación de la tabla de reglas de notificación y semillas iniciales
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_rules (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    alert_type    VARCHAR(60)  NOT NULL, -- E.g. 'INVENTORY', 'CASH_REGISTER', 'FINANCE', 'PURCHASE'
    severity      VARCHAR(20)  NOT NULL, -- E.g. 'CRITICAL', 'WARNING', 'INFO'
    channel       VARCHAR(20)  NOT NULL, -- E.g. 'EMAIL', 'UI_PANEL'
    role_id       TINYINT      NOT NULL, -- Relación con el rol destinatario
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_notification_rules_roles FOREIGN KEY (role_id) REFERENCES roles (id),
    CONSTRAINT uk_notification_rules_routing UNIQUE (alert_type, severity, role_id, channel)
);

-- Semillas iniciales: Enrutamientos básicos por defecto
INSERT INTO notification_rules (alert_type, severity, channel, role_id, is_active, created_at, updated_at)
VALUES 
-- Alertas Críticas de Inventario: UI para Bodegueros, Correo para el Administrador
('INVENTORY', 'CRITICAL', 'UI_PANEL', (SELECT id FROM roles WHERE name = 'BODEGUERO'), TRUE, NOW(), NOW()),
('INVENTORY', 'CRITICAL', 'EMAIL', (SELECT id FROM roles WHERE name = 'ADMINISTRADOR'), TRUE, NOW(), NOW()),

-- Alertas de Caja: UI para Supervisores, Correo para el Administrador
('CASH_REGISTER', 'WARNING', 'UI_PANEL', (SELECT id FROM roles WHERE name = 'SUPERVISOR'), TRUE, NOW(), NOW()),
('CASH_REGISTER', 'CRITICAL', 'EMAIL', (SELECT id FROM roles WHERE name = 'ADMINISTRADOR'), TRUE, NOW(), NOW()),

-- Alertas Financieras / Liquidaciones: Correo inmediato para el Administrador
('FINANCE', 'WARNING', 'EMAIL', (SELECT id FROM roles WHERE name = 'ADMINISTRADOR'), TRUE, NOW(), NOW());
