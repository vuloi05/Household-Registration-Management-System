-- Script để reset hoàn toàn database và đồng bộ sequence
-- Chạy script này khi gặp lỗi duplicate key

-- Xóa tất cả dữ liệu (theo thứ tự ngược lại của sự phụ thuộc)
DELETE FROM lich_su_nop_tien;
DELETE FROM tam_tru;
DELETE FROM tam_vang;
DELETE FROM lich_su_bien_dong_nhan_khau;
DELETE FROM lich_su_thay_doi_ho_khau;
DELETE FROM khoan_thu;
DELETE FROM nhan_khau;
DELETE FROM ho_khau;
DELETE FROM users;

-- Reset tất cả sequence về 1
ALTER SEQUENCE ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE nhan_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE khoan_thu_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_nop_tien_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_bien_dong_nhan_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE lich_su_thay_doi_ho_khau_id_seq RESTART WITH 1;
ALTER SEQUENCE tam_vang_id_seq RESTART WITH 1;
ALTER SEQUENCE tam_tru_id_seq RESTART WITH 1;

-- Đảm bảo sequence được đồng bộ với dữ liệu hiện tại (nếu có)
SELECT setval('ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM ho_khau), 0) + 1);
SELECT setval('nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM nhan_khau), 0) + 1);
SELECT setval('khoan_thu_id_seq', COALESCE((SELECT MAX(id) FROM khoan_thu), 0) + 1);
SELECT setval('lich_su_nop_tien_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_nop_tien), 0) + 1);
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1);
SELECT setval('lich_su_bien_dong_nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_bien_dong_nhan_khau), 0) + 1);
SELECT setval('lich_su_thay_doi_ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_thay_doi_ho_khau), 0) + 1);
SELECT setval('tam_vang_id_seq', COALESCE((SELECT MAX(id) FROM tam_vang), 0) + 1);
SELECT setval('tam_tru_id_seq', COALESCE((SELECT MAX(id) FROM tam_tru), 0) + 1);

-- Hiển thị trạng thái sequence hiện tại
SELECT 'ho_khau_id_seq' as sequence_name, last_value FROM ho_khau_id_seq
UNION ALL
SELECT 'nhan_khau_id_seq' as sequence_name, last_value FROM nhan_khau_id_seq
UNION ALL
SELECT 'khoan_thu_id_seq' as sequence_name, last_value FROM khoan_thu_id_seq
UNION ALL
SELECT 'lich_su_nop_tien_id_seq' as sequence_name, last_value FROM lich_su_nop_tien_id_seq
UNION ALL
SELECT 'users_id_seq' as sequence_name, last_value FROM users_id_seq
UNION ALL
SELECT 'lich_su_bien_dong_nhan_khau_id_seq' as sequence_name, last_value FROM lich_su_bien_dong_nhan_khau_id_seq
UNION ALL
SELECT 'lich_su_thay_doi_ho_khau_id_seq' as sequence_name, last_value FROM lich_su_thay_doi_ho_khau_id_seq
UNION ALL
SELECT 'tam_vang_id_seq' as sequence_name, last_value FROM tam_vang_id_seq
UNION ALL
SELECT 'tam_tru_id_seq' as sequence_name, last_value FROM tam_tru_id_seq;
