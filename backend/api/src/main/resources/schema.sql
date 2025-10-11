/*
    Version 2.2: Tái cấu trúc CSDL
    - Loại bỏ trường 'chu_ho' khỏi bảng 'ho_khau'.
    - Bảng 'ho_khau' giờ sẽ tham chiếu đến chủ hộ thông qua khóa ngoại 'chu_ho_id'.
    - Tất cả mọi người, kể cả chủ hộ, đều là một bản ghi trong bảng 'nhan_khau'.
*/

-- Xóa các bảng theo thứ tự ngược lại của sự phụ thuộc để tránh lỗi khóa ngoại
DROP TABLE IF EXISTS lich_su_nop_tien CASCADE;
DROP TABLE IF EXISTS khoan_thu CASCADE;
DROP TABLE IF EXISTS nhan_khau CASCADE;
DROP TABLE IF EXISTS ho_khau CASCADE;

-- TẠO BẢNG HỘ KHẨU (ho_khau)
-- Bảng này được tạo trước, cột chu_ho_id sẽ được liên kết sau
CREATE TABLE ho_khau (
    id          BIGSERIAL PRIMARY KEY,
    ma_ho_khau  VARCHAR(255),
    dia_chi     VARCHAR(255),
    ngay_lap    DATE,
    chu_ho_id   BIGINT -- Khóa ngoại trỏ đến chủ hộ, tạm thời chưa có ràng buộc
);

-- TẠO BẢNG NHÂN KHẨU (nhan_khau)
CREATE TABLE nhan_khau (
    id                            BIGSERIAL PRIMARY KEY,
    ho_ten                        VARCHAR(255),
    bi_danh                       VARCHAR(255),
    ngay_sinh                     DATE,
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
CREATE TABLE khoan_thu (
    id                            BIGSERIAL PRIMARY KEY,
    ten_khoan_thu                 VARCHAR(255) NOT NULL,
    ngay_tao                      DATE NOT NULL,
    loai_khoan_thu                VARCHAR(50) NOT NULL, -- Ví dụ: 'BAT_BUOC', 'DONG_GOP'
    so_tien_tren_mot_nhan_khau    DECIMAL(10, 2) -- Dùng DECIMAL cho tiền tệ
);

-- TẠO BẢNG LỊCH SỬ NỘP TIỀN (lich_su_nop_tien)
CREATE TABLE lich_su_nop_tien (
    id                            BIGSERIAL PRIMARY KEY,
    ngay_nop                      DATE NOT NULL,
    so_tien                       DECIMAL(15, 2) NOT NULL,
    nguoi_thu                     VARCHAR(255),
    khoan_thu_id                  BIGINT NOT NULL,
    ho_khau_id                    BIGINT NOT NULL,

    CONSTRAINT fk_lichsu_khoanthu FOREIGN KEY (khoan_thu_id) REFERENCES khoan_thu(id),
    CONSTRAINT fk_lichsu_hokhau FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id)
);