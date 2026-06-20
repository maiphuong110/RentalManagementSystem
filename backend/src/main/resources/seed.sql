-- ============================================================
-- TroSmart - Seed Data
-- Mật khẩu tất cả tài khoản: TroSmart@2026
-- BCrypt hash của "TroSmart@2026" (strength=10)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- 0. LÀM SẠCH DATABASE (Tránh lỗi Duplicate ID)
-- ─────────────────────────────────────────────────────────────
TRUNCATE TABLE `notification`;
TRUNCATE TABLE `message`;
TRUNCATE TABLE `conversation`;
TRUNCATE TABLE `monthly_bill`;
TRUNCATE TABLE `record`;
TRUNCATE TABLE `contracts`;
TRUNCATE TABLE `post_rule`;
TRUNCATE TABLE `post_image`;
TRUNCATE TABLE `post`;
TRUNCATE TABLE `room_amenity`;
TRUNCATE TABLE `amenity`;
TRUNCATE TABLE `room`;
TRUNCATE TABLE `properties`;
TRUNCATE TABLE `user`;
TRUNCATE TABLE `role`;

-- ─────────────────────────────────────────────────────────────
-- 1. ROLE
-- ─────────────────────────────────────────────────────────────
INSERT INTO `role` (`role_id`, `name`, `description`) VALUES
    (1, 'admin',  'System administrator'),
    (2, 'owner',  'Property owner / landlord'),
    (3, 'tenant', 'Room tenant');

-- ─────────────────────────────────────────────────────────────
-- 2. USER
--    user_id 1  : admin
--    user_id 2  : Nguyễn Văn An   (owner  - có 2 khu trọ)
--    user_id 3  : Trần Thị Bình   (owner  - có 1 khu trọ)
--    user_id 4  : Lê Minh Khoa    (tenant - đang thuê, bill paid)
--    user_id 5  : Phạm Thị Lan    (tenant - đang thuê, bill pending_confirm)
--    user_id 6  : Hoàng Văn Đức   (tenant - hợp đồng pending, chưa ký)
--    user_id 7  : Vũ Thị Mai      (tenant - không có hợp đồng, đang tìm phòng)
-- ─────────────────────────────────────────────────────────────

INSERT INTO `user`
    (`user_id`, `email`, `password_hash`, `full_name`, `phone`, `role_id`,
     `avatar_url`, `cccd_number`, `qr_code_url`, `created_at`, `updated_at`)
VALUES
(1,
 'admin@trosmart.vn',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m', -- TroSmart@2026
 'TroSmart Admin', '0900000000', 1,
 NULL, NULL, NULL,
 '2026-01-01 00:00:00', '2026-01-01 00:00:00'),

(2,
 'an.owner@gmail.com',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Nguyễn Văn An', '0912345678', 2,
 '/uploads/avatars/owner_an.jpg',
 '001085012345',
 '/uploads/qr/owner_an_qr.png',
 '2026-01-05 08:00:00', '2026-01-05 08:00:00'),

