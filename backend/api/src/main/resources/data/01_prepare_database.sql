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
