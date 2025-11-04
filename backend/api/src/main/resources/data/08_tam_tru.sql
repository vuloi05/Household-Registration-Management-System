-- =================================================================
-- DỮ LIỆU MẪU CHO TẠM TRÚ (tam_tru)
-- =================================================================
-- Sinh viên thuê trọ
INSERT INTO tam_tru(ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, noi_thuong_tru, ho_khau_tiep_nhan_id, ngay_bat_dau, ngay_ket_thuc, ly_do, ngay_cap, nguoi_cap) VALUES
('Trần Văn Sinh', '2004-05-10', 'Nam', '038123456789', 'Thái Bình', 9, '2024-09-05', '2028-09-05', 'Tạm trú để đi học tại Đại học Kiến trúc', '2024-09-01', 'Tổ trưởng A'),
('Nguyễn Thị Hoa', '2004-08-22', 'Nữ', '027123456789', 'Lạng Sơn', 9, '2024-09-05', '2028-09-05', 'Tạm trú để đi học tại Đại học Hà Nội', '2024-09-01', 'Tổ trưởng A');

-- Người thuê nhà để kinh doanh
INSERT INTO tam_tru(ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, noi_thuong_tru, ho_khau_tiep_nhan_id, ngay_bat_dau, ngay_ket_thuc, ly_do, ngay_cap, nguoi_cap) VALUES
('Lê Thị Kinh Doanh', '1990-02-15', 'Nữ', '045123456789', 'Hải Phòng', 11, '2025-01-01', '2026-01-01', 'Tạm trú để kinh doanh cửa hàng quần áo', '2024-12-20', 'Tổ trưởng A');

-- Gia đình thuê nhà nguyên căn
INSERT INTO tam_tru(ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, noi_thuong_tru, ho_khau_tiep_nhan_id, ngay_bat_dau, ngay_ket_thuc, ly_do, ngay_cap, nguoi_cap) VALUES
('Phạm Văn Thuê', '1985-11-20', 'Nam', '098765432101', 'Bắc Giang', 19, '2025-05-01', '2027-05-01', 'Tạm trú do công tác xa nhà', '2025-04-25', 'Tổ trưởng A'),
('Hoàng Thị Nhà', '1988-03-08', 'Nữ', '098765432102', 'Bắc Giang', 19, '2025-05-01', '2027-05-01', 'Tạm trú theo chồng', '2025-04-25', 'Tổ trưởng A'),
('Phạm Hoàng Con', '2015-09-15', 'Nam', NULL, 'Bắc Giang', 19, '2025-05-01', '2027-05-01', 'Tạm trú theo bố mẹ', '2025-04-25', 'Tổ trưởng A');

-- Chuyên gia nước ngoài sang làm việc
INSERT INTO tam_tru(ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, noi_thuong_tru, ho_khau_tiep_nhan_id, ngay_bat_dau, ngay_ket_thuc, ly_do, ngay_cap, nguoi_cap) VALUES
('John Doe', '1988-01-01', 'Nam', 'PASSPORT_JD123', 'California, USA', 26, '2025-08-15', '2026-08-15', 'Chuyên gia làm việc cho dự án của Vinfast', '2025-08-10', 'Tổ trưởng B');

-- Người thân ở tỉnh khác lên chăm sóc người ốm
INSERT INTO tam_tru(ho_ten, ngay_sinh, gioi_tinh, cmnd_cccd, noi_thuong_tru, ho_khau_tiep_nhan_id, ngay_bat_dau, ngay_ket_thuc, ly_do, ngay_cap, nguoi_cap) VALUES
('Vũ Thị Chăm', '1975-10-10', 'Nữ', '011223344556', 'Nam Định', 1, '2025-03-01', '2025-05-01', 'Tạm trú để chăm sóc người nhà bị ốm', '2025-02-28', 'Tổ trưởng C');