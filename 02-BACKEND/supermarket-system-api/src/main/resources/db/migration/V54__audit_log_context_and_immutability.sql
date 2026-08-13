-- Contexto del actor y protección append-only de audit_logs

ALTER TABLE audit_logs
    ADD COLUMN user_agent VARCHAR(512) NULL AFTER ip_address,
    ADD COLUMN actor_role_name VARCHAR(30) NULL AFTER user_agent,
    ADD COLUMN actor_display_name VARCHAR(100) NULL AFTER actor_role_name;

UPDATE audit_logs al
LEFT JOIN users u ON u.id = al.user_id
LEFT JOIN roles r ON r.id = u.role_id
SET al.actor_display_name = COALESCE(al.actor_display_name, u.full_name),
    al.actor_role_name = COALESCE(al.actor_role_name, r.name)
WHERE al.user_id IS NOT NULL;

DROP TRIGGER IF EXISTS audit_logs_block_delete;
DROP TRIGGER IF EXISTS audit_logs_block_update;

CREATE TRIGGER audit_logs_block_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Los registros de auditoría no pueden eliminarse';
END;

CREATE TRIGGER audit_logs_block_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW
BEGIN
    IF NOT (
        (OLD.user_id IS NOT NULL AND NEW.user_id IS NULL)
        AND OLD.id <=> NEW.id
        AND OLD.action <=> NEW.action
        AND OLD.affected_table <=> NEW.affected_table
        AND OLD.record_id <=> NEW.record_id
        AND OLD.old_values <=> NEW.old_values
        AND OLD.new_values <=> NEW.new_values
        AND OLD.ip_address <=> NEW.ip_address
        AND OLD.log_date <=> NEW.log_date
        AND (OLD.user_agent <=> NEW.user_agent)
        AND (OLD.actor_role_name <=> NEW.actor_role_name)
        AND (OLD.actor_display_name <=> NEW.actor_display_name)
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Los registros de auditoría son inmutables';
    END IF;
END;
