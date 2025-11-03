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
