/*
    Version 2.2: Tái cấu trúc CSDL
    - Loại bỏ trường 'chu_ho' khỏi bảng 'ho_khau'.
    - Bảng 'ho_khau' giờ sẽ tham chiếu đến chủ hộ thông qua khóa ngoại 'chu_ho_id'.
    - Tất cả mọi người, kể cả chủ hộ, đều là một bản ghi trong bảng 'nhan_khau'.
*/

-- Xóa các bảng theo thứ tự ngược lại của sự phụ thuộc để tránh lỗi khóa ngoại
DROP TABLE IF EXISTS lich_su_nop_tien CASCADE;
DROP TABLE IF EXISTS khoan_thu CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS nhan_khau CASCADE;
DROP TABLE IF EXISTS ho_khau CASCADE;

-- TẠO BẢNG HỘ KHẨU (ho_khau)
-- Bảng này được tạo trước, cột chu_ho_id sẽ được liên kết sau
CREATE TABLE IF NOT EXISTS ho_khau (
    id          BIGSERIAL PRIMARY KEY,
    ma_ho_khau  VARCHAR(255),
    dia_chi     VARCHAR(255),
    ngay_lap    DATE,
    chu_ho_id   BIGINT -- Khóa ngoại trỏ đến chủ hộ, tạm thời chưa có ràng buộc
);

-- TẠO BẢNG NHÂN KHẨU (nhan_khau)
CREATE TABLE IF NOT EXISTS nhan_khau (
    id                            BIGSERIAL PRIMARY KEY,
    ho_ten                        VARCHAR(255),
    bi_danh                       VARCHAR(255),
    ngay_sinh                     DATE,
    gioi_tinh                     VARCHAR(10),  -- Thêm cột giới tính
    noi_sinh                      VARCHAR(255),
    que_quan                      VARCHAR(255),
    dan_toc                       VARCHAR(255),
    nghe_nghiep                   VARCHAR(255),
    noi_lam_viec                  VARCHAR(255),
    cmnd_cccd                     VARCHAR(255) UNIQUE,
    ngay_cap                      DATE,
    noi_cap                       VARCHAR(255),
    ngay_dang_ky_thuong_tru       DATE,
    dia_chi_truoc_khi_chuyen_den  VARCHAR(255),
    quan_he_voi_chu_ho            VARCHAR(255),
    ho_khau_id                    BIGINT, -- Khóa ngoại, có thể null ban đầu
    ghi_chu                       TEXT,
    
    -- Ràng buộc khóa ngoại: một nhân khẩu thuộc về một hộ khẩu
    CONSTRAINT fk_nhankhau_hokhau FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id)
);

-- THÊM RÀNG BUỘC KHÓA NGOẠI CHO CỘT chu_ho_id TRONG BẢNG ho_khau
-- Cần thực hiện sau khi cả 2 bảng đã được tạo để tránh lỗi phụ thuộc vòng
-- Ràng buộc này chỉ định rằng một hộ khẩu phải có một chủ hộ là một nhân khẩu
ALTER TABLE ho_khau
ADD CONSTRAINT fk_hokhau_nhankhau_chuho
FOREIGN KEY (chu_ho_id) REFERENCES nhan_khau(id);



-- TẠO BẢNG KHOẢN THU (khoan_thu)
CREATE TABLE IF NOT EXISTS khoan_thu (
    id                            BIGSERIAL PRIMARY KEY,
    ten_khoan_thu                 VARCHAR(255) NOT NULL,
    ngay_tao                      DATE NOT NULL,
    loai_khoan_thu                VARCHAR(50) NOT NULL, -- Ví dụ: 'BAT_BUOC', 'DONG_GOP'
    so_tien_tren_mot_nhan_khau    DECIMAL(10, 2) -- Dùng DECIMAL cho tiền tệ
);