(3,
 'binh.owner@gmail.com',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Trần Thị Bình', '0923456789', 2,
 '/uploads/avatars/owner_binh.jpg',
 '001085023456',
 '/uploads/qr/owner_binh_qr.png',
 '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

(4,
 'khoa.tenant@gmail.com', -- ĐÃ FIX: Thêm email thực tế thay vì để trống
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Lê Minh Khoa', '0934567890', 3,
 '/uploads/avatars/tenant_khoa.jpg',
 '001085034567',
 NULL,
 '2026-01-15 10:00:00', '2026-01-15 10:00:00'),

(5,
 'lan.tenant@gmail.com',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Phạm Thị Lan', '0945678901', 3,
 '/uploads/avatars/tenant_lan.jpg',
 '001085045678',
 NULL,
 '2026-02-01 11:00:00', '2026-02-01 11:00:00'),

(6,
 'duc.tenant@gmail.com',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Hoàng Văn Đức', '0956789012', 3,
 NULL,
 '001085056789',
 NULL,
 '2026-03-01 12:00:00', '2026-03-01 12:00:00'),

(7,
 'mai.tenant@gmail.com',
 '$2a$10$333njc8N8m1B08gY/CvnZODaJMAvitu.VmQZ0F2NYVkeUb5Q5V58m',
 'Vũ Thị Mai', '0967890123', 3,
 NULL, NULL, NULL,
 '2026-04-01 13:00:00', '2026-04-01 13:00:00');

-- ─────────────────────────────────────────────────────────────
-- 3. PROPERTIES
-- ─────────────────────────────────────────────────────────────
INSERT INTO `properties`
    (`property_id`, `owner_id`, `name`, `street`, `ward`, `district`, `city`,
     `latitude`, `longitude`, `type`, `is_active`, `created_at`)
VALUES
(1, 2,
 'Nhà Trọ Văn An 1',
 '15 Ngõ 68 Trung Liệt', 'Trung Liệt', 'Đống Đa', 'Hà Nội',
 21.0245000, 105.8412000,
 'house', TRUE,
 '2026-01-06 08:00:00'),

(2, 2,
 'Nhà Trọ Văn An 2',
 '42 Phố Dịch Vọng Hậu', 'Dịch Vọng Hậu', 'Cầu Giấy', 'Hà Nội',
 21.0378000, 105.7921000,
 'mini_apartment', TRUE,
 '2026-01-06 09:00:00'),

(3, 3,
 'Mini Apartment Trần Bình',
 '88 Phố Bạch Mai', 'Bạch Mai', 'Hai Bà Trưng', 'Hà Nội',
 21.0151000, 105.8534000,
 'apartment', TRUE,
 '2026-01-11 09:00:00');

-- ─────────────────────────────────────────────────────────────
-- 4. ROOM
-- ─────────────────────────────────────────────────────────────
INSERT INTO `room`
    (`room_id`, `property_id`, `room_number`, `area_sqm`, `max_capacity`,
     `base_price`, `elec_price_kwh`, `water_price_m3`, `elec_kind`, `status`, `created_at`)
VALUES
-- property 1
(1, 1, '101', 18.50, 2, 2500000, 3500, 15000, 'elec_normal',   'available',   '2026-01-06 10:00:00'),
(2, 1, '102', 20.00, 2, 2800000, 3500, 15000, 'elec_normal',   'unavailable', '2026-01-06 10:00:00'),
(3, 1, '103', 22.00, 3, 3000000, 3500, 15000, 'elec_normal',   'unavailable', '2026-01-06 10:00:00'),
(4, 1, '104', 25.00, 2, 3200000, 3500, 15000, 'elec_service',  'available',   '2026-01-06 10:00:00'),
-- property 2
(5, 2, '201', 30.00, 2, 4500000, 4000, 20000, 'elec_service',  'available',   '2026-01-06 11:00:00'),
(6, 2, '202', 35.00, 3, 5000000, 4000, 20000, 'elec_service',  'available',   '2026-01-06 11:00:00'),
-- property 3
(7, 3, 'A01', 28.00, 2, 4000000, 3800, 18000, 'elec_normal',   'available',   '2026-01-11 10:00:00'),
(8, 3, 'A02', 32.00, 2, 4800000, 3800, 18000, 'elec_service',  'available',   '2026-01-11 10:00:00'),
(9, 3, 'A03', 40.00, 4, 6000000, 3800, 18000, 'elec_service',  'available',   '2026-01-11 10:00:00');

-- ─────────────────────────────────────────────────────────────
-- 5. AMENITY
-- ─────────────────────────────────────────────────────────────
INSERT INTO `amenity` (`amenity_id`, `name`, `icon`) VALUES
(1,  'Điều hòa',            'ac_unit'),
(2,  'Máy nước nóng',       'hot_tub'),
(3,  'Tủ lạnh',             'kitchen'),
(4,  'Máy giặt',            'local_laundry_service'),
(5,  'Wifi',                'wifi'),
(6,  'Chỗ để xe máy',       'two_wheeler'),
(7,  'Chỗ để ô tô',         'directions_car'),
(8,  'Ban công',            'balcony'),
(9,  'Bảo vệ 24/7',         'security'),
(10, 'Camera an ninh',      'videocam'),
(11, 'Thang máy',           'elevator'),
(12, 'Gác xép',             'stairs');

-- ─────────────────────────────────────────────────────────────
-- 6. ROOM_AMENITY
-- ─────────────────────────────────────────────────────────────
INSERT INTO `room_amenity` (`room_id`, `amenity_id`, `monthly_fee`) VALUES
-- room 101 (available)
(1, 1, 0),
(1, 2, 0),
(1, 5, 100000),
(1, 6, 100000),
-- room 102 (Khoa)
(2, 1, 0),
(2, 2, 0),
(2, 3, 0),
(2, 5, 100000),
(2, 6, 100000),
-- room 103 (Lan)
(3, 1, 0),
(3, 2, 0),
(3, 4, 150000),
(3, 5, 100000),
(3, 6, 100000),
-- room 104 (available)
(4, 1, 0),
(4, 2, 0),
(4, 3, 0),
(4, 4, 150000),
(4, 5, 100000),
(4, 6, 100000),
(4, 8, 0),
-- room 201 (available)
(5, 1, 0),
(5, 2, 0),
(5, 3, 0),
(5, 4, 150000),
(5, 5, 0),
(5, 6, 100000),
(5, 9, 0),
(5, 11, 0),
-- room 202
(6, 1, 0),
(6, 2, 0),
(6, 3, 0),
(6, 4, 150000),
(6, 5, 0),
(6, 7, 300000),
(6, 9, 0),
(6, 11, 0),
-- room A01 (Đức - pending)
(7, 1, 0),
(7, 2, 0),
(7, 5, 100000),
(7, 6, 100000),
-- room A02
(8, 1, 0),
(8, 2, 0),
(8, 3, 0),
(8, 5, 0),
(8, 6, 100000),
(8, 9, 0),
-- room A03
(9, 1, 0),
(9, 2, 0),
(9, 4, 150000),
(9, 5, 0),
(9, 6, 100000),
(9, 9, 0),
(9, 11, 0);

-- ─────────────────────────────────────────────────────────────
-- 7. POST
-- ─────────────────────────────────────────────────────────────
INSERT INTO `post`
    (`post_id`, `room_id`, `title`, `description`, `status`, `published_at`, `expires_at`, `created_at`)
VALUES
(1, 1,
 'Phòng trọ 18m² sạch sẽ, thoáng mát - Đống Đa, Hà Nội',
 'Phòng rộng 18m², đầy đủ nội thất cơ bản. Nhà vệ sinh khép kín. Khu vực an ninh, gần chợ Trung Liệt, trường đại học. Chủ nhà thân thiện, hỗ trợ nhiệt tình. Phù hợp cho sinh viên, nhân viên văn phòng.',
 'active', '2026-04-01 08:00:00', '2026-07-01 08:00:00', '2026-04-01 08:00:00'),

(2, 2,
 'Phòng 20m² đầy đủ tiện nghi - Đống Đa, Hà Nội',
 'Phòng rộng rãi, đủ đồ dùng thiết yếu. Gần trung tâm.',
 'hidden', '2026-02-01 08:00:00', NULL, '2026-02-01 08:00:00'),

(3, 3,
 'Phòng 22m² yên tĩnh, an ninh - Đống Đa, Hà Nội',
 'Phòng thoáng, yên tĩnh, thích hợp ở ghép 2-3 người.',
 'hidden', '2026-03-01 08:00:00', NULL, '2026-03-01 08:00:00'),

(4, 4,
 'Phòng 25m² ban công view đẹp - Đống Đa, Hà Nội',
 'Phòng rộng có ban công nhìn ra sân vườn. Điều hòa, máy giặt riêng. Điện theo dịch vụ. Thích hợp cặp đôi hoặc 2 bạn cùng thuê. Gần Đại học Bách Khoa.',
 'active', '2026-04-10 08:00:00', '2026-07-10 08:00:00', '2026-04-10 08:00:00'),

(5, 5,
 'Mini Apartment 30m² full nội thất - Cầu Giấy, Hà Nội',
 'Căn hộ mini cao cấp 30m², đầy đủ nội thất mới. Tòa nhà có thang máy, bảo vệ 24/7. Gần ĐH Quốc Gia, siêu thị Big C. Phù hợp cặp đôi, gia đình nhỏ.',
 'active', '2026-04-15 09:00:00', '2026-07-15 09:00:00', '2026-04-15 09:00:00'),

(6, 7,
 'Phòng apartment 28m² - Hai Bà Trưng, Hà Nội',
 'Phòng thoáng, nội thất đầy đủ. Tòa nhà mới xây.',
 'hidden', '2026-04-20 09:00:00', NULL, '2026-04-20 09:00:00'),

(7, 8,
 'Apartment 32m² cao cấp - Bạch Mai, Hai Bà Trưng',
 'Căn hộ studio 32m², thiết kế hiện đại. Tòa nhà có bảo vệ, camera an ninh toàn bộ. Tiện ích: điều hòa, bếp từ, máy nước nóng, wifi tốc độ cao. Gần bệnh viện Bạch Mai, ĐH Kinh Tế Quốc Dân.',
 'active', '2026-04-20 10:00:00', '2026-07-20 10:00:00', '2026-04-20 10:00:00');
