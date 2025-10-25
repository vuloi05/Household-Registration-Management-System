/*
    File này chứa dữ liệu mẫu sẽ được chèn vào CSDL mỗi khi ứng dụng khởi động.
    Nó được chạy sau file schema.sql.
*/

-- Xóa dữ liệu cũ trong các bảng để đảm bảo tính nhất quán
-- Phải xóa từ bảng con (nhan_khau) trước do có khóa ngoại
DELETE FROM nhan_khau;
DELETE FROM ho_khau;

-- Reset lại chuỗi số tự tăng của ID về 1 cho cả hai bảng (cú pháp của PostgreSQL)
ALTER SEQUENCE ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE nhan_khau_id_seq RESTART WITH 1;

-- =================================================================
-- DỮ LIỆU MẪU
-- =================================================================

-- Hộ khẩu 1: Gia đình ông Nguyễn Văn A (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK001', 'Số 1, Ngõ ABC, Phường La Khê', '2020-01-10');

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Nguyễn Văn An', 'Tí', '1980-05-20', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Kỹ sư phần mềm', 'Công ty FPT Software', '012345678901', '2021-07-15', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Chủ hộ', 1);

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Trần Thị Bích', NULL, '1982-10-15', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Giáo viên', 'Trường THCS La Khê', '012345678902', '2021-08-20', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Vợ', 1);

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Nguyễn Hoàng Minh', 'Bin', '2010-09-01', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Học sinh', 'Trường Tiểu học La Khê', NULL, NULL, NULL, '2010-09-10', 'Mới sinh', 'Con', 1);

-- Cập nhật chủ hộ cho Hộ khẩu 1
UPDATE ho_khau SET chu_ho_id = 1 WHERE id = 1;


-- Hộ khẩu 2: Gia đình ông Trần Văn Cường (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK002', 'Số 25, Đường XYZ, Phường La Khê', '2018-07-22');

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Trần Văn Cường', NULL, '1975-02-11', 'Nam', 'Hà Tây', 'Hà Tây', 'Kinh', 'Kinh doanh tự do', 'Tại nhà', '111222333444', '2022-01-05', 'Công an TP Hà Nội', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Chủ hộ', 2);

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Trần Gia Bảo', 'Bảo', '2005-11-05', 'Nam', 'Bệnh viện 103, Hà Nội', 'Hà Tây', 'Kinh', 'Sinh viên', 'Đại học Bách Khoa HN', '111222333666', '2021-12-25', 'Cục CSQLHC về TTXH', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Con', 2);

-- Cập nhật chủ hộ cho Hộ khẩu 2
UPDATE ho_khau SET chu_ho_id = 4 WHERE id = 2;


-- Hộ khẩu 3: Gia đình bà Phạm Thị Mai (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK003', 'Số 10, Ngõ Tự Do, Phường La Khê', '2022-03-01');

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Phạm Thị Mai', NULL, '1990-01-01', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nhân viên văn phòng', 'Công ty ABC', '999888777666', '2023-02-14', 'Cục CSQLHC về TTXH', '2022-03-01', 'Thanh Hóa', 'Chủ hộ', 3);

INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) 
VALUES('Lê Minh Tuấn', NULL, '1988-06-20', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Lập trình viên', 'Công ty XYZ', '999888777555', '2023-01-10', 'Cục CSQLHC về TTXH', '2023-05-15', 'Cầu Giấy, Hà Nội', 'Chồng', 3);

-- Cập nhật chủ hộ cho Hộ khẩu 3
UPDATE ho_khau SET chu_ho_id = 6 WHERE id = 3;


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG users
-- Mật khẩu cho cả 2 tài khoản đều là: 123456
-- =================================================================
INSERT INTO users(username, password, full_name, role) VALUES('admin', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Tổ trưởng A', 'ROLE_ADMIN');
INSERT INTO users(username, password, full_name, role) VALUES('ketoan', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Kế toán B', 'ROLE_ACCOUNTANT');


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG KHOẢN THU (khoan_thu)
-- =================================================================

-- Khoản thu 1: Phí vệ sinh bắt buộc
INSERT INTO khoan_thu(ten_khoan_thu, ngay_tao, loai_khoan_thu, so_tien_tren_mot_nhan_khau)
VALUES('Phí vệ sinh năm 2025', '2025-10-01', 'BAT_BUOC', 6000);

-- Khoản thu 2: Đóng góp tự nguyện
INSERT INTO khoan_thu(ten_khoan_thu, ngay_tao, loai_khoan_thu, so_tien_tren_mot_nhan_khau)
VALUES('Ủng hộ ngày Thương binh - Liệt sỹ 27/07', '2025-07-01', 'DONG_GOP', NULL);