-- TẠO BẢNG LỊCH SỬ NỘP TIỀN (lich_su_nop_tien)
CREATE TABLE IF NOT EXISTS lich_su_nop_tien (
    id                            BIGSERIAL PRIMARY KEY,
    ngay_nop                      DATE NOT NULL,
    so_tien                       DECIMAL(15, 2) NOT NULL,
    nguoi_thu                     VARCHAR(255),
    khoan_thu_id                  BIGINT NOT NULL,
    ho_khau_id                    BIGINT NOT NULL,

    CONSTRAINT fk_lichsu_khoanthu FOREIGN KEY (khoan_thu_id) REFERENCES khoan_thu(id),
    CONSTRAINT fk_lichsu_hokhau FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id)
);


-- =================================================================
-- TẠO BẢNG NGƯỜI DÙNG (users)
-- =================================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    role        VARCHAR(50) NOT NULL -- Ví dụ: 'ROLE_ADMIN', 'ROLE_ACCOUNTANT'
);

-- =====================================================
-- MIGRATION SCRIPT: Biến động Nhân khẩu
-- Mô tả: Thêm các bảng và cột cần thiết để quản lý
--        biến động nhân khẩu (chuyển đi, qua đời, thay đổi chủ hộ)
-- =====================================================

-- 1. Thêm cột trạng thái vào bảng nhan_khau
ALTER TABLE nhan_khau
    ADD COLUMN IF NOT EXISTS trang_thai VARCHAR(50) DEFAULT 'DANG_CU_TRU';

COMMENT ON COLUMN nhan_khau.trang_thai IS 'Trạng thái của nhân khẩu: DANG_CU_TRU, DA_CHUYEN_DI, DA_QUA_DOI, TAM_VANG';

-- 2. Tạo bảng lịch sử biến động nhân khẩu
CREATE TABLE IF NOT EXISTS lich_su_bien_dong_nhan_khau (
                                                           id                  BIGSERIAL PRIMARY KEY,
                                                           nhan_khau_id        BIGINT NOT NULL,
                                                           loai_bien_dong      VARCHAR(50) NOT NULL,
    ngay_bien_dong      DATE NOT NULL,
    noi_chuyen_den      VARCHAR(255),
    ly_do               TEXT,
    ghi_chu             TEXT,
    nguoi_ghi_nhan      VARCHAR(255),
    ngay_ghi_nhan       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lichsu_nhankhau FOREIGN KEY (nhan_khau_id)
    REFERENCES nhan_khau(id) ON DELETE CASCADE
    );

COMMENT ON TABLE lich_su_bien_dong_nhan_khau IS 'Lưu lịch sử các biến động của nhân khẩu';
COMMENT ON COLUMN lich_su_bien_dong_nhan_khau.loai_bien_dong IS 'Loại biến động: THEM_MOI, CHUYEN_DI, QUA_DOI, THAY_DOI_CHU_HO, THAY_DOI_THONG_TIN';
COMMENT ON COLUMN lich_su_bien_dong_nhan_khau.ngay_bien_dong IS 'Ngày xảy ra biến động';
COMMENT ON COLUMN lich_su_bien_dong_nhan_khau.noi_chuyen_den IS 'Nơi chuyển đến (nếu là chuyển đi)';
COMMENT ON COLUMN lich_su_bien_dong_nhan_khau.ly_do IS 'Lý do biến động';
COMMENT ON COLUMN lich_su_bien_dong_nhan_khau.ghi_chu IS 'Ghi chú thêm';

-- 3. Tạo bảng lịch sử thay đổi hộ khẩu (thay đổi chủ hộ, địa chỉ, v.v.)
CREATE TABLE IF NOT EXISTS lich_su_thay_doi_ho_khau (
                                                        id                  BIGSERIAL PRIMARY KEY,
                                                        ho_khau_id          BIGINT NOT NULL,
                                                        loai_thay_doi       VARCHAR(50) NOT NULL,
    noi_dung_thay_doi   TEXT NOT NULL,
    ngay_thay_doi       DATE NOT NULL,
    chu_ho_cu_id        BIGINT,
    chu_ho_moi_id       BIGINT,
    nguoi_ghi_nhan      VARCHAR(255),
    ngay_ghi_nhan       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lichsu_hokhau FOREIGN KEY (ho_khau_id)
    REFERENCES ho_khau(id) ON DELETE CASCADE,
    CONSTRAINT fk_lichsu_chuhocu FOREIGN KEY (chu_ho_cu_id)
    REFERENCES nhan_khau(id) ON DELETE SET NULL,
    CONSTRAINT fk_lichsu_chuhomoi FOREIGN KEY (chu_ho_moi_id)
    REFERENCES nhan_khau(id) ON DELETE SET NULL
    );

