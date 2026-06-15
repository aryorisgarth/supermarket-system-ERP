ALTER TABLE inventory_count_sessions ADD COLUMN counted_by_id BIGINT;
ALTER TABLE inventory_count_sessions ADD CONSTRAINT fk_inventory_count_sessions_counted_by FOREIGN KEY (counted_by_id) REFERENCES users(id);
