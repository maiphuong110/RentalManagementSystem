-- Thêm bảng RefreshToken (chạy sau schema.sql)
CREATE TABLE IF NOT EXISTS `RefreshToken` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT,
    `token_hash`  VARCHAR(64)  NOT NULL,
    `user_id`     BIGINT       NOT NULL,
    `expires_at`  TIMESTAMP    NOT NULL,
    `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `revoked`     BOOLEAN      NOT NULL DEFAULT FALSE,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_token_hash` (`token_hash`),
    INDEX `idx_rt_user` (`user_id`),
    INDEX `idx_rt_hash` (`token_hash`),
    CONSTRAINT `fk_rt_user`
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
