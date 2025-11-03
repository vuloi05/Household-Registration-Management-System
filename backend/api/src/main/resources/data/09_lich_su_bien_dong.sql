-- =================================================================
-- DỮ LIỆU MẪU CHO LỊCH SỬ BIẾN ĐỘNG
-- File này mô phỏng các nghiệp vụ thực tế, làm thay đổi dữ liệu của các bảng khác.
-- =================================================================

-- 1. Ghi nhận việc thêm mới các nhân khẩu ban đầu vào lịch sử
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
SELECT
    id,
    'THEM_MOI',
    COALESCE(ngay_dang_ky_thuong_tru, ngay_sinh),
    'Thêm mới khi khởi tạo hệ thống',
    'Hệ thống'
FROM nhan_khau;

-- 2. Ghi nhận sự kiện khai tử
-- Bà Đỗ Thị Hoa (chủ hộ HK007) qua đời.
UPDATE nhan_khau SET ghi_chu = 'Đã mất ngày 10/07/2025' WHERE id = (SELECT id FROM nhan_khau WHERE ho_ten = 'Đỗ Thị Hoa' AND ho_khau_id = 7 LIMIT 1);
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
VALUES ((SELECT id FROM nhan_khau WHERE ho_ten = 'Đỗ Thị Hoa' AND ho_khau_id = 7 LIMIT 1), 'KHAI_TU', '2025-07-10', 'Qua đời do tuổi cao', 'Nguyễn Văn Cán Bộ');

-- 3. Ghi nhận sự kiện thay đổi chủ hộ sau khi chủ hộ cũ qua đời
-- Ông Nguyễn Văn Bình (con trai) trở thành chủ hộ mới của HK007.
UPDATE nhan_khau SET quan_he_voi_chu_ho = 'Chủ hộ' WHERE id = (SELECT id FROM nhan_khau WHERE ho_ten = 'Nguyễn Văn Bình' AND ho_khau_id = 7 LIMIT 1);
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
VALUES ((SELECT id FROM nhan_khau WHERE ho_ten = 'Nguyễn Văn Bình' AND ho_khau_id = 7 LIMIT 1), 'CHUYEN_DOI_CHU_HO', '2025-07-15', 'Thay đổi chủ hộ cho HK007 do chủ hộ cũ qua đời', 'Nguyễn Văn Cán Bộ');

-- 4. Ghi nhận sự kiện chuyển đi
-- Chị Vũ Thị Hà (con gái) của HK002 chuyển đi nơi khác.
UPDATE nhan_khau SET ghi_chu = 'Đã chuyển đi ngày 20/11/2025', ho_khau_id = NULL WHERE id = (SELECT id FROM nhan_khau WHERE ho_ten = 'Vũ Thị Hà' AND ho_khau_id = 2 LIMIT 1);
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
VALUES ((SELECT id FROM nhan_khau WHERE ho_ten = 'Vũ Thị Hà' LIMIT 1), 'CHUYEN_DI', '2025-11-20', 'Chuyển đến địa chỉ mới tại Quận Cầu Giấy, Hà Nội', 'Trần Thị Cán Bộ');

-- 5. Ghi nhận sự kiện tách hộ khẩu
-- Ông Nguyễn Văn Tách (anh trai) trong HK012 tách ra để lập hộ khẩu mới là HK101.
UPDATE nhan_khau SET ho_khau_id = 101, quan_he_voi_chu_ho = 'Chủ hộ' WHERE id = (SELECT id FROM nhan_khau WHERE ho_ten = 'Nguyễn Văn Tách' AND ho_khau_id = 12 LIMIT 1);
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
VALUES ((SELECT id FROM nhan_khau WHERE ho_ten = 'Nguyễn Văn Tách' AND ho_khau_id = 101 LIMIT 1), 'TACH_KHAU', '2025-12-01', 'Tách từ hộ HK012 thành hộ mới HK101', 'Lê Văn Cán Bộ');