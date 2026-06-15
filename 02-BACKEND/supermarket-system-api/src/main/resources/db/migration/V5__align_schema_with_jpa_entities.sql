-- Alinea tablas restantes con entidades JPA (idempotente para BD creadas con V1 antiguo)

DROP PROCEDURE IF EXISTS AlignSchemaWithJpa;

DELIMITER //

CREATE PROCEDURE AlignSchemaWithJpa()
BEGIN
    -- roles.description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'description'
    ) THEN
        ALTER TABLE roles ADD COLUMN description VARCHAR(255);
    END IF;

    -- users.last_login
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login DATETIME NULL;
    END IF;

    -- product_batches.entry_date (antes received_date)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'product_batches' AND column_name = 'received_date'
    ) THEN
        ALTER TABLE product_batches CHANGE COLUMN received_date entry_date DATE NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'product_batches' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE product_batches ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- cash_register_sessions: cashier_id -> user_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'cash_register_sessions' AND column_name = 'cashier_id'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = DATABASE() AND table_name = 'cash_register_sessions'
              AND constraint_name = 'fk_sessions_users' AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE cash_register_sessions DROP FOREIGN KEY fk_sessions_users;
        END IF;

        ALTER TABLE cash_register_sessions
            CHANGE COLUMN cashier_id user_id BIGINT NOT NULL;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_schema = DATABASE() AND table_name = 'cash_register_sessions'
              AND constraint_name = 'fk_cash_session_users' AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE cash_register_sessions
                ADD CONSTRAINT fk_cash_session_users FOREIGN KEY (user_id) REFERENCES users (id);
        END IF;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = 'cash_register_sessions' AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = DATABASE() AND table_name = 'cash_register_sessions'
    ) THEN
        ALTER TABLE cash_register_sessions ADD COLUMN user_id BIGINT NOT NULL;
        ALTER TABLE cash_register_sessions
            ADD CONSTRAINT fk_cash_session_users FOREIGN KEY (user_id) REFERENCES users (id);
    END IF;

    ALTER TABLE cash_register_sessions MODIFY COLUMN status VARCHAR(20) NOT NULL;
END //

DELIMITER ;

CALL AlignSchemaWithJpa();

DROP PROCEDURE IF EXISTS AlignSchemaWithJpa;
