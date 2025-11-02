/*
    File này chứa dữ liệu mẫu sẽ được chèn vào CSDL mỗi khi ứng dụng khởi động.
    Nó được chạy sau file schema.sql.
*/

-- Xóa dữ liệu cũ trong các bảng để đảm bảo tính nhất quán
-- Phải xóa từ bảng con (nhan_khau) trước do có khóa ngoại
DELETE FROM lich_su_bien_dong_nhan_khau;
DELETE FROM lich_su_thay_doi_ho_khau;
DELETE FROM tam_vang;
DELETE FROM tam_tru;
DELETE FROM lich_su_nop_tien;
DELETE FROM khoan_thu;
DELETE FROM users;
DELETE FROM nhan_khau;
DELETE FROM ho_khau;


-- Reset lại chuỗi số tự tăng của ID về 1 cho các bảng (cú pháp của PostgreSQL)
ALTER SEQUENCE ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE nhan_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE khoan_thu_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_nop_tien_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_bien_dong_nhan_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_thay_doi_ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE tam_vang_id_seq RESTART WITH 1;
ALTER SEQUENCE tam_tru_id_seq RESTART WITH 1;


-- =================================================================
-- DỮ LIỆU MẪU
-- =================================================================

-- Hộ khẩu 1: Gia đình ông Nguyễn Văn An (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK001', 'Số 1, Ngõ 12, Phường La Khê, Quận Hà Đông', '2020-01-10');

-- Hộ khẩu 2: Gia đình bà Lê Thị Dung (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK002', 'Số 25, Đường Quang Trung, Phường Yết Kiêu, Quận Hà Đông', '2018-07-22');

-- Hộ khẩu 3: Gia đình ông Trần Văn Cường (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK003', 'Số 10, Ngõ Tự Do, Phường Mộ Lao, Quận Hà Đông', '2022-03-01');

-- Hộ khẩu 4: Gia đình bà Phạm Thị Mai (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK004', 'Số 15, Đường Trần Phú, Phường Văn Quán, Quận Hà Đông', '2023-06-15');

-- Hộ khẩu 5: Gia đình ông Lê Văn Đức (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK005', 'Số 8, Ngõ GHI, Phường Vạn Phúc, Quận Hà Đông', '2024-01-20');

-- Hộ khẩu 6: Gia đình ông Hoàng Kim Thông (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK006', 'Số 78, Phố Tố Hữu, Phường Dương Nội, Quận Hà Đông', '2019-05-11');

-- Hộ khẩu 7: Gia đình bà Đỗ Thị Hoa (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK007', 'Nhà 22, Khu tập thể Dệt, Phường Vạn Phúc, Quận Hà Đông', '2017-02-28');

-- Hộ khẩu 8: Gia đình ông Bùi Văn Nam (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK008', 'Số 4, Ngách 5, Ngõ 19, Phường Phú La, Quận Hà Đông', '2021-11-15');


-- =================================================================
-- DỮ LIỆU NHÂN KHẨU
-- =================================================================

-- Nhân khẩu cho Hộ khẩu 1 (id=1)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Nguyễn Văn An', 'Tí', '1980-05-20', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Kỹ sư phần mềm', 'Công ty FPT Software', '012345678901', '2021-07-15', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Chủ hộ', 1),
('Trần Thị Bích', NULL, '1982-10-15', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Giáo viên', 'Trường THCS La Khê', '012345678902', '2021-08-20', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Vợ', 1),
('Nguyễn Hoàng Minh', 'Bin', '2010-09-01', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Học sinh', 'Trường Tiểu học La Khê', NULL, NULL, NULL, '2010-09-10', 'Mới sinh', 'Con trai', 1),
('Nguyễn Thu Trang', 'Bống', '2015-04-12', 'Nữ', 'Bệnh viện Hà Đông, Hà Nội', 'Hải Phòng', 'Kinh', 'Học sinh', 'Trường Mầm non La Khê', NULL, NULL, NULL, '2015-04-20', 'Mới sinh', 'Con gái', 1);

-- Nhân khẩu cho Hộ khẩu 2 (id=2)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Lê Thị Dung', NULL, '1970-02-11', 'Nữ', 'Hà Tây', 'Hà Tây', 'Kinh', 'Nội trợ', 'Tại nhà', '111222333444', '2022-01-05', 'Công an TP Hà Nội', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Chủ hộ', 2),
('Vũ Minh Đức', NULL, '1968-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Bộ đội về hưu', 'Tại nhà', '111222333555', '2021-12-25', 'Cục CSQLHC về TTXH', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Chồng', 2),
('Vũ Thị Hà', NULL, '1995-06-30', 'Nữ', 'Bệnh viện 103, Hà Nội', 'Hà Tây', 'Kinh', 'Nhân viên ngân hàng', 'Ngân hàng Vietcombank', '111222333666', '2020-10-10', 'Cục CSQLHC về TTXH', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Con gái', 2);

-- Nhân khẩu cho Hộ khẩu 3 (id=3)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Trần Văn Cường', NULL, '1990-01-01', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nhân viên văn phòng', 'Công ty ABC', '999888777666', '2023-02-14', 'Cục CSQLHC về TTXH', '2022-03-01', 'Thanh Hóa', 'Chủ hộ', 3),
('Lê Minh Tuấn', NULL, '1988-06-20', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Lập trình viên', 'Công ty XYZ', '999888777555', '2023-01-10', 'Cục CSQLHC về TTXH', '2023-05-15', 'Cầu Giấy, Hà Nội', 'Em trai', 3),
('Trần Thị Thảo', NULL, '1965-08-09', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nội trợ', 'Tại nhà', '999888777444', '2022-01-01', 'Công an tỉnh Thanh Hóa', '2022-03-01', 'Thanh Hóa', 'Mẹ', 3),
('Trần Văn Mạnh', NULL, '2018-09-15', 'Nam', 'Bệnh viện Phụ sản Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường mầm non Mộ Lao', NULL, NULL, NULL, '2022-03-01', 'Mới sinh', 'Cháu', 3),
('Lê Thị Vy', NULL, '1992-03-08', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Thiết kế đồ họa', 'Công ty Ad-micro', '999888777333', '2024-01-01', 'Cục CSQLHC về TTXH', '2024-02-01', 'Cầu Giấy, Hà Nội', 'Em dâu', 3);

-- Nhân khẩu cho Hộ khẩu 4 (id=4)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Phạm Thị Mai', NULL, '1985-03-12', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Công nhân', 'Nhà máy ABC', '123456789012', '2022-05-10', 'Cục CSQLHC về TTXH', '2023-06-15', 'Cầu Giấy, Hà Nội', 'Chủ hộ', 4),
('Nguyễn Văn Hùng', NULL, '1983-08-25', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Tài xế', 'Công ty Giao hàng nhanh', '123456789013', '2022-06-15', 'Cục CSQLHC về TTXH', '2023-06-15', 'Hải Dương', 'Chồng', 4);

-- Nhân khẩu cho Hộ khẩu 5 (id=5)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Lê Văn Đức', NULL, '1960-11-18', 'Nam', 'Nam Định', 'Nam Định', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '123456789015', '2024-02-01', 'Cục CSQLHC về TTXH', '2024-01-20', 'Nam Định', 'Chủ hộ', 5),
('Đỗ Thị Hoa', NULL, '1965-04-22', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '123456789016', '2024-02-15', 'Cục CSQLHC về TTXH', '2024-01-20', 'Thái Bình', 'Vợ', 5),
('Lê Anh Dũng', NULL, '1990-07-07', 'Nam', 'Nam Định', 'Nam Định', 'Kinh', 'Bác sĩ', 'Bệnh viện 103', '123456789017', '2015-01-01', 'Công an tỉnh Nam Định', '2024-01-20', 'Nam Định', 'Con trai', 5),
('Lê Thị Lan', NULL, '1992-09-09', 'Nữ', 'Nam Định', 'Nam Định', 'Kinh', 'Dược sĩ', 'Bệnh viện 103', '123456789018', '2016-02-02', 'Công an tỉnh Nam Định', '2024-01-20', 'Nam Định', 'Con gái', 5);

-- Nhân khẩu cho Hộ khẩu 6 (id=6)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Hoàng Kim Thông', NULL, '1978-12-01', 'Nam', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Giảng viên', 'Học viện Bưu chính Viễn thông', '223344556677', '2020-01-01', 'Cục CSQLHC về TTXH', '2019-05-11', 'Mỹ Đình, Hà Nội', 'Chủ hộ', 6),
('Nguyễn Thị Hà', NULL, '1980-03-15', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty Manulife', '223344556688', '2020-01-01', 'Cục CSQLHC về TTXH', '2019-05-11', 'Mỹ Đình, Hà Nội', 'Vợ', 6),
('Hoàng Gia Huy', NULL, '2008-10-20', 'Nam', 'Bệnh viện Bưu Điện', 'Hưng Yên', 'Kinh', 'Học sinh', 'Trường THCS Mỗ Lao', NULL, NULL, NULL, '2019-05-11', 'Mỹ Đình, Hà Nội', 'Con trai', 6);

-- Nhân khẩu cho Hộ khẩu 7 (id=7)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Đỗ Thị Hoa', NULL, '1955-01-10', 'Nữ', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '334455667788', '2015-06-06', 'Công an tỉnh Phú Thọ', '2017-02-28', 'Phú Thọ', 'Chủ hộ', 7),
('Nguyễn Văn Bình', NULL, '1975-05-05', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Thợ xây', 'Tự do', '334455667799', '2018-07-07', 'Cục CSQLHC về TTXH', '2017-02-28', 'Phú Thọ', 'Con trai', 7),
('Trần Thị Lan', NULL, '1978-08-08', 'Nữ', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Công nhân may', 'Xí nghiệp may Vạn Phúc', '334455667700', '2019-09-09', 'Cục CSQLHC về TTXH', '2017-02-28', 'Vĩnh Phúc', 'Con dâu', 7),
('Nguyễn Bảo Ngọc', NULL, '2005-12-12', 'Nữ', 'Bệnh viện Hà Đông', 'Phú Thọ', 'Kinh', 'Sinh viên', 'Đại học Hà Nội', '334455667711', '2021-10-10', 'Cục CSQLHC về TTXH', '2017-02-28', 'Phú Thọ', 'Cháu gái', 7),
('Nguyễn Tiến Dũng', NULL, '2010-02-20', 'Nam', 'Bệnh viện Hà Đông', 'Phú Thọ', 'Kinh', 'Học sinh', 'Trường Tiểu học Vạn Phúc', NULL, NULL, NULL, '2017-02-28', 'Phú Thọ', 'Cháu trai', 7);

-- Nhân khẩu cho Hộ khẩu 8 (id=8)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Bùi Văn Nam', NULL, '1988-04-15', 'Nam', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Kiến trúc sư', 'Văn phòng kiến trúc X', '445566778899', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-11-15', 'Chương Mỹ, Hà Nội', 'Chủ hộ', 8),
('Hà Thị Linh', NULL, '1991-09-20', 'Nữ', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Giáo viên mầm non', 'Trường mầm non Phú La', '445566778800', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-11-15', 'Chương Mỹ, Hà Nội', 'Vợ', 8),
('Bùi Gia Hân', NULL, '2017-07-07', 'Nữ', 'Bệnh viện Hà Đông', 'Hòa Bình', 'Mường', 'Học sinh', 'Trường mầm non Phú La', NULL, NULL, NULL, '2021-11-15', 'Chương Mỹ, Hà Nội', 'Con gái', 8),
('Bùi Quang Khải', NULL, '2022-03-03', 'Nam', 'Bệnh viện Hà Đông', 'Hòa Bình', 'Mường', 'Ở nhà', 'Tại nhà', NULL, NULL, NULL, '2022-03-10', 'Mới sinh', 'Con trai', 8);


-- =================================================================
-- CẬP NHẬT CHỦ HỘ
-- =================================================================
UPDATE ho_khau SET chu_ho_id = 1 WHERE id = 1;
UPDATE ho_khau SET chu_ho_id = 5 WHERE id = 2;
UPDATE ho_khau SET chu_ho_id = 8 WHERE id = 3;
UPDATE ho_khau SET chu_ho_id = 13 WHERE id = 4;
UPDATE ho_khau SET chu_ho_id = 15 WHERE id = 5;
UPDATE ho_khau SET chu_ho_id = 19 WHERE id = 6;
UPDATE ho_khau SET chu_ho_id = 22 WHERE id = 7;
UPDATE ho_khau SET chu_ho_id = 27 WHERE id = 8;


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG users
-- Mật khẩu cho cả 2 tài khoản đều là: 123456
-- =================================================================
INSERT INTO users(username, password, full_name, role) VALUES
('admin', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Tổ trưởng A', 'ROLE_ADMIN'),
('ketoan', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Kế toán B', 'ROLE_ACCOUNTANT');


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG KHOẢN THU (khoan_thu)
-- =================================================================
INSERT INTO khoan_thu(ten_khoan_thu, ngay_tao, loai_khoan_thu, so_tien_tren_mot_nhan_khau) VALUES
('Phí vệ sinh năm 2025', '2025-10-01', 'BAT_BUOC', 6000),
('Ủng hộ ngày Thương binh - Liệt sỹ 27/07', '2025-07-01', 'DONG_GOP', NULL),
('Quỹ khuyến học năm 2025', '2025-08-15', 'DONG_GOP', NULL),
('Phí quản lý chung cư tháng 11/2025', '2025-11-01', 'BAT_BUOC', 150000);


-- =================================================================
-- DỮ LIỆU MẪU CHO LỊCH SỬ BIẾN ĐỘNG
-- =================================================================
-- Ghi nhận việc thêm mới các nhân khẩu hiện có vào lịch sử biến động
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
SELECT
    id,
    'THEM_MOI',
    COALESCE(ngay_dang_ky_thuong_tru, ngay_sinh),
    'Thêm mới khi khởi tạo hệ thống',
    'Hệ thống'
FROM nhan_khau;

-- Cập nhật lại sequence để đảm bảo ID không bị trùng lặp sau khi chèn dữ liệu cứng
-- Sử dụng cách tính toán động để tránh xung đột ID
SELECT setval('ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM ho_khau), 1));
SELECT setval('nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM nhan_khau), 1));
SELECT setval('khoan_thu_id_seq', COALESCE((SELECT MAX(id) FROM khoan_thu), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('lich_su_bien_dong_nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_bien_dong_nhan_khau), 1));
