-- Tabla para almacenar refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token VARCHAR(500) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
