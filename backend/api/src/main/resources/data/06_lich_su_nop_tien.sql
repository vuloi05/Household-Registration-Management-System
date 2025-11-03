-- =================================================================
-- DỮ LIỆU MẪU CHO LỊCH SỬ NỘP TIỀN (lich_su_nop_tien)
-- =================================================================
-- Phí vệ sinh năm 2025 (ID: 1) - 6000/người/tháng -> 72000/người/năm
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-10-05', 288000, 'Kế toán B', 1, 1), -- 4 người * 72000
('2025-10-05', 216000, 'Kế toán B', 1, 2), -- 3 người * 72000
('2025-10-06', 360000, 'Kế toán B', 1, 3), -- 5 người * 72000
('2025-10-06', 144000, 'Kế toán B', 1, 4), -- 2 người * 72000
('2025-10-07', 288000, 'Kế toán B', 1, 5), -- 4 người * 72000
('2025-10-08', 216000, 'Kế toán B', 1, 6), -- 3 người * 72000
('2025-10-09', 360000, 'Kế toán B', 1, 7), -- 5 người * 72000
('2025-10-10', 288000, 'Kế toán B', 1, 8), -- 4 người * 72000
('2025-10-11', 288000, 'Kế toán B', 1, 9), -- 4 người * 72000
('2025-10-12', 216000, 'Kế toán B', 1, 10); -- 3 người * 72000

-- Ủng hộ ngày Thương binh - Liệt sỹ 27/07 (ID: 2)
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-07-10', 200000, 'Kế toán B', 2, 1),
('2025-07-10', 100000, 'Kế toán B', 2, 3),
('2025-07-11', 150000, 'Kế toán B', 2, 5),
('2025-07-12', 50000, 'Kế toán B', 2, 8),
('2025-07-15', 300000, 'Kế toán B', 2, 10),
('2025-07-16', 200000, 'Kế toán B', 2, 14),
('2025-07-18', 100000, 'Kế toán B', 2, 20);

-- Quỹ khuyến học năm 2025 (ID: 3)
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-08-20', 500000, 'Kế toán B', 3, 1),
('2025-08-20', 300000, 'Kế toán B', 3, 6),
('2025-08-21', 200000, 'Kế toán B', 3, 9),
('2025-08-22', 400000, 'Kế toán B', 3, 12),
('2025-08-25', 100000, 'Kế toán B', 3, 16),
('2025-08-28', 250000, 'Kế toán B', 3, 18);

-- Phí quản lý chung cư tháng 11/2025 (ID: 4)
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-11-02', 150000, 'Kế toán B', 4, 10),
('2025-11-03', 150000, 'Kế toán B', 4, 15),
('2025-11-04', 150000, 'Kế toán B', 4, 22),
('2025-11-05', 150000, 'Kế toán B', 4, 25),
('2025-11-05', 150000, 'Kế toán B', 4, 29),
('2025-11-06', 150000, 'Kế toán B', 4, 32),
('2025-11-07', 150000, 'Kế toán B', 4, 35);

-- Bổ sung 5 khoản bắt buộc
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-10-13', 144000, 'Kế toán B', 1, 11), -- 2 người * 72000
('2025-10-13', 288000, 'Kế toán B', 1, 12), -- 4 người * 72000
('2025-10-14', 216000, 'Kế toán B', 1, 13), -- 3 người * 72000
('2025-10-14', 360000, 'Kế toán B', 1, 14), -- 5 người * 72000
('2025-10-15', 288000, 'Kế toán B', 1, 16); -- 4 người * 72000

-- Bổ sung 5 khoản đóng góp
INSERT INTO lich_su_nop_tien(ngay_nop, so_tien, nguoi_thu, khoan_thu_id, ho_khau_id) VALUES
('2025-07-19', 100000, 'Kế toán B', 2, 2),
('2025-07-20', 50000, 'Kế toán B', 2, 4),
('2025-08-29', 200000, 'Kế toán B', 3, 2),
('2025-08-30', 100000, 'Kế toán B', 3, 4),
('2025-08-30', 300000, 'Kế toán B', 3, 7);
