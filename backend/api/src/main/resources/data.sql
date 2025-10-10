/*
    File này chứa dữ liệu mẫu sẽ được chèn vào CSDL mỗi khi ứng dụng khởi động.
    Nó được chạy sau file schema.sql.
*/

-- Xóa dữ liệu cũ trong các bảng để đảm bảo tính nhất quán
-- Phải xóa từ bảng con (nhan_khau) trước
DELETE FROM nhan_khau;
DELETE FROM ho_khau;

-- Reset lại chuỗi số tự tăng của ID về 1 cho cả hai bảng (cú pháp của PostgreSQL)
ALTER SEQUENCE ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE nhan_khau_id_seq RESTART WITH 1;

-- =================================================================
-- DỮ LIỆU MẪU
-- =================================================================

-- Hộ khẩu 1: Nguyễn Văn A (có 2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) VALUES('HK001', 'Số 1, Ngõ ABC, Phường La Khê', '2020-01-10');
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Nguyễn Văn A', '1980-05-20', 'Chủ hộ', '012345678901', 1);
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Nguyễn Thị B', '1982-10-15', 'Vợ', '012345678902', 1);
UPDATE ho_khau SET chu_ho_id = 1 WHERE id = 1;

-- Hộ khẩu 2: Trần Văn C (có 3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) VALUES('HK002', 'Số 25, Đường XYZ, Phường La Khê', '2018-07-22');
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Trần Văn C', '1975-02-11', 'Chủ hộ', '111222333444', 2);
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Lê Thị D', '1978-08-30', 'Vợ', '111222333555', 2);
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Trần Gia Bảo', '2005-11-05', 'Con', '111222333666', 2);
UPDATE ho_khau SET chu_ho_id = 3 WHERE id = 2;

-- Hộ khẩu 3: Phạm Minh E (chỉ có 1 mình chủ hộ)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) VALUES('HK003', 'Số 10, Ngõ Tự Do, Phường La Khê', '2022-03-01');
INSERT INTO nhan_khau(ho_ten, ngay_sinh, quan_he_voi_chu_ho, cmnd_cccd, ho_khau_id) VALUES('Phạm Minh E', '1990-01-01', 'Chủ hộ', '999888777666', 3);
UPDATE ho_khau SET chu_ho_id = 6 WHERE id = 3;