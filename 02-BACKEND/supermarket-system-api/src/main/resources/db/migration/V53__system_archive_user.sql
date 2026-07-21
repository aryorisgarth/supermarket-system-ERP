ALTER TABLE users
    ADD COLUMN is_system TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;

-- Usuario técnico para conservar integridad referencial al eliminar empleados con historial.
INSERT INTO users (full_name, email, password, is_active, is_system, role_id, created_at)
SELECT
    'Usuario Eliminado',
    'deleted-user@system.internal',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p6ldGxKImJYAJxHfJk8qHy',
    0,
    1,
    r.id,
    NOW()
FROM roles r
WHERE UPPER(r.name) = 'CONSULTOR'
  AND NOT EXISTS (
      SELECT 1 FROM users u WHERE u.email = 'deleted-user@system.internal'
  )
LIMIT 1;
