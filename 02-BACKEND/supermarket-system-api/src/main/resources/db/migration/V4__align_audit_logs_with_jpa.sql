-- Alinea audit_logs con la entidad JPA AuditLog (idempotente: BD vieja o nueva)

DROP PROCEDURE IF EXISTS MigrateAuditLogsToJpa;

DELIMITER //

CREATE PROCEDURE MigrateAuditLogsToJpa()
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'audit_logs'
          AND column_name = 'entity_name'
    ) THEN
        ALTER TABLE audit_logs
            CHANGE COLUMN entity_name affected_table VARCHAR(50),
            CHANGE COLUMN entity_id record_id BIGINT,
            CHANGE COLUMN performed_at log_date DATETIME NOT NULL;

        ALTER TABLE audit_logs
            MODIFY COLUMN user_id BIGINT NULL,
            MODIFY COLUMN action VARCHAR(50) NULL,
            MODIFY COLUMN old_values TEXT,
            MODIFY COLUMN new_values TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'audit_logs'
          AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN ip_address VARCHAR(45);
    END IF;
END //

DELIMITER ;

CALL MigrateAuditLogsToJpa();

DROP PROCEDURE IF EXISTS MigrateAuditLogsToJpa;