COMMENT ON TABLE lich_su_thay_doi_ho_khau IS 'Lưu lịch sử các thay đổi liên quan đến toàn bộ hộ khẩu';
COMMENT ON COLUMN lich_su_thay_doi_ho_khau.loai_thay_doi IS 'Loại thay đổi: THAY_DOI_CHU_HO, THAY_DOI_DIA_CHI, TACH_HO';
COMMENT ON COLUMN lich_su_thay_doi_ho_khau.noi_dung_thay_doi IS 'Mô tả chi tiết nội dung thay đổi';

-- 4. Tạo index để tăng tốc truy vấn
CREATE INDEX IF NOT EXISTS idx_lichsu_nhankhau_id ON lich_su_bien_dong_nhan_khau(nhan_khau_id);
CREATE INDEX IF NOT EXISTS idx_lichsu_nhankhau_ngay ON lich_su_bien_dong_nhan_khau(ngay_bien_dong);
CREATE INDEX IF NOT EXISTS idx_lichsu_nhankhau_loai ON lich_su_bien_dong_nhan_khau(loai_bien_dong);

CREATE INDEX IF NOT EXISTS idx_lichsu_hokhau_id ON lich_su_thay_doi_ho_khau(ho_khau_id);
CREATE INDEX IF NOT EXISTS idx_lichsu_hokhau_ngay ON lich_su_thay_doi_ho_khau(ngay_thay_doi);
CREATE INDEX IF NOT EXISTS idx_nhankhau_trangthai ON nhan_khau(trang_thai);

-- TẠO BẢNG TẠM VẮNG (tam_vang)
CREATE TABLE IF NOT EXISTS tam_vang (
    id BIGSERIAL PRIMARY KEY,
    nhan_khau_id BIGINT REFERENCES nhan_khau(id),
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    noi_den VARCHAR(255),
    ly_do TEXT,
    ngay_cap DATE,
    nguoi_cap VARCHAR(255)
);

-- TẠO BẢNG TẠM TRÚ (tam_tru)
CREATE TABLE IF NOT EXISTS tam_tru (
    id BIGSERIAL PRIMARY KEY,
    ho_ten VARCHAR(255) NOT NULL,
    ngay_sinh DATE,
    gioi_tinh VARCHAR(10),
    cmnd_cccd VARCHAR(255),
    noi_thuong_tru VARCHAR(255),
    ho_khau_tiep_nhan_id BIGINT REFERENCES ho_khau(id),
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    ly_do TEXT,
    ngay_cap DATE,
    nguoi_cap VARCHAR(255)
);

-- 5. Dữ liệu mẫu cho lịch sử biến động (optional)
-- Ghi nhận việc thêm mới các nhân khẩu hiện có
INSERT INTO lich_su_bien_dong_nhan_khau (nhan_khau_id, loai_bien_dong, ngay_bien_dong, ghi_chu, nguoi_ghi_nhan)
SELECT
    id,
    'THEM_MOI',
    COALESCE(ngay_dang_ky_thuong_tru, ngay_sinh),
    'Thêm mới khi khởi tạo hệ thống',
    'Hệ thống'
FROM nhan_khau
WHERE NOT EXISTS (
    SELECT 1 FROM lich_su_bien_dong_nhan_khau WHERE nhan_khau_id = nhan_khau.id
);

-- 6. Cập nhật sequence để đảm bảo ID không bị trùng
SELECT setval('lich_su_bien_dong_nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_bien_dong_nhan_khau), 0) + 1);
SELECT setval('lich_su_thay_doi_ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_thay_doi_ho_khau), 0) + 1);