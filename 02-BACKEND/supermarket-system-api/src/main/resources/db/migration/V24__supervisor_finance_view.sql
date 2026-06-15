-- Supervisor necesita ver liquidaciones en cierre del día (sin acceso completo a Finanzas)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code = 'FINANCE_VIEW'
WHERE r.name = 'SUPERVISOR'
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );
