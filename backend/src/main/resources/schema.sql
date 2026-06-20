-- ============================================================
-- TroSmart - Smart Room Rental Management System
-- Database Schema (MySQL 8.0)
-- ============================================================

DROP DATABASE IF EXISTS trosmart;
CREATE DATABASE trosmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trosmart;

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- 1. Role
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Role` (
    `role_id`     BIGINT       NOT NULL AUTO_INCREMENT,
    `name`        VARCHAR(50)  NOT NULL,
    `description` VARCHAR(255) NULL,
    PRIMARY KEY (`role_id`),
    UNIQUE KEY `uq_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. User
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `User` (
    `user_id`       BIGINT       NOT NULL AUTO_INCREMENT,
    `email`         VARCHAR(100) NOT NULL,   -- expanded to support email + '-deleted-{id}' suffix
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name`     VARCHAR(255) NOT NULL,
    `phone`         VARCHAR(30)  NULL,       -- expanded to support phone + '-deleted-{id}' suffix
    `role_id`       BIGINT       NOT NULL,
    `avatar_url`    VARCHAR(500) NULL,
    `cccd_number`   VARCHAR(13)  NULL,
    `qr_code_url`   VARCHAR(500) NULL,
    `created_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at`    TIMESTAMP    NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `uq_user_cccd` (`cccd_number`),
    CONSTRAINT `fk_user_role`
        FOREIGN KEY (`role_id`) REFERENCES `Role` (`role_id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Properties
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Properties` (
    `property_id` BIGINT        NOT NULL AUTO_INCREMENT,
    `owner_id`    BIGINT        NOT NULL,
    `name`        VARCHAR(255)  NOT NULL,
    `street`      VARCHAR(255)  NOT NULL,
    `ward`        VARCHAR(100)  NOT NULL,
    `district`    VARCHAR(100)  NOT NULL,
    `city`        VARCHAR(100)  NOT NULL,
    `latitude`    DECIMAL(10,7) NULL,
    `longitude`   DECIMAL(10,7) NULL,
    `type`        ENUM('studio','apartment','mini_apartment','house') NOT NULL,
    `is_active`   BOOLEAN       NOT NULL DEFAULT TRUE,
    `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`property_id`),
    CONSTRAINT `fk_properties_owner`
        FOREIGN KEY (`owner_id`) REFERENCES `User` (`user_id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Room
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Room` (
    `room_id`         BIGINT          NOT NULL AUTO_INCREMENT,
    `property_id`     BIGINT          NOT NULL,
    `room_number`     VARCHAR(20)     NOT NULL,
    `area_sqm`        DECIMAL(5,2)    NOT NULL,
    `max_capacity`    TINYINT         NOT NULL DEFAULT 1,
    `bedrooms`        TINYINT         NOT NULL DEFAULT 1,
    `base_price`      DECIMAL(12,0)   NOT NULL,
    `elec_price_kwh`  DECIMAL(8,0)    NOT NULL,
    `water_price_m3`  DECIMAL(8,0)    NOT NULL,
    `elec_kind`       ENUM('elec_normal','elec_service') NOT NULL DEFAULT 'elec_normal',
    `status`          ENUM('available','unavailable')    NOT NULL DEFAULT 'available',
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`room_id`),
    CONSTRAINT `fk_room_property`
        FOREIGN KEY (`property_id`) REFERENCES `Properties` (`property_id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Amenity
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Amenity` (
    `amenity_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(100) NOT NULL,
    `icon`       VARCHAR(50)  NULL,
    PRIMARY KEY (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. ROOM_AMENITY  (junction: Room <-> Amenity)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ROOM_AMENITY` (
    `room_amenity_id` BIGINT        NOT NULL AUTO_INCREMENT,
    `room_id`         BIGINT        NOT NULL,
    `amenity_id`      BIGINT        NOT NULL,
    `monthly_fee`     DECIMAL(8,0)  NOT NULL DEFAULT 0,
    PRIMARY KEY (`room_amenity_id`),
    UNIQUE KEY `uq_room_amenity` (`room_id`, `amenity_id`),
    CONSTRAINT `fk_roomamenity_room`
        FOREIGN KEY (`room_id`)    REFERENCES `Room`    (`room_id`)    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_roomamenity_amenity`
        FOREIGN KEY (`amenity_id`) REFERENCES `Amenity` (`amenity_id`) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Post
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Post` (
    `post_id`      BIGINT        NOT NULL AUTO_INCREMENT,
    `room_id`      BIGINT        NOT NULL,
    `title`        VARCHAR(255)  NOT NULL,
    `description`  VARCHAR(1000) NULL,
    `status`       ENUM('active','hidden','expired') NOT NULL DEFAULT 'active',
    `published_at` TIMESTAMP     NULL,
    `expires_at`   TIMESTAMP     NULL,
    `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`post_id`),
    CONSTRAINT `fk_post_room`
        FOREIGN KEY (`room_id`) REFERENCES `Room` (`room_id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Post_Image
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Post_Image` (
    `image_id`       BIGINT       NOT NULL AUTO_INCREMENT,
    `post_id`        BIGINT       NOT NULL,
    `post_image_url` VARCHAR(500) NOT NULL,
    `sort_order`     TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`image_id`),
    CONSTRAINT `fk_postimage_post`
        FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. Post_Rule
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Post_Rule` (
    `rule_id`    BIGINT       NOT NULL AUTO_INCREMENT,
    `post_id`    BIGINT       NOT NULL,
    `rule_text`  VARCHAR(500) NOT NULL,
    `sort_order` TINYINT      NOT NULL DEFAULT 0,
    PRIMARY KEY (`rule_id`),
    CONSTRAINT `fk_postrule_post`
        FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. Contracts
-- ------------------------------------------------------------s
SELECT * FROM User;
CREATE TABLE IF NOT EXISTS `Contracts` (
    `contract_id`      BIGINT        NOT NULL AUTO_INCREMENT,
    `room_id`          BIGINT        NOT NULL,
    `tenant_id`        BIGINT        NOT NULL,
    `owner_id`         BIGINT        NOT NULL,
    `start_date`       DATE          NOT NULL,
    `end_date`         DATE          NOT NULL,
    `deposit_amount`   DECIMAL(12,2) NOT NULL DEFAULT 0,
    `e_signature_otp`  VARCHAR(10)   NULL,
    `signed_at`        TIMESTAMP     NULL,
    `status`           ENUM('pending','active','expired','terminated') NOT NULL DEFAULT 'pending',
    `created_at`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`contract_id`),
    CONSTRAINT `fk_contracts_room`
        FOREIGN KEY (`room_id`)   REFERENCES `Room` (`room_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_contracts_tenant`
        FOREIGN KEY (`tenant_id`) REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_contracts_owner`
        FOREIGN KEY (`owner_id`)  REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. Record  (monthly meter readings)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Record` (
    `record_id`            BIGINT               NOT NULL AUTO_INCREMENT,
    `room_id`              BIGINT               NOT NULL,
    `contract_id`          BIGINT               NOT NULL,
    `billing_month`        TINYINT UNSIGNED     NOT NULL COMMENT '1-12',
    `billing_year`         SMALLINT UNSIGNED    NOT NULL,
    `elec_previous`        DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    `elec_current`         DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    `elec_amount`          DECIMAL(8,2)  UNSIGNED NOT NULL DEFAULT 0,
    `water_previous`       DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    `water_current`        DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0,
    `water_amount`         DECIMAL(8,2)  UNSIGNED NOT NULL DEFAULT 0,
    `applied_normal_price` DECIMAL(15,2)          NOT NULL DEFAULT 0,
    PRIMARY KEY (`record_id`),
    UNIQUE KEY `uq_record_month` (`room_id`, `contract_id`, `billing_month`, `billing_year`),
    CONSTRAINT `fk_record_room`
        FOREIGN KEY (`room_id`)     REFERENCES `Room`      (`room_id`)     ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_record_contract`
        FOREIGN KEY (`contract_id`) REFERENCES `Contracts` (`contract_id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SELECT * FROM User;
-- ------------------------------------------------------------
-- 12. Monthly_Bill
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Monthly_Bill` (
    `bill_id`           BIGINT               NOT NULL AUTO_INCREMENT,
    `record_id`         BIGINT               NOT NULL,
    `billing_date`      DATE                 NOT NULL,
    `room_bill`         DECIMAL(12,0) UNSIGNED NOT NULL DEFAULT 0,
    `elec_bill`         DECIMAL(12,0) UNSIGNED NOT NULL DEFAULT 0,
    `water_bill`        DECIMAL(12,0) UNSIGNED NOT NULL DEFAULT 0,
    `amenity_bill`      DECIMAL(12,0) UNSIGNED NOT NULL DEFAULT 0,
    `total_amount`      DECIMAL(12,0)          NOT NULL DEFAULT 0,
    `payment_proof_url` VARCHAR(500)           NULL,
    `status`            ENUM('unpaid','pending_confirm','paid','overdue') NOT NULL DEFAULT 'unpaid',
    `paid_at`           TIMESTAMP             NULL,
    `created_at`        TIMESTAMP             NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`bill_id`),
    UNIQUE KEY `uq_bill_record` (`record_id`),
    CONSTRAINT `fk_bill_record`
        FOREIGN KEY (`record_id`) REFERENCES `Record` (`record_id`)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. Conversation
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Conversation` (
    `conversation_id` BIGINT    NOT NULL AUTO_INCREMENT,
    `user_a`          BIGINT    NOT NULL COMMENT 'luon la ID nho hon (MIN)',
    `user_b`          BIGINT    NOT NULL COMMENT 'luon la ID lon hon (MAX)',
    `post_id`         BIGINT    NULL     COMMENT 'nullable - context post',
    `last_message_at` TIMESTAMP NULL,
    `created_at`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`conversation_id`),
    UNIQUE KEY `uq_conversation` (`user_a`, `user_b`, `post_id`),
    CONSTRAINT `fk_conversation_user_a`
        FOREIGN KEY (`user_a`)  REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_conversation_user_b`
        FOREIGN KEY (`user_b`)  REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT `fk_conversation_post`
        FOREIGN KEY (`post_id`) REFERENCES `Post` (`post_id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. Message
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Message` (
    `message_id`      BIGINT        NOT NULL AUTO_INCREMENT,
    `conversation_id` BIGINT        NOT NULL,
    `sender_id`       BIGINT        NOT NULL,
    `content`         VARCHAR(1000) NOT NULL,
    `sent_at`         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `is_read`         BOOLEAN       NOT NULL DEFAULT FALSE,
    `read_at`         TIMESTAMP     NULL,
    PRIMARY KEY (`message_id`),
    CONSTRAINT `fk_message_conversation`
        FOREIGN KEY (`conversation_id`) REFERENCES `Conversation` (`conversation_id`) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT `fk_message_sender`
        FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. Notification
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `Notification` (
    `notification_id` BIGINT       NOT NULL AUTO_INCREMENT,
    `user_id`         BIGINT       NOT NULL,
    `type`            ENUM('bill_due','contract_expiry','new_message','payment_received') NOT NULL,
    `ref_table`       VARCHAR(50)  NULL,
    `ref_id`          BIGINT       NULL,
    `title`           VARCHAR(255) NOT NULL,
    `body`            VARCHAR(500) NULL,
    `is_read`         BOOLEAN      NOT NULL DEFAULT FALSE,
    `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`notification_id`),
    CONSTRAINT `fk_notification_user`
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Indexes (commonly queried FK columns)
-- ------------------------------------------------------------
CREATE INDEX `idx_properties_owner`      ON `Properties`   (`owner_id`);
CREATE INDEX `idx_room_property`         ON `Room`         (`property_id`);
CREATE INDEX `idx_post_room`             ON `Post`         (`room_id`);
CREATE INDEX `idx_post_status`           ON `Post`         (`status`);
CREATE INDEX `idx_contracts_room`        ON `Contracts`    (`room_id`);
CREATE INDEX `idx_contracts_tenant`      ON `Contracts`    (`tenant_id`);
CREATE INDEX `idx_contracts_status`      ON `Contracts`    (`status`);
-- Note: 'idx_record_room' is already created by foreign key or unique, but we will make it explicit.
CREATE INDEX `idx_record_room`           ON `Record`       (`room_id`);
CREATE INDEX `idx_record_contract`       ON `Record`       (`contract_id`);
CREATE INDEX `idx_bill_status`           ON `Monthly_Bill` (`status`);
CREATE INDEX `idx_message_conversation`  ON `Message`      (`conversation_id`);
CREATE INDEX `idx_message_sender`        ON `Message`      (`sender_id`);
CREATE INDEX `idx_notification_user`     ON `Notification` (`user_id`);
CREATE INDEX `idx_notification_read`     ON `Notification` (`user_id`, `is_read`);

SET FOREIGN_KEY_CHECKS = 1;
