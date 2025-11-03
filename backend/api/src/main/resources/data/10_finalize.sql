-- =================================================================
-- CẬP NHẬT CHỦ HỘ (TỰ ĐỘNG)
-- Tìm id của nhân khẩu là 'Chủ hộ' trong mỗi hộ khẩu và cập nhật
-- cột chu_ho_id của bảng ho_khau tương ứng.
-- =================================================================
UPDATE ho_khau hk
SET chu_ho_id = nk.id
FROM nhan_khau nk
WHERE nk.ho_khau_id = hk.id AND nk.quan_he_voi_chu_ho = 'Chủ hộ';

-- Cập nhật lại sequence để đảm bảo ID không bị trùng lặp sau khi chèn dữ liệu cứng
-- Sử dụng cách tính toán động để tránh xung đột ID
SELECT setval('ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM ho_khau), 1));
SELECT setval('nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM nhan_khau), 1));
SELECT setval('khoan_thu_id_seq', COALESCE((SELECT MAX(id) FROM khoan_thu), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('lich_su_bien_dong_nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_bien_dong_nhan_khau), 1));
SELECT setval('lich_su_nop_tien_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_nop_tien), 1));
