/* 
    File này sẽ được Spring Boot tự động chạy khi khởi động ứng dụng.
    Nó chịu trách nhiệm tạo ra cấu trúc ban đầu cho cơ sở dữ liệu.
*/

-- Dòng này giúp xóa bảng cũ nếu nó đã tồn tại, đảm bảo script có thể chạy lại mà không bị lỗi.
DROP TABLE IF EXISTS nhan_khau;
DROP TABLE IF EXISTS ho_khau;

-- =================================================================
-- TẠO BẢNG HỘ KHẨU (ho_khau)
-- =================================================================
CREATE TABLE ho_khau (
    id          BIGSERIAL PRIMARY KEY,      -- Khóa chính tự tăng (kiểu dữ liệu của PostgreSQL)
    ma_ho_khau  VARCHAR(255),
    chu_ho      VARCHAR(255),
    dia_chi     VARCHAR(255)
);

-- =================================================================
-- TẠO BẢNG NHÂN KHẨU (nhan_khau)
-- =================================================================
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
    cmnd_cccd                     VARCHAR(255) UNIQUE, -- Ràng buộc duy nhất
    ngay_cap                      DATE,
    noi_cap                       VARCHAR(255),
    ngay_dang_ky_thuong_tru       DATE,
    dia_chi_truoc_khi_chuyen_den  VARCHAR(255),
    quan_he_voi_chu_ho            VARCHAR(255),
    ho_khau_id                    BIGINT NOT NULL,     -- Khóa ngoại, không được để trống

    -- Định nghĩa ràng buộc khóa ngoại
    CONSTRAINT fk_nhankhau_hokhau FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id)
);