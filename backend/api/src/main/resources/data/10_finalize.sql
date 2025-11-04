-- =================================================================
-- HOÀN TẤT VÀ ĐẢM BẢO TÍNH TOÀN VẸN
-- File này phải được chạy CUỐI CÙNG sau tất cả các file data khác.
-- =================================================================

-- Nhiệm vụ của file này là cập nhật lại cột `id_chu_ho` trong bảng `ho_khau`
-- dựa trên thông tin `quan_he_voi_chu_ho` từ bảng `nhan_khau`.
-- Điều này đảm bảo mỗi hộ khẩu đều có một chủ hộ chính xác sau mọi biến động.

UPDATE ho_khau hk
SET chu_ho_id = (
    SELECT nk.id
    FROM nhan_khau nk
    WHERE nk.ho_khau_id = hk.id
      AND nk.quan_he_voi_chu_ho = 'Chủ hộ'
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1
    FROM nhan_khau nk
    WHERE nk.ho_khau_id = hk.id
      AND nk.quan_he_voi_chu_ho = 'Chủ hộ'
);