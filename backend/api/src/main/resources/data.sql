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


-- =================================================================
-- DỮ LIỆU MẪU
-- =================================================================

-- Hộ khẩu 1: Gia đình ông Nguyễn Văn An (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK001', 'Số 1, Ngõ 12, Phường La Khê, Quận Hà Đông', '2020-01-10');

-- Hộ khẩu 2: Gia đình bà Lê Thị Dung (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK002', 'Số 25, Đường Quang Trung, Phường Yết Kiêu, Quận Hà Đông', '2018-07-22');

-- Hộ khẩu 3: Gia đình ông Trần Văn Cường (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK003', 'Số 10, Ngõ Tự Do, Phường Mộ Lao, Quận Hà Đông', '2022-03-01');

-- Hộ khẩu 4: Gia đình bà Phạm Thị Mai (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK004', 'Số 15, Đường Trần Phú, Phường Văn Quán, Quận Hà Đông', '2023-06-15');

-- Hộ khẩu 5: Gia đình ông Lê Văn Đức (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK005', 'Số 8, Ngõ GHI, Phường Vạn Phúc, Quận Hà Đông', '2024-01-20');

-- Hộ khẩu 6: Gia đình ông Hoàng Kim Thông (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK006', 'Số 78, Phố Tố Hữu, Phường Dương Nội, Quận Hà Đông', '2019-05-11');

-- Hộ khẩu 7: Gia đình bà Đỗ Thị Hoa (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK007', 'Nhà 22, Khu tập thể Dệt, Phường Vạn Phúc, Quận Hà Đông', '2017-02-28');

-- Hộ khẩu 8: Gia đình ông Bùi Văn Nam (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK008', 'Số 4, Ngách 5, Ngõ 19, Phường Phú La, Quận Hà Đông', '2021-11-15');

-- Hộ khẩu 9: Gia đình ông Phan Văn Giang (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK009', 'Số 30, Phố Ao Sen, Phường Mộ Lao, Quận Hà Đông', '2015-08-20');

-- Hộ khẩu 10: Gia đình ông Vũ Đình Trọng (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK010', 'P1102, Tòa A, Chung cư An Lạc, Phường La Khê, Quận Hà Đông', '2023-01-05');

-- Hộ khẩu 11: Gia đình bà Trần Thị Thu (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK011', 'Số 55, Đường Nhuệ Giang, Phường Yết Kiêu, Quận Hà Đông', '2016-02-18');

-- Hộ khẩu 12: Gia đình ông Nguyễn Quốc Tuấn (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK012', 'Số 12, Ngõ 2, Phố Bà Triệu, Phường Nguyễn Trãi, Quận Hà Đông', '2019-09-10');

-- Hộ khẩu 13: Gia đình bà Hoàng Thị Yến (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK013', 'Nhà 7, Khu tập thể Học viện Chính trị, Phường Mộ Lao, Quận Hà Đông', '2014-12-25');

-- Hộ khẩu 14: Gia đình ông Đặng Văn Hùng (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK014', 'Số 202, Phố Xốm, Phường Phú Lãm, Quận Hà Đông', '2020-07-30');

-- Hộ khẩu 15: Gia đình bà Mai Thị Loan (1 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK015', 'P501, Chung cư Goldsilk, Phường Vạn Phúc, Quận Hà Đông', '2023-11-01');

-- Hộ khẩu 16: Gia đình ông Trịnh Văn Quyết (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK016', 'Số 9, Đường Lê Trọng Tấn, Phường Dương Nội, Quận Hà Đông', '2018-04-14');

-- Hộ khẩu 17: Gia đình ông Phạm Minh Chính (3 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK017', 'Số 18, Phố Bế Văn Đàn, Phường Quang Trung, Quận Hà Đông', '2022-08-19');

-- Hộ khẩu 18: Gia đình bà Nguyễn Thị Kim Ngân (4 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK018', 'Số 41, Phố Tô Hiệu, Phường Nguyễn Trãi, Quận Hà Đông', '2017-10-03');

-- Hộ khẩu 19: Gia đình ông Vương Đình Huệ (2 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK019', 'Biệt thự 12, Làng Việt kiều Châu Âu, Phường Mộ Lao, Quận Hà Đông', '2024-03-01');

-- Hộ khẩu 20: Gia đình ông Tô Lâm (5 thành viên)
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) 
VALUES('HK020', 'Số 2, Ngõ 1, Đường 19/5, Phường Văn Quán, Quận Hà Đông', '2015-06-09');

-- Hộ khẩu 21-50
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) VALUES
('HK021', 'Số 15, Phố Văn La, Phường Phú La, Quận Hà Đông', '2022-10-10'),
('HK022', 'P808, Tòa CT2, KĐT Xa La, Phường Phúc La, Quận Hà Đông', '2019-03-15'),
('HK023', 'Số 11, Ngõ 3, Phố Lê Lai, Phường Nguyễn Trãi, Quận Hà Đông', '2017-07-21'),
('HK024', 'Số 88, Đường 19/5, Phường Văn Quán, Quận Hà Đông', '2023-01-11'),
('HK025', 'P1605, Tòa T1, Chung cư The Pride, Phường La Khê, Quận Hà Đông', '2018-11-30'),
('HK026', 'Số 4, Biệt thự An Hưng, Phường Dương Nội, Quận Hà Đông', '2020-05-05'),
('HK027', 'Số 33, Phố Trần Đăng Ninh, Phường Quang Trung, Quận Hà Đông', '2016-09-01'),
('HK028', 'Số 7, Ngách 12, Ngõ 5, Phường Vạn Phúc, Quận Hà Đông', '2021-04-12'),
('HK029', 'P2101, Tòa G, Chung cư Fodacon, Phường Mộ Lao, Quận Hà Đông', '2014-08-22'),
('HK030', 'Số 123, Đường Đa Sỹ, Phường Kiến Hưng, Quận Hà Đông', '2023-06-07'),
('HK031', 'Số 2, Phố Hà Trì, Phường Hà Cầu, Quận Hà Đông', '2011-01-15'),
('HK032', 'P1010, Tòa CT5, KĐT Văn Khê, Phường La Khê, Quận Hà Đông', '2019-12-01'),
('HK033', 'Số 5, Ngõ 1, Phố Nguyễn Văn Lộc, Phường Mộ Lao, Quận Hà Đông', '2022-02-20'),
('HK034', 'Số 67, Phố Phan Đình Giót, Phường Yết Kiêu, Quận Hà Đông', '2018-10-18'),
('HK035', 'P1503, Chung cư Hyundai Hillstate, Phường Hà Cầu, Quận Hà Đông', '2020-03-25'),
('HK036', 'Số 19, Đường Chiến Thắng, Phường Văn Quán, Quận Hà Đông', '2017-05-19'),
('HK037', 'Số 24, Phố Yên Bình, Phường Phúc La, Quận Hà Đông', '2023-08-01'),
('HK038', 'P902, Tòa CT8, KĐT Xa La, Phường Phúc La, Quận Hà Đông', '2016-11-11'),
('HK039', 'Số 3, Ngõ 2, Đường Phan Bội Châu, Phường Yết Kiêu, Quận Hà Đông', '2021-07-07'),
('HK040', 'Số 505, Đường Quang Trung, Phường La Khê, Quận Hà Đông', '2019-04-04'),
('HK041', 'P1801, Tòa 101, Usilk City, Phường La Khê, Quận Hà Đông', '2022-12-12'),
('HK042', 'Số 14, Phố Lụa, Phường Vạn Phúc, Quận Hà Đông', '2015-02-14'),
('HK043', 'Số 28, Đường Ao Sen, Phường Mộ Lao, Quận Hà Đông', '2023-10-02'),
('HK044', 'P12A05, Tòa R1, Chung cư Seasons Avenue, Phường Mộ Lao, Quận Hà Đông', '2020-09-09'),
('HK045', 'Số 3, Ngõ 4, Phố Văn La, Phường Phú La, Quận Hà Đông', '2018-06-20'),
('HK046', 'Số 77, Đường Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông', '2016-03-17'),
('HK047', 'P2508, Tòa B, Chung cư Hồ Gươm Plaza, Phường Mộ Lao, Quận Hà Đông', '2021-08-30'),
('HK048', 'Số 1, Ngõ 10, Đường Thanh Bình, Phường Mộ Lao, Quận Hà Đông', '2017-12-12'),
('HK049', 'Số 45, Phố Nguyễn Khuyến, Phường Văn Quán, Quận Hà Đông', '2023-04-25'),
('HK050', 'P3001, Tòa Parkview, KĐT Dương Nội, Phường Dương Nội, Quận Hà Đông', '2022-01-10');

-- Hộ khẩu 51-100
INSERT INTO ho_khau(ma_ho_khau, dia_chi, ngay_lap) VALUES
('HK051', 'Số 10, Ngõ 15, Phố Yên Phúc, Phường Phúc La, Quận Hà Đông', '2019-08-15'),
('HK052', 'P1409, Tòa CT1, KĐT Văn Khê, Phường La Khê, Quận Hà Đông', '2021-06-20'),
('HK053', 'Số 22, Đường Bưởi, Phường Vạn Phúc, Quận Hà Đông', '2018-02-10'),
('HK054', 'Số 3, Ngõ 12, Phố Trưng Nhị, Phường Nguyễn Trãi, Quận Hà Đông', '2023-05-01'),
('HK055', 'P11A02, Tòa M, Chung cư Mulberry Lane, Phường Mộ Lao, Quận Hà Đông', '2017-10-05'),
('HK056', 'Số 8, Biệt thự The Vesta, Phường Phú Lãm, Quận Hà Đông', '2022-03-18'),
('HK057', 'Số 45, Phố Chu Văn An, Phường Yết Kiêu, Quận Hà Đông', '2016-07-11'),
('HK058', 'Số 19, Ngách 1, Ngõ 25, Phường Quang Trung, Quận Hà Đông', '2020-11-23'),
('HK059', 'P2804, Tòa C, Chung cư Roman Plaza, Phường Mộ Lao, Quận Hà Đông', '2019-01-29'),
('HK060', 'Số 188, Đường Cầu Bươu, Phường Kiến Hưng, Quận Hà Đông', '2023-09-14'),
('HK061', 'Số 12, Phố Tản Đà, Phường Nguyễn Trãi, Quận Hà Đông', '2015-04-16'),
('HK062', 'P707, Tòa CT6, KĐT Xa La, Phường Phúc La, Quận Hà Đông', '2018-08-08'),
('HK063', 'Số 9, Ngõ 3, Phố Lương Văn Can, Phường Vạn Phúc, Quận Hà Đông', '2022-07-17'),
('HK064', 'Số 71, Phố Nhuệ Giang, Phường Yết Kiêu, Quận Hà Đông', '2017-09-28'),
('HK065', 'P1906, Chung cư FLC Star Tower, Phường Vạn Phúc, Quận Hà Đông', '2021-02-05'),
('HK066', 'Số 21, Đường Nguyễn Thượng Hiền, Phường Yết Kiêu, Quận Hà Đông', '2019-06-19'),
('HK067', 'Số 35, Phố Phùng Hưng, Phường Phúc La, Quận Hà Đông', '2023-11-11'),
('HK068', 'P1608, Tòa A, Chung cư Victoria Văn Phú, Phường Phú La, Quận Hà Đông', '2018-01-13'),
('HK069', 'Số 5, Ngõ 4, Đường Tố Hữu, Phường Vạn Phúc, Quận Hà Đông', '2022-05-25'),
('HK070', 'Số 601, Đường Ngô Thì Nhậm, Phường La Khê, Quận Hà Đông', '2020-02-02'),
('HK071', 'P2203, Tòa 102, Usilk City, Phường La Khê, Quận Hà Đông', '2023-03-03'),
('HK072', 'Số 18, Phố Lụa Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông', '2016-08-24'),
('HK073', 'Số 31, Đường Ao Sen, Phường Mộ Lao, Quận Hà Đông', '2021-10-12'),
('HK074', 'P18B07, Tòa S2, Chung cư Seasons Avenue, Phường Mộ Lao, Quận Hà Đông', '2019-07-19'),
('HK075', 'Số 8, Ngõ 5, Phố Văn La, Phường Phú La, Quận Hà Đông', '2017-03-23'),
('HK076', 'Số 81, Đường Vạn Phúc, Phường Vạn Phúc, Quận Hà Đông', '2018-09-18'),
('HK077', 'P2901, Tòa A, Chung cư Hồ Gươm Plaza, Phường Mộ Lao, Quận Hà Đông', '2022-08-03'),
('HK078', 'Số 11, Ngõ 11, Đường Thanh Bình, Phường Mộ Lao, Quận Hà Đông', '2016-12-21'),
('HK079', 'Số 50, Phố Nguyễn Khuyến, Phường Văn Quán, Quận Hà Đông', '2023-07-27'),
('HK080', 'P3205, Tòa Anland, KĐT Dương Nội, Phường Dương Nội, Quận Hà Đông', '2021-01-20'),
('HK081', 'Số 11, Ngõ 16, Phố Yên Phúc, Phường Phúc La, Quận Hà Đông', '2019-09-16'),
('HK082', 'P1510, Tòa CT2, KĐT Văn Khê, Phường La Khê, Quận Hà Đông', '2022-07-21'),
('HK083', 'Số 23, Đường Cau, Phường Vạn Phúc, Quận Hà Đông', '2017-02-11'),
('HK084', 'Số 4, Ngõ 13, Phố Trưng Trắc, Phường Nguyễn Trãi, Quận Hà Đông', '2023-06-02'),
('HK085', 'P12B03, Tòa L, Chung cư Mulberry Lane, Phường Mộ Lao, Quận Hà Đông', '2018-11-06'),
('HK086', 'Số 9, Biệt thự The Vesta, Phường Phú Lãm, Quận Hà Đông', '2023-04-19'),
('HK087', 'Số 46, Phố Chu Văn An, Phường Yết Kiêu, Quận Hà Đông', '2015-07-12'),
('HK088', 'Số 20, Ngách 2, Ngõ 26, Phường Quang Trung, Quận Hà Đông', '2021-12-24'),
('HK089', 'P2905, Tòa D, Chung cư Roman Plaza, Phường Mộ Lao, Quận Hà Đông', '2020-02-28'),
('HK090', 'Số 189, Đường Cầu Bươu, Phường Kiến Hưng, Quận Hà Đông', '2023-10-15'),
('HK091', 'Số 13, Phố Tản Đà, Phường Nguyễn Trãi, Quận Hà Đông', '2016-05-17'),
('HK092', 'P808, Tòa CT7, KĐT Xa La, Phường Phúc La, Quận Hà Đông', '2019-09-09'),
('HK093', 'Số 10, Ngõ 4, Phố Lương Văn Can, Phường Vạn Phúc, Quận Hà Đông', '2023-08-18'),
('HK094', 'Số 72, Phố Nhuệ Giang, Phường Yết Kiêu, Quận Hà Đông', '2018-10-29'),
('HK095', 'P2007, Chung cư FLC Star Tower, Phường Vạn Phúc, Quận Hà Đông', '2022-03-06'),
('HK096', 'Số 22, Đường Nguyễn Thượng Hiền, Phường Yết Kiêu, Quận Hà Đông', '2020-07-20'),
('HK097', 'Số 36, Phố Phùng Hưng, Phường Phúc La, Quận Hà Đông', '2023-12-12'),
('HK098', 'P1709, Tòa B, Chung cư Victoria Văn Phú, Phường Phú La, Quận Hà Đông', '2019-02-14'),
('HK099', 'Số 6, Ngõ 5, Đường Tố Hữu, Phường Vạn Phúc, Quận Hà Đông', '2023-06-26'),
('HK100', 'Số 602, Đường Ngô Thì Nhậm, Phường La Khê, Quận Hà Đông', '2021-03-03');


-- =================================================================
-- DỮ LIỆU NHÂN KHẨU
-- =================================================================

-- Nhân khẩu cho Hộ khẩu 1 (id=1)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Nguyễn Văn An', 'Tí', '1980-05-20', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Kỹ sư phần mềm', 'Công ty FPT Software', '012345678901', '2021-07-15', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Chủ hộ', 1),
('Trần Thị Bích', NULL, '1982-10-15', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Giáo viên', 'Trường THCS La Khê', '012345678902', '2021-08-20', 'Cục CSQLHC về TTXH', '2020-01-10', 'Số 10, Thanh Xuân, Hà Nội', 'Vợ', 1),
('Nguyễn Hoàng Minh', 'Bin', '2010-09-01', 'Nam', 'Bệnh viện Hà Đông, Hà Nội', 'Nam Định', 'Kinh', 'Học sinh', 'Trường Tiểu học La Khê', NULL, NULL, NULL, '2010-09-10', 'Mới sinh', 'Con trai', 1),
('Nguyễn Thu Trang', 'Bống', '2015-04-12', 'Nữ', 'Bệnh viện Hà Đông, Hà Nội', 'Hải Phòng', 'Kinh', 'Học sinh', 'Trường Mầm non La Khê', NULL, NULL, NULL, '2015-04-20', 'Mới sinh', 'Con gái', 1);

-- Nhân khẩu cho Hộ khẩu 2 (id=2)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Lê Thị Dung', NULL, '1970-02-11', 'Nữ', 'Hà Tây', 'Hà Tây', 'Kinh', 'Nội trợ', 'Tại nhà', '111222333444', '2022-01-05', 'Công an TP Hà Nội', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Chủ hộ', 2),
('Vũ Minh Đức', NULL, '1968-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Bộ đội về hưu', 'Tại nhà', '111222333555', '2021-12-25', 'Cục CSQLHC về TTXH', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Chồng', 2),
('Vũ Thị Hà', NULL, '1995-06-30', 'Nữ', 'Bệnh viện 103, Hà Nội', 'Hà Tây', 'Kinh', 'Nhân viên ngân hàng', 'Ngân hàng Vietcombank', '111222333666', '2020-10-10', 'Cục CSQLHC về TTXH', '2018-07-22', 'Ba La, Hà Đông, Hà Nội', 'Con gái', 2);

-- Nhân khẩu cho Hộ khẩu 3 (id=3)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Trần Văn Cường', NULL, '1990-01-01', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nhân viên văn phòng', 'Công ty ABC', '999888777666', '2023-02-14', 'Cục CSQLHC về TTXH', '2022-03-01', 'Thanh Hóa', 'Chủ hộ', 3),
('Lê Minh Tuấn', NULL, '1988-06-20', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Lập trình viên', 'Công ty XYZ', '999888777555', '2023-01-10', 'Cục CSQLHC về TTXH', '2023-05-15', 'Cầu Giấy, Hà Nội', 'Em trai', 3),
('Trần Thị Thảo', NULL, '1965-08-09', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nội trợ', 'Tại nhà', '999888777444', '2022-01-01', 'Công an tỉnh Thanh Hóa', '2022-03-01', 'Thanh Hóa', 'Mẹ', 3),
('Trần Văn Mạnh', NULL, '2018-09-15', 'Nam', 'Bệnh viện Phụ sản Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường mầm non Mộ Lao', NULL, NULL, NULL, '2022-03-01', 'Mới sinh', 'Cháu', 3),
('Lê Thị Vy', NULL, '1992-03-08', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Thiết kế đồ họa', 'Công ty Ad-micro', '999888777333', '2024-01-01', 'Cục CSQLHC về TTXH', '2024-02-01', 'Cầu Giấy, Hà Nội', 'Em dâu', 3);

-- Nhân khẩu cho Hộ khẩu 4 (id=4)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Phạm Thị Mai', NULL, '1985-03-12', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Công nhân', 'Nhà máy ABC', '123456789012', '2022-05-10', 'Cục CSQLHC về TTXH', '2023-06-15', 'Cầu Giấy, Hà Nội', 'Chủ hộ', 4),
('Nguyễn Văn Hùng', NULL, '1983-08-25', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Tài xế', 'Công ty Giao hàng nhanh', '123456789013', '2022-06-15', 'Cục CSQLHC về TTXH', '2023-06-15', 'Hải Dương', 'Chồng', 4);

-- Nhân khẩu cho Hộ khẩu 5 (id=5)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Lê Văn Đức', NULL, '1960-11-18', 'Nam', 'Nam Định', 'Nam Định', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '123456789015', '2024-02-01', 'Cục CSQLHC về TTXH', '2024-01-20', 'Nam Định', 'Chủ hộ', 5),
('Đỗ Thị Hoa', NULL, '1965-04-22', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '123456789016', '2024-02-15', 'Cục CSQLHC về TTXH', '2024-01-20', 'Thái Bình', 'Vợ', 5),
('Lê Anh Dũng', NULL, '1990-07-07', 'Nam', 'Nam Định', 'Nam Định', 'Kinh', 'Bác sĩ', 'Bệnh viện 103', '123456789017', '2015-01-01', 'Công an tỉnh Nam Định', '2024-01-20', 'Nam Định', 'Con trai', 5),
('Lê Thị Lan', NULL, '1992-09-09', 'Nữ', 'Nam Định', 'Nam Định', 'Kinh', 'Dược sĩ', 'Bệnh viện 103', '123456789018', '2016-02-02', 'Công an tỉnh Nam Định', '2024-01-20', 'Nam Định', 'Con gái', 5);

-- Nhân khẩu cho Hộ khẩu 6 (id=6)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Hoàng Kim Thông', NULL, '1978-12-01', 'Nam', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Giảng viên', 'Học viện Bưu chính Viễn thông', '223344556677', '2020-01-01', 'Cục CSQLHC về TTXH', '2019-05-11', 'Mỹ Đình, Hà Nội', 'Chủ hộ', 6),
('Nguyễn Thị Hà', NULL, '1980-03-15', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kế toán', 'Công ty Manulife', '223344556688', '2020-01-01', 'Cục CSQLHC về TTXH', '2019-05-11', 'Mỹ Đình, Hà Nội', 'Vợ', 6),
('Hoàng Gia Huy', NULL, '2008-10-20', 'Nam', 'Bệnh viện Bưu Điện', 'Hưng Yên', 'Kinh', 'Học sinh', 'Trường THCS Mỗ Lao', NULL, NULL, NULL, '2019-05-11', 'Mỹ Đình, Hà Nội', 'Con trai', 6);

-- Nhân khẩu cho Hộ khẩu 7 (id=7)                   
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Đỗ Thị Hoa', NULL, '1955-01-10', 'Nữ', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '334455667788', '2015-06-06', 'Công an tỉnh Phú Thọ', '2017-02-28', 'Phú Thọ', 'Chủ hộ', 7),
('Nguyễn Văn Bình', NULL, '1975-05-05', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Thợ xây', 'Tự do', '334455667799', '2018-07-07', 'Cục CSQLHC về TTXH', '2017-02-28', 'Phú Thọ', 'Con trai', 7),
('Trần Thị Lan', NULL, '1978-08-08', 'Nữ', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Công nhân may', 'Xí nghiệp may Vạn Phúc', '334455667700', '2019-09-09', 'Cục CSQLHC về TTXH', '2017-02-28', 'Vĩnh Phúc', 'Con dâu', 7),
('Nguyễn Bảo Ngọc', NULL, '2005-12-12', 'Nữ', 'Bệnh viện Hà Đông', 'Phú Thọ', 'Kinh', 'Sinh viên', 'Đại học Hà Nội', '334455667711', '2021-10-10', 'Cục CSQLHC về TTXH', '2017-02-28', 'Phú Thọ', 'Cháu gái', 7),
('Nguyễn Tiến Dũng', NULL, '2010-02-20', 'Nam', 'Bệnh viện Hà Đông', 'Phú Thọ', 'Kinh', 'Học sinh', 'Trường Tiểu học Vạn Phúc', NULL, NULL, NULL, '2017-02-28', 'Phú Thọ', 'Cháu trai', 7);

-- Nhân khẩu cho Hộ khẩu 8 (id=8)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Bùi Văn Nam', NULL, '1988-04-15', 'Nam', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Kiến trúc sư', 'Văn phòng kiến trúc X', '445566778899', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-11-15', 'Chương Mỹ, Hà Nội', 'Chủ hộ', 8),
('Hà Thị Linh', NULL, '1991-09-20', 'Nữ', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Giáo viên mầm non', 'Trường mầm non Phú La', '445566778800', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-11-15', 'Chương Mỹ, Hà Nội', 'Vợ', 8),
('Bùi Gia Hân', NULL, '2017-07-07', 'Nữ', 'Bệnh viện Hà Đông', 'Hòa Bình', 'Mường', 'Học sinh', 'Trường mầm non Phú La', NULL, NULL, NULL, '2021-11-15', 'Chương Mỹ, Hà Nội', 'Con gái', 8),
('Bùi Quang Khải', NULL, '2022-03-03', 'Nam', 'Bệnh viện Hà Đông', 'Hòa Bình', 'Mường', 'Ở nhà', 'Tại nhà', NULL, NULL, NULL, '2022-03-10', 'Mới sinh', 'Con trai', 8);

-- Nhân khẩu cho Hộ khẩu 9 (id=9)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Phan Văn Giang', NULL, '1985-02-10', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh tự do', 'Tại nhà', '556677889901', '2020-05-05', 'Cục CSQLHC về TTXH', '2015-08-20', 'Cầu Giấy, Hà Nội', 'Chủ hộ', 9),
('Nguyễn Thị Lan Anh', NULL, '1988-07-25', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nhân viên bán hàng', 'Siêu thị BigC Hà Đông', '556677889902', '2020-05-05', 'Cục CSQLHC về TTXH', '2015-08-20', 'Cầu Giấy, Hà Nội', 'Vợ', 9),
('Phan Hoàng Nam', NULL, '2011-01-15', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THCS Mỗ Lao', NULL, NULL, NULL, '2015-08-20', 'Cầu Giấy, Hà Nội', 'Con trai', 9),
('Phan Thùy Chi', NULL, '2016-06-20', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường Tiểu học Mỗ Lao', NULL, NULL, NULL, '2016-06-28', 'Mới sinh', 'Con gái', 9);

-- Nhân khẩu cho Hộ khẩu 10 (id=10)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Vũ Đình Trọng', NULL, '1955-11-30', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '556677889911', '2018-02-10', 'Công an tỉnh Thái Bình', '2023-01-05', 'Thái Bình', 'Chủ hộ', 10),
('Vũ Mạnh Hùng', NULL, '1982-04-12', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Lái xe taxi', 'Tự do', '556677889912', '2020-09-15', 'Cục CSQLHC về TTXH', '2023-01-05', 'Thái Bình', 'Con trai', 10),
('Vũ Gia Bảo', NULL, '2020-08-08', 'Nam', 'Hà Nội', 'Thái Bình', 'Kinh', 'Ở nhà', 'Tại nhà', NULL, NULL, NULL, '2023-01-05', 'Thái Bình', 'Cháu trai', 10);

-- Nhân khẩu cho Hộ khẩu 11 (id=11)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Trần Thị Thu', NULL, '1965-09-14', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Buôn bán nhỏ', 'Chợ Hà Đông', '667788990011', '2015-01-01', 'Công an tỉnh Nghệ An', '2016-02-18', 'Nghệ An', 'Chủ hộ', 11),
('Nguyễn Văn Sáng', NULL, '1995-03-03', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Sinh viên', 'Đại học Kiến trúc', '667788990012', '2021-05-20', 'Cục CSQLHC về TTXH', '2022-09-01', 'Nghệ An', 'Cháu', 11);

-- Nhân khẩu cho Hộ khẩu 12 (id=12)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Nguyễn Quốc Tuấn', NULL, '1979-08-08', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Công chức', 'UBND Phường Nguyễn Trãi', '778899001122', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-10', 'Phường Yết Kiêu, Hà Đông', 'Chủ hộ', 12),
('Lê Thị Thủy', NULL, '1981-12-12', 'Nữ', 'Hà Nam', 'Hà Nam', 'Kinh', 'Giáo viên', 'Trường THPT Nguyễn Huệ', '778899001123', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-10', 'Phường Yết Kiêu, Hà Đông', 'Vợ', 12),
('Nguyễn Lê Minh Anh', NULL, '2007-05-25', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THPT Nguyễn Huệ', '778899001124', '2022-06-01', 'Cục CSQLHC về TTXH', '2019-09-10', 'Phường Yết Kiêu, Hà Đông', 'Con gái', 12),
('Nguyễn Quốc An', NULL, '2014-02-17', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường Tiểu học Nguyễn Trãi', NULL, NULL, NULL, '2019-09-10', 'Phường Yết Kiêu, Hà Đông', 'Con trai', 12);

-- Nhân khẩu cho Hộ khẩu 13 (id=13)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Hoàng Thị Yến', NULL, '1962-04-01', 'Nữ', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '889900112233', '2010-10-10', 'Công an tỉnh Vĩnh Phúc', '2014-12-25', 'Vĩnh Phúc', 'Chủ hộ', 13),
('Trần Quang Huy', NULL, '1985-11-05', 'Nam', 'Vĩnh Phúc', 'Vĩnh Phúc', 'Kinh', 'Bộ đội', 'Lữ đoàn 201', '889900112234', '2020-01-01', 'Cục CSQLHC về TTXH', '2014-12-25', 'Vĩnh Phúc', 'Con trai', 13),
('Trần Thị Mai', NULL, '2018-10-30', 'Nữ', 'Hà Nội', 'Vĩnh Phúc', 'Kinh', 'Học sinh', 'Trường mầm non Hoa Sen', NULL, NULL, NULL, '2018-11-10', 'Mới sinh', 'Cháu gái', 13);

-- Nhân khẩu cho Hộ khẩu 14 (id=14)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Đặng Văn Hùng', NULL, '1975-03-20', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Thợ mộc', 'Xưởng gỗ Phú Lãm', '990011223344', '2018-08-08', 'Cục CSQLHC về TTXH', '2020-07-30', 'Phú Thọ', 'Chủ hộ', 14),
('Ngô Thị Xoan', NULL, '1978-06-15', 'Nữ', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Nội trợ', 'Tại nhà', '990011223345', '2018-08-08', 'Cục CSQLHC về TTXH', '2020-07-30', 'Phú Thọ', 'Vợ', 14),
('Đặng Văn Mạnh', NULL, '2003-09-01', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Kinh', 'Sinh viên', 'Đại học Phenikaa', '990011223346', '2020-09-10', 'Cục CSQLHC về TTXH', '2021-09-05', 'Phú Thọ', 'Con trai', 14),
('Đặng Thị Quỳnh', NULL, '2006-07-19', 'Nữ', 'Hà Nội', 'Phú Thọ', 'Kinh', 'Học sinh', 'Trường THPT Trần Hưng Đạo', '990011223347', '2022-08-01', 'Cục CSQLHC về TTXH', '2020-07-30', 'Phú Thọ', 'Con gái', 14),
('Đặng Văn An', NULL, '2012-11-11', 'Nam', 'Hà Nội', 'Phú Thọ', 'Kinh', 'Học sinh', 'Trường THCS Phú Lãm', NULL, NULL, NULL, '2020-07-30', 'Phú Thọ', 'Con trai', 14);

-- Nhân khẩu cho Hộ khẩu 15 (id=15)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Mai Thị Loan', NULL, '1998-01-25', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Chuyên viên marketing', 'Công ty VCCorp', '112233445566', '2023-10-10', 'Cục CSQLHC về TTXH', '2023-11-01', 'Quận Thanh Xuân, Hà Nội', 'Chủ hộ', 15);

-- Nhân khẩu cho Hộ khẩu 16 (id=16)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Trịnh Văn Quyết', NULL, '1982-05-18', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Kiến trúc sư', 'Tập đoàn FLC', '223344556678', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-04-14', 'Thanh Hóa', 'Chủ hộ', 16),
('Lê Thị Ngọc', NULL, '1985-08-28', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nhân viên văn phòng', 'Tập đoàn FLC', '223344556679', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-04-14', 'Thanh Hóa', 'Vợ', 16),
('Trịnh Lê Anh', NULL, '2010-10-10', 'Nam', 'Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường Quốc tế Nhật Bản', NULL, NULL, NULL, '2018-04-14', 'Thanh Hóa', 'Con trai', 16),
('Trịnh Ngọc Mai', NULL, '2015-12-15', 'Nữ', 'Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường Quốc tế Nhật Bản', NULL, NULL, NULL, '2018-04-14', 'Thanh Hóa', 'Con gái', 16);

-- Nhân khẩu cho Hộ khẩu 17 (id=17)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Phạm Minh Chính', NULL, '1970-07-07', 'Nam', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Giám đốc', 'Công ty TNHH An Phát', '334455667789', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-08-19', 'Hải Phòng', 'Chủ hộ', 17),
('Vũ Thị Kim Anh', NULL, '1972-02-12', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Phó giám đốc', 'Công ty TNHH An Phát', '334455667790', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-08-19', 'Hải Phòng', 'Vợ', 17),
('Phạm Quang Huy', NULL, '2000-11-20', 'Nam', 'Hà Nội', 'Hải Phòng', 'Kinh', 'Lập trình viên', 'Viettel', '334455667791', '2018-01-01', 'Cục CSQLHC về TTXH', '2022-08-19', 'Hải Phòng', 'Con trai', 17);

-- Nhân khẩu cho Hộ khẩu 18 (id=18)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Nguyễn Thị Kim Ngân', NULL, '1958-03-08', 'Nữ', 'Bến Tre', 'Bến Tre', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '445566778890', '2015-01-01', 'Công an tỉnh Bến Tre', '2017-10-03', 'Bến Tre', 'Chủ hộ', 18),
('Lê Văn Tám', NULL, '1955-01-01', 'Nam', 'Bến Tre', 'Bến Tre', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '445566778891', '2015-01-01', 'Công an tỉnh Bến Tre', '2017-10-03', 'Bến Tre', 'Chồng', 18),
('Lê Thị Hồng', NULL, '1980-09-09', 'Nữ', 'Bến Tre', 'Bến Tre', 'Kinh', 'Nội trợ', 'Tại nhà', '445566778892', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-10-03', 'Bến Tre', 'Con gái', 18),
('Lê Minh Triết', NULL, '2005-05-05', 'Nam', 'Hà Nội', 'Bến Tre', 'Kinh', 'Sinh viên', 'Đại học Bách Khoa Hà Nội', '445566778893', '2021-06-01', 'Cục CSQLHC về TTXH', '2023-09-05', 'Bến Tre', 'Cháu trai', 18);

-- Nhân khẩu cho Hộ khẩu 19 (id=19)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Vương Đình Huệ', NULL, '1980-10-10', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Chủ tịch HĐQT', 'Tập đoàn T&T', '556677889988', '2024-02-01', 'Cục CSQLHC về TTXH', '2024-03-01', 'TP. Vinh, Nghệ An', 'Chủ hộ', 19),
('Nguyễn Thị Minh', NULL, '1982-11-11', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Luật sư', 'Văn phòng luật sư ABC', '556677889989', '2024-02-01', 'Cục CSQLHC về TTXH', '2024-03-01', 'TP. Vinh, Nghệ An', 'Vợ', 19);

-- Nhân khẩu cho Hộ khẩu 20 (id=20)
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
('Tô Lâm', NULL, '1960-01-01', 'Nam', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '667788990099', '2015-01-01', 'Công an tỉnh Hưng Yên', '2015-06-09', 'Hưng Yên', 'Chủ hộ', 20),
('Nguyễn Thị Hiền', NULL, '1962-02-02', 'Nữ', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Nghỉ hưu', 'Tại nhà', '667788990098', '2015-01-01', 'Công an tỉnh Hưng Yên', '2015-06-09', 'Hưng Yên', 'Vợ', 20),
('Tô Dũng', NULL, '1985-05-05', 'Nam', 'Hưng Yên', 'Hưng Yên', 'Kinh', 'Công an', 'Công an Quận Hà Đông', '667788990097', '2020-01-01', 'Cục CSQLHC về TTXH', '2015-06-09', 'Hưng Yên', 'Con trai', 20),
('Hoàng Bích Ngọc', NULL, '1987-07-07', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Bác sĩ', 'Bệnh viện Đa khoa Hà Đông', '667788990096', '2020-01-01', 'Cục CSQLHC về TTXH', '2015-06-09', 'Hưng Yên', 'Con dâu', 20),
('Tô Hoàng An', NULL, '2016-09-09', 'Nữ', 'Hà Nội', 'Hưng Yên', 'Kinh', 'Học sinh', 'Trường tiểu học Đoàn Kết', NULL, NULL, NULL, '2016-09-16', 'Mới sinh', 'Cháu gái', 20);

-- Nhân khẩu cho Hộ khẩu 21-50
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
-- HK 21 (3 người)
('Trần Văn Bình', NULL, '1990-01-15', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Lao động tự do', '', '121212121212', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-10-10', 'Hà Tĩnh', 'Chủ hộ', 21),
('Nguyễn Thị Oanh', NULL, '1992-03-20', 'Nữ', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Công nhân', 'Khu công nghiệp Hà Đông', '121212121213', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-10-10', 'Hà Tĩnh', 'Vợ', 21),
('Trần Gia Hân', NULL, '2018-05-25', 'Nữ', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Học sinh', 'Trường Mầm non Phú La', NULL, NULL, NULL, '2022-10-10', 'Hà Tĩnh', 'Con gái', 21),
-- HK 22 (4 người)
('Lê Quang Thắng', NULL, '1980-08-10', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Bác sĩ', 'Bệnh viện 103', '131313131313', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-03-15', 'Quận Đống Đa, Hà Nội', 'Chủ hộ', 22),
('Phạm Thị Thu Hà', NULL, '1982-11-12', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Dược sĩ', 'Bệnh viện 103', '131313131314', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-03-15', 'Quận Đống Đa, Hà Nội', 'Vợ', 22),
('Lê Minh Quân', NULL, '2008-02-20', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THCS Phúc La', NULL, NULL, NULL, '2019-03-15', 'Quận Đống Đa, Hà Nội', 'Con trai', 22),
('Lê Thảo Nguyên', NULL, '2013-09-30', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường Tiểu học Xa La', NULL, NULL, NULL, '2019-03-15', 'Quận Đống Đa, Hà Nội', 'Con gái', 22),
-- HK 23 (2 người)
('Hoàng Văn Thái', NULL, '1960-05-05', 'Nam', 'Thái Nguyên', 'Thái Nguyên', 'Kinh', 'Nghỉ hưu', '', '141414141414', '2015-01-01', 'Công an tỉnh Thái Nguyên', '2017-07-21', 'Thái Nguyên', 'Chủ hộ', 23),
('Ngô Thị Lan', NULL, '1963-07-07', 'Nữ', 'Thái Nguyên', 'Thái Nguyên', 'Kinh', 'Nghỉ hưu', '', '141414141415', '2015-01-01', 'Công an tỉnh Thái Nguyên', '2017-07-21', 'Thái Nguyên', 'Vợ', 23),
-- HK 24 (1 người)
('Nguyễn Duy Mạnh', NULL, '1996-10-29', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'CLB Hà Nội', '151515151515', '2022-12-12', 'Cục CSQLHC về TTXH', '2023-01-11', 'Quận Cầu Giấy, Hà Nội', 'Chủ hộ', 24),
-- HK 25 (5 người)
('Đỗ Hùng Dũng', NULL, '1993-09-08', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'CLB Hà Nội', '161616161616', '2018-10-10', 'Cục CSQLHC về TTXH', '2018-11-30', 'Quận Gia Lâm, Hà Nội', 'Chủ hộ', 25),
('Triệu Mộc Trinh', NULL, '1995-01-01', 'Nữ', 'Tuyên Quang', 'Tuyên Quang', 'Tày', 'Kinh doanh online', '', '161616161617', '2018-10-10', 'Cục CSQLHC về TTXH', '2018-11-30', 'Quận Gia Lâm, Hà Nội', 'Vợ', 25),
('Đỗ Gia Bảo', 'Titi', '2019-10-22', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2019-11-01', 'Mới sinh', 'Con trai', 25),
('Đỗ Hùng Mạnh', NULL, '1965-02-03', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nghỉ hưu', '', '161616161618', '2015-01-01', 'Công an TP Hà Nội', '2018-11-30', 'Quận Gia Lâm, Hà Nội', 'Bố', 25),
('Nguyễn Thị Lan', NULL, '1968-04-05', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nội trợ', '', '161616161619', '2015-01-01', 'Công an TP Hà Nội', '2018-11-30', 'Quận Gia Lâm, Hà Nội', 'Mẹ', 25),
-- HK 26 (4 người)
('Phạm Nhật Vượng', NULL, '1968-08-05', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Chủ tịch tập đoàn', 'Vingroup', '171717171717', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-05-05', 'Quận Ba Đình, Hà Nội', 'Chủ hộ', 26),
('Phạm Thu Hương', NULL, '1969-06-14', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Phó chủ tịch tập đoàn', 'Vingroup', '171717171718', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-05-05', 'Quận Ba Đình, Hà Nội', 'Vợ', 26),
('Phạm Nhật Quân', NULL, '1995-01-01', 'Nam', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Doanh nhân', 'Vinfast', '171717171719', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-05-05', 'Quận Ba Đình, Hà Nội', 'Con trai', 26),
('Phạm Nhật Minh', NULL, '2000-02-02', 'Nam', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Du học sinh', 'Mỹ', '171717171720', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-05-05', 'Quận Ba Đình, Hà Nội', 'Con trai', 26),
-- HK 27 (3 người)
('Bùi Xuân Huấn', 'Huấn Hoa Hồng', '1985-01-01', 'Nam', 'Yên Bái', 'Yên Bái', 'Kinh', 'Kinh doanh online', '', '181818181818', '2016-01-01', 'Công an tỉnh Yên Bái', '2016-09-01', 'Yên Bái', 'Chủ hộ', 27),
('Phạm Thị Ngọc Linh', NULL, '1995-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh online', '', '181818181819', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-09-01', 'Yên Bái', 'Vợ', 27),
('Bùi Xuân Tùng', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Yên Bái', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 27),
-- HK 28 (4 người)
('Ngô Bảo Châu', NULL, '1972-06-28', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Giáo sư toán học', 'Đại học Chicago', '191919191919', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-04-12', 'Mỹ', 'Chủ hộ', 28),
('Nguyễn Bảo Thanh', NULL, '1973-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nội trợ', '', '191919191920', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-04-12', 'Mỹ', 'Vợ', 28),
('Ngô Thanh Lam', NULL, '2000-01-01', 'Nữ', 'Mỹ', 'Hà Nội', 'Kinh', 'Sinh viên', 'Đại học Yale', '191919191921', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-04-12', 'Mỹ', 'Con gái', 28),
('Ngô Hiền Trí', NULL, '2005-01-01', 'Nam', 'Mỹ', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường phổ thông', '191919191922', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-04-12', 'Mỹ', 'Con trai', 28),
-- HK 29 (2 người)
('Lý Quí Khánh', NULL, '1990-01-01', 'Nam', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Nhà thiết kế thời trang', '', '202020202020', '2014-01-01', 'Công an TP.HCM', '2014-08-22', 'TP. Hồ Chí Minh', 'Chủ hộ', 29),
('Hồ Ngọc Hà', NULL, '1984-11-25', 'Nữ', 'Quảng Bình', 'Quảng Bình', 'Kinh', 'Ca sĩ', '', '202020202021', '2014-01-01', 'Công an TP.HCM', '2014-08-22', 'TP. Hồ Chí Minh', 'Bạn', 29),
-- HK 30 (3 người)
('Nguyễn Tử Quảng', NULL, '1975-06-11', 'Nam', 'Ninh Bình', 'Ninh Bình', 'Kinh', 'CEO', 'BKAV', '212121212121', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-07', 'Quận Cầu Giấy, Hà Nội', 'Chủ hộ', 30),
('Lê Thị Thu', NULL, '1978-01-01', 'Nữ', 'Ninh Bình', 'Ninh Bình', 'Kinh', 'Nội trợ', '', '212121212122', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-07', 'Quận Cầu Giấy, Hà Nội', 'Vợ', 30),
('Nguyễn Lê Quân', NULL, '2005-01-01', 'Nam', 'Hà Nội', 'Ninh Bình', 'Kinh', 'Học sinh', 'Trường THPT chuyên KHTN', '212121212123', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-07', 'Quận Cầu Giấy, Hà Nội', 'Con trai', 30),
-- HK 31 (4 người)
('Lê Hồng Minh', NULL, '1977-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Chủ tịch', 'VNG', '222222222222', '2010-01-01', 'Công an TP Hà Nội', '2011-01-15', 'Quận 1, TP.HCM', 'Chủ hộ', 31),
('Võ Thị Kim Phượng', NULL, '1980-01-01', 'Nữ', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Nội trợ', '', '222222222223', '2010-01-01', 'Công an TP Hà Nội', '2011-01-15', 'Quận 1, TP.HCM', 'Vợ', 31),
('Lê Minh Anh', NULL, '2005-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường quốc tế', '222222222224', '2020-01-01', 'Cục CSQLHC về TTXH', '2011-01-15', 'Quận 1, TP.HCM', 'Con gái', 31),
('Lê Quang Vinh', NULL, '2010-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường quốc tế', NULL, NULL, NULL, '2011-01-15', 'Quận 1, TP.HCM', 'Con trai', 31),
-- HK 32 (2 người)
('Trương Gia Bình', NULL, '1956-05-19', 'Nam', 'Đà Nẵng', 'Đà Nẵng', 'Kinh', 'Chủ tịch HĐQT', 'FPT', '232323232323', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-12-01', 'Quận Cầu Giấy, Hà Nội', 'Chủ hộ', 32),
('Nguyễn Thị Phương Thảo', NULL, '1970-06-07', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'CEO', 'Vietjet Air', '232323232324', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-12-01', 'Quận Cầu Giấy, Hà Nội', 'Vợ', 32),
-- HK 33 (3 người)
('Nguyễn Đăng Quang', NULL, '1963-08-23', 'Nam', 'Quảng Trị', 'Quảng Trị', 'Kinh', 'Chủ tịch', 'Masan Group', '242424242424', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-02-20', 'Quận 3, TP.HCM', 'Chủ hộ', 33),
('Nguyễn Hoàng Yến', NULL, '1965-01-01', 'Nữ', 'Quảng Trị', 'Quảng Trị', 'Kinh', 'Phó TGĐ', 'Masan Group', '242424242425', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-02-20', 'Quận 3, TP.HCM', 'Vợ', 33),
('Nguyễn Đăng Minh', NULL, '1995-01-01', 'Nam', 'TP. Hồ Chí Minh', 'Quảng Trị', 'Kinh', 'Giám đốc', 'Masan Consumer', '242424242426', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-02-20', 'Quận 3, TP.HCM', 'Con trai', 33),
-- HK 34 (5 người)
('Hồ Hùng Anh', NULL, '1970-06-08', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Chủ tịch', 'Techcombank', '252525252525', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-18', 'Quận Hoàn Kiếm, Hà Nội', 'Chủ hộ', 34),
('Nguyễn Thị Thanh Thủy', NULL, '1972-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nội trợ', '', '252525252526', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-18', 'Quận Hoàn Kiếm, Hà Nội', 'Vợ', 34),
('Hồ Anh Minh', NULL, '1995-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Phó giám đốc', 'Techcombank Securities', '252525252527', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-18', 'Quận Hoàn Kiếm, Hà Nội', 'Con trai', 34),
('Hồ Thủy Anh', NULL, '1998-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Chuyên viên phân tích', 'Techcombank', '252525252528', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-18', 'Quận Hoàn Kiếm, Hà Nội', 'Con gái', 34),
('Hồ An Huy', NULL, '2005-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường THPT Amsterdam', '252525252529', '2021-01-01', 'Cục CSQLHC về TTXH', '2018-10-18', 'Quận Hoàn Kiếm, Hà Nội', 'Con trai', 34),
-- HK 35 (3 người)
('Trần Đình Long', NULL, '1961-02-22', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Chủ tịch', 'Hòa Phát Group', '262626262626', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-03-25', 'Quận Hai Bà Trưng, Hà Nội', 'Chủ hộ', 35),
('Vũ Thị Hiền', NULL, '1963-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nội trợ', '', '262626262627', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-03-25', 'Quận Hai Bà Trưng, Hà Nội', 'Vợ', 35),
('Trần Vũ Minh', NULL, '1996-01-01', 'Nam', 'Hà Nội', 'Hải Dương', 'Kinh', 'Giám đốc', 'Hòa Phát Group', '262626262628', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-03-25', 'Quận Hai Bà Trưng, Hà Nội', 'Con trai', 35),
-- HK 36 (4 người)
('Thái Hương', NULL, '1958-10-12', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Chủ tịch', 'TH Group', '272727272727', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-05-19', 'Nghệ An', 'Chủ hộ', 36),
('Lê Văn Chi', NULL, '1955-01-01', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Nghỉ hưu', '', '272727272728', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-05-19', 'Nghệ An', 'Chồng', 36),
('Lê Thị Minh', NULL, '1980-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Giám đốc', 'TH Milk', '272727272729', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-05-19', 'Nghệ An', 'Con gái', 36),
('Lê Anh Tuấn', NULL, '1982-01-01', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Phó giám đốc', 'TH Milk', '272727272730', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-05-19', 'Nghệ An', 'Con trai', 36),
-- HK 37 (2 người)
('Trần Bá Dương', NULL, '1960-04-01', 'Nam', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Chủ tịch', 'Thaco Group', '282828282828', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-08-01', 'Quận 2, TP.HCM', 'Chủ hộ', 37),
('Viên Diệu Hoa', NULL, '1962-01-01', 'Nữ', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Nội trợ', '', '282828282829', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-08-01', 'Quận 2, TP.HCM', 'Vợ', 37),
-- HK 38 (3 người)
('Đỗ Anh Tuấn', NULL, '1975-01-01', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Chủ tịch', 'Sunshine Group', '292929292929', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-11-11', 'Thanh Hóa', 'Chủ hộ', 38),
('Lê Thị Hà', NULL, '1978-01-01', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nội trợ', '', '292929292930', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-11-11', 'Thanh Hóa', 'Vợ', 38),
('Đỗ Minh Nhật', NULL, '2005-01-01', 'Nam', 'Hà Nội', 'Thanh Hóa', 'Kinh', 'Học sinh', 'Trường quốc tế', '292929292931', '2021-01-01', 'Cục CSQLHC về TTXH', '2016-11-11', 'Thanh Hóa', 'Con trai', 38),
-- HK 39 (4 người)
('Nguyễn Thị Phương', NULL, '1988-01-01', 'Nữ', 'Bắc Ninh', 'Bắc Ninh', 'Kinh', 'Giáo viên', 'Trường THCS Yết Kiêu', '303030303030', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-07-07', 'Bắc Ninh', 'Chủ hộ', 39),
('Trần Văn Nam', NULL, '1986-01-01', 'Nam', 'Bắc Ninh', 'Bắc Ninh', 'Kinh', 'Kỹ sư xây dựng', 'Vinaconex', '303030303031', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-07-07', 'Bắc Ninh', 'Chồng', 39),
('Trần Thị Bảo Châu', NULL, '2015-01-01', 'Nữ', 'Hà Nội', 'Bắc Ninh', 'Kinh', 'Học sinh', 'Trường Tiểu học Yết Kiêu', NULL, NULL, NULL, '2021-07-07', 'Bắc Ninh', 'Con gái', 39),
('Trần Minh Hoàng', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Bắc Ninh', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2021-07-07', 'Bắc Ninh', 'Con trai', 39),
-- HK 40 (3 người)
('Lê Viết Hải', NULL, '1958-01-01', 'Nam', 'Thừa Thiên Huế', 'Thừa Thiên Huế', 'Kinh', 'Chủ tịch', 'Hòa Bình Group', '313131313131', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-04-04', 'TP. Huế', 'Chủ hộ', 40),
('Nguyễn Thị Sen', NULL, '1960-01-01', 'Nữ', 'Thừa Thiên Huế', 'Thừa Thiên Huế', 'Kinh', 'Nội trợ', '', '313131313132', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-04-04', 'TP. Huế', 'Vợ', 40),
('Lê Viết Hiếu', NULL, '1992-01-01', 'Nam', 'TP. Hồ Chí Minh', 'Thừa Thiên Huế', 'Kinh', 'CEO', 'Hòa Bình Group', '313131313133', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-04-04', 'TP. Huế', 'Con trai', 40),
-- HK 41 (2 người)
('Bùi Thành Nhơn', NULL, '1958-01-01', 'Nam', 'Đồng Tháp', 'Đồng Tháp', 'Kinh', 'Chủ tịch', 'Novaland', '323232323232', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-12-12', 'Quận 1, TP.HCM', 'Chủ hộ', 41),
('Cao Thị Ngọc Sương', NULL, '1960-01-01', 'Nữ', 'Đồng Tháp', 'Đồng Tháp', 'Kinh', 'Nội trợ', '', '323232323233', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-12-12', 'Quận 1, TP.HCM', 'Vợ', 41),
-- HK 42 (4 người)
('Nguyễn Văn Đạt', NULL, '1970-01-01', 'Nam', 'Bình Định', 'Bình Định', 'Kinh', 'Chủ tịch', 'Phát Đạt Corp', '333333333333', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-02-14', 'TP. Quy Nhơn', 'Chủ hộ', 42),
('Trần Thị Cẩm', NULL, '1972-01-01', 'Nữ', 'Bình Định', 'Bình Định', 'Kinh', 'Nội trợ', '', '333333333334', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-02-14', 'TP. Quy Nhơn', 'Vợ', 42),
('Nguyễn Tấn Danh', NULL, '1995-01-01', 'Nam', 'TP. Hồ Chí Minh', 'Bình Định', 'Kinh', 'Giám đốc', 'Phát Đạt Corp', '333333333335', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-02-14', 'TP. Quy Nhơn', 'Con trai', 42),
('Nguyễn Thị Mai', NULL, '2000-01-01', 'Nữ', 'TP. Hồ Chí Minh', 'Bình Định', 'Kinh', 'Sinh viên', 'Đại học RMIT', '333333333336', '2018-01-01', 'Cục CSQLHC về TTXH', '2015-02-14', 'TP. Quy Nhơn', 'Con gái', 42),
-- HK 43 (1 người)
('Đặng Lê Nguyên Vũ', NULL, '1971-02-10', 'Nam', 'Khánh Hòa', 'Khánh Hòa', 'Kinh', 'Chủ tịch', 'Trung Nguyên Legend', '343434343434', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-10-02', 'TP. Buôn Ma Thuột', 'Chủ hộ', 43),
-- HK 44 (3 người)
('Nguyễn Đức Tài', NULL, '1969-01-01', 'Nam', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Chủ tịch', 'Thế Giới Di Động', '353535353535', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-09-09', 'Quận 1, TP.HCM', 'Chủ hộ', 44),
('Nguyễn Thị Bích', NULL, '1971-01-01', 'Nữ', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Nội trợ', '', '353535353536', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-09-09', 'Quận 1, TP.HCM', 'Vợ', 44),
('Nguyễn Đức Anh', NULL, '1998-01-01', 'Nam', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Du học sinh', 'Úc', '353535353537', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-09-09', 'Quận 1, TP.HCM', 'Con trai', 44),
-- HK 45 (4 người)
('Cao Văn Chín', NULL, '1970-01-01', 'Nam', 'Tiền Giang', 'Tiền Giang', 'Kinh', 'Nông dân', '', '363636363636', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-06-20', 'Tiền Giang', 'Chủ hộ', 45),
('Lê Thị Mười', NULL, '1972-01-01', 'Nữ', 'Tiền Giang', 'Tiền Giang', 'Kinh', 'Nội trợ', '', '363636363637', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-06-20', 'Tiền Giang', 'Vợ', 45),
('Cao Thị Bé', NULL, '1995-01-01', 'Nữ', 'Tiền Giang', 'Tiền Giang', 'Kinh', 'Công nhân', 'Khu công nghiệp', '363636363638', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-06-20', 'Tiền Giang', 'Con gái', 45),
('Cao Văn Tèo', NULL, '2000-01-01', 'Nam', 'Tiền Giang', 'Tiền Giang', 'Kinh', 'Sinh viên', 'Đại học Nông Lâm', '363636363639', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-06-20', 'Tiền Giang', 'Con trai', 45),
-- HK 46 (2 người)
('Dương Văn Mười', NULL, '1955-01-01', 'Nam', 'Long An', 'Long An', 'Kinh', 'Nghỉ hưu', '', '373737373737', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-03-17', 'Long An', 'Chủ hộ', 46),
('Trần Thị Đẹp', NULL, '1958-01-01', 'Nữ', 'Long An', 'Long An', 'Kinh', 'Nghỉ hưu', '', '373737373738', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-03-17', 'Long An', 'Vợ', 46),
-- HK 47 (3 người)
('Lý Văn Sáu', NULL, '1980-01-01', 'Nam', 'Sóc Trăng', 'Sóc Trăng', 'Khmer', 'Kỹ sư điện', 'EVN', '383838383838', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-08-30', 'Sóc Trăng', 'Chủ hộ', 47),
('Thạch Thị Sa Ry', NULL, '1982-01-01', 'Nữ', 'Sóc Trăng', 'Sóc Trăng', 'Khmer', 'Giáo viên', 'Trường THCS Mộ Lao', '383838383839', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-08-30', 'Sóc Trăng', 'Vợ', 47),
('Lý Thị Ngọc', NULL, '2010-01-01', 'Nữ', 'Hà Nội', 'Sóc Trăng', 'Khmer', 'Học sinh', 'Trường THCS Mộ Lao', NULL, NULL, NULL, '2021-08-30', 'Sóc Trăng', 'Con gái', 47),
-- HK 48 (5 người)
('Sơn Tùng M-TP', 'Nguyễn Thanh Tùng', '1994-07-05', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Ca sĩ', '', '393939393939', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-12-12', 'Quận 7, TP.HCM', 'Chủ hộ', 48),
('Thiều Bảo Trâm', NULL, '1994-09-09', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Ca sĩ', '', '393939393940', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-12-12', 'Quận 7, TP.HCM', 'Bạn gái', 48),
('Nguyễn Đức Thiện', NULL, '1965-01-01', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nghỉ hưu', '', '393939393941', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-12-12', 'Quận 7, TP.HCM', 'Bố', 48),
('Phạm Thị Thanh', NULL, '1968-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', '', '393939393942', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-12-12', 'Quận 7, TP.HCM', 'Mẹ', 48),
('Nguyễn Việt Hoàng', 'MONO', '2000-01-20', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Ca sĩ', '', '393939393943', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-12-12', 'Quận 7, TP.HCM', 'Em trai', 48),
-- HK 49 (3 người)
('Độ Mixi', 'Phùng Thanh Độ', '1989-09-12', 'Nam', 'Cao Bằng', 'Cao Bằng', 'Tày', 'Streamer', 'MixiGaming', '404040404040', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-04-25', 'Cao Bằng', 'Chủ hộ', 49),
('Trang Mixi', 'Nguyễn Thu Trang', '1992-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', 'MixiFood', '404040404041', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-04-25', 'Cao Bằng', 'Vợ', 49),
('Tùng Sói', 'Phùng Thanh Tùng', '2018-01-01', 'Nam', 'Hà Nội', 'Cao Bằng', 'Tày', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2023-04-25', 'Cao Bằng', 'Con trai', 49),
-- HK 50 (4 người)
('PewPew', 'Hoàng Văn Khoa', '1991-01-01', 'Nam', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Streamer', 'PewPew Studio', '414141414141', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-01-10', 'TP. Hồ Chí Minh', 'Chủ hộ', 50),
('Hồng Nhật', 'Nguyễn Hồng Nhật', '1995-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', 'Tiệm bánh mì PewPew', '414141414142', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-01-10', 'TP. Hồ Chí Minh', 'Vợ', 50),
('Hoàng Văn Hải', NULL, '1960-01-01', 'Nam', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Nghỉ hưu', '', '414141414143', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-01-10', 'TP. Hồ Chí Minh', 'Bố', 50),
('Lê Thị Lan', NULL, '1962-01-01', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Nghỉ hưu', '', '414141414144', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-01-10', 'TP. Hồ Chí Minh', 'Mẹ', 50);

-- Nhân khẩu cho Hộ khẩu 51-100
INSERT INTO nhan_khau(ho_ten, bi_danh, ngay_sinh, gioi_tinh, noi_sinh, que_quan, dan_toc, nghe_nghiep, noi_lam_viec, cmnd_cccd, ngay_cap, noi_cap, ngay_dang_ky_thuong_tru, dia_chi_truoc_khi_chuyen_den, quan_he_voi_chu_ho, ho_khau_id) VALUES
-- HK 51 (4 người)
('Vũ Văn Thanh', NULL, '1996-04-14', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '424242424242', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-08-15', 'Hải Dương', 'Chủ hộ', 51),
('Lê Thị Ánh', NULL, '1998-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Kinh doanh', '', '424242424243', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-08-15', 'Hải Dương', 'Vợ', 51),
('Vũ Lê Minh', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Hải Dương', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 51),
('Vũ Văn Thắng', NULL, '1970-01-01', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nông dân', '', '424242424244', '2015-01-01', 'Công an tỉnh Hải Dương', '2019-08-15', 'Hải Dương', 'Bố', 51),
-- HK 52 (3 người)
('Hồ Tấn Tài', NULL, '1997-11-06', 'Nam', 'Bình Định', 'Bình Định', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '434343434343', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-06-20', 'Bình Định', 'Chủ hộ', 52),
('Phạm Thị Hiếu', NULL, '1998-01-01', 'Nữ', 'Bình Định', 'Bình Định', 'Kinh', 'Chuyên viên trang điểm', '', '434343434344', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-06-20', 'Bình Định', 'Vợ', 52),
('Hồ Tấn Lộc', NULL, '2022-01-01', 'Nam', 'Hà Nội', 'Bình Định', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con trai', 52),
-- HK 53 (2 người)
('Đoàn Văn Hậu', NULL, '1999-04-19', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '444444444444', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-02-10', 'Thái Bình', 'Chủ hộ', 53),
('Doãn Hải My', NULL, '2001-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Người mẫu', '', '444444444445', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-02-10', 'Thái Bình', 'Vợ', 53),
-- HK 54 (5 người)
('Nguyễn Quang Hải', NULL, '1997-04-12', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '454545454545', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-05-01', 'Pháp', 'Chủ hộ', 54),
('Chu Thanh Huyền', NULL, '1998-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh online', '', '454545454546', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-05-01', 'Pháp', 'Vợ', 54),
('Nguyễn Quang Hùng', NULL, '1970-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nghỉ hưu', '', '454545454547', '2015-01-01', 'Công an TP Hà Nội', '2023-05-01', 'Pháp', 'Bố', 54),
('Nguyễn Thị Cúc', NULL, '1972-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Nội trợ', '', '454545454548', '2015-01-01', 'Công an TP Hà Nội', '2023-05-01', 'Pháp', 'Mẹ', 54),
('Nguyễn Bảo Anh', NULL, '2023-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2023-01-10', 'Mới sinh', 'Con trai', 54),
-- HK 55 (4 người)
('Bùi Tiến Dũng', NULL, '1997-02-28', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Mường', 'Cầu thủ bóng đá', 'CAHN', '464646464646', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-10-05', 'Thanh Hóa', 'Chủ hộ', 55),
('Dianka Zakhidova', NULL, '2000-01-01', 'Nữ', 'Ukraine', 'Ukraine', 'Ukraine', 'Người mẫu', '', '464646464647', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-10-05', 'Thanh Hóa', 'Vợ', 55),
('Bùi Tiến Dũng Jr', NULL, '2022-01-01', 'Nam', 'Hà Nội', 'Thanh Hóa', 'Mường', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con trai', 55),
('Bùi Văn Khánh', NULL, '1970-01-01', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Mường', 'Nông dân', '', '464646464648', '2015-01-01', 'Công an tỉnh Thanh Hóa', '2017-10-05', 'Thanh Hóa', 'Bố', 55),
-- HK 56 (3 người)
('Bùi Hoàng Việt Anh', NULL, '1999-01-01', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '474747474747', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-03-18', 'Thái Bình', 'Chủ hộ', 56),
('Nguyễn Thị Hoàng Anh', NULL, '2000-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Kinh doanh', '', '474747474748', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-03-18', 'Thái Bình', 'Vợ', 56),
('Bùi Nguyễn Gia Hân', NULL, '2023-01-01', 'Nữ', 'Hà Nội', 'Thái Bình', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2023-01-10', 'Mới sinh', 'Con gái', 56),
-- HK 57 (2 người)
('Giáp Tuấn Dương', NULL, '2002-09-07', 'Nam', 'Bắc Giang', 'Bắc Giang', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '484848484848', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-07-11', 'Bắc Giang', 'Chủ hộ', 57),
('Nguyễn Thị Lan', NULL, '1975-01-01', 'Nữ', 'Bắc Giang', 'Bắc Giang', 'Kinh', 'Nội trợ', '', '484848484849', '2015-01-01', 'Công an tỉnh Bắc Giang', '2016-07-11', 'Bắc Giang', 'Mẹ', 57),
-- HK 58 (4 người)
('Phan Tuấn Tài', NULL, '2001-01-07', 'Nam', 'Đắk Lắk', 'Đắk Lắk', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '494949494949', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-11-23', 'Đắk Lắk', 'Chủ hộ', 58),
('Vũ Thị Trang', NULL, '2002-01-01', 'Nữ', 'Đắk Lắk', 'Đắk Lắk', 'Kinh', 'Sinh viên', 'Đại học Sư phạm', '494949494950', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-11-23', 'Đắk Lắk', 'Vợ', 58),
('Phan Văn Lợi', NULL, '1975-01-01', 'Nam', 'Đắk Lắk', 'Đắk Lắk', 'Kinh', 'Nông dân', '', '494949494951', '2015-01-01', 'Công an tỉnh Đắk Lắk', '2020-11-23', 'Đắk Lắk', 'Bố', 58),
('Nguyễn Thị Hoa', NULL, '1978-01-01', 'Nữ', 'Đắk Lắk', 'Đắk Lắk', 'Kinh', 'Nội trợ', '', '494949494952', '2015-01-01', 'Công an tỉnh Đắk Lắk', '2020-11-23', 'Đắk Lắk', 'Mẹ', 58),
-- HK 59 (3 người)
('Vũ Văn Sơn', NULL, '1970-01-01', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nghỉ hưu', '', '505050505050', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-01-29', 'Hải Dương', 'Chủ hộ', 59),
('Nguyễn Thị Mai', NULL, '1972-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nội trợ', '', '505050505051', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-01-29', 'Hải Dương', 'Vợ', 59),
('Vũ Thị Hà', NULL, '1995-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nhân viên văn phòng', 'FPT', '505050505052', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-01-29', 'Hải Dương', 'Con gái', 59),
-- HK 60 (4 người)
('Lê Văn Đô', NULL, '2001-08-07', 'Nam', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '515151515151', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-09-14', 'Quảng Nam', 'Chủ hộ', 60),
('Nguyễn Thị Thảo', NULL, '2002-01-01', 'Nữ', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Sinh viên', 'Đại học Duy Tân', '515151515152', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-09-14', 'Quảng Nam', 'Vợ', 60),
('Lê Văn Hùng', NULL, '1975-01-01', 'Nam', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Nông dân', '', '515151515153', '2015-01-01', 'Công an tỉnh Quảng Nam', '2023-09-14', 'Quảng Nam', 'Bố', 60),
('Trần Thị Lan', NULL, '1978-01-01', 'Nữ', 'Quảng Nam', 'Quảng Nam', 'Kinh', 'Nội trợ', '', '515151515154', '2015-01-01', 'Công an tỉnh Quảng Nam', '2023-09-14', 'Quảng Nam', 'Mẹ', 60),
-- HK 61 (3 người)
('Hà Văn Phương', NULL, '1985-01-01', 'Nam', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Lao động tự do', '', '525252525252', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-04-16', 'Hòa Bình', 'Chủ hộ', 61),
('Bùi Thị Hoa', NULL, '1988-01-01', 'Nữ', 'Hòa Bình', 'Hòa Bình', 'Mường', 'Công nhân', '', '525252525253', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-04-16', 'Hòa Bình', 'Vợ', 61),
('Hà Thị Linh', NULL, '2010-01-01', 'Nữ', 'Hà Nội', 'Hòa Bình', 'Mường', 'Học sinh', 'Trường THCS Nguyễn Trãi', NULL, NULL, NULL, '2015-04-16', 'Hòa Bình', 'Con gái', 61),
-- HK 62 (4 người)
('Lương Xuân Trường', NULL, '1995-04-28', 'Nam', 'Tuyên Quang', 'Tuyên Quang', 'Kinh', 'Cầu thủ bóng đá', 'Hải Phòng FC', '535353535353', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-08-08', 'Tuyên Quang', 'Chủ hộ', 62),
('Ngô Mai Nhuệ Giang', NULL, '1996-01-01', 'Nữ', 'Tuyên Quang', 'Tuyên Quang', 'Kinh', 'Kinh doanh', '', '535353535354', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-08-08', 'Tuyên Quang', 'Vợ', 62),
('Lương Xuân Anh', NULL, '2021-01-01', 'Nữ', 'Hà Nội', 'Tuyên Quang', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2021-01-10', 'Mới sinh', 'Con gái', 62),
('Lương Bách Chiến', NULL, '1965-01-01', 'Nam', 'Tuyên Quang', 'Tuyên Quang', 'Kinh', 'Nghỉ hưu', '', '535353535355', '2015-01-01', 'Công an tỉnh Tuyên Quang', '2018-08-08', 'Tuyên Quang', 'Bố', 62),
-- HK 63 (3 người)
('Nguyễn Tuấn Anh', NULL, '1995-05-16', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Cầu thủ bóng đá', 'HAGL', '545454545454', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-07-17', 'Thái Bình', 'Chủ hộ', 63),
('Nguyễn Văn Dung', NULL, '1965-01-01', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nghỉ hưu', '', '545454545455', '2015-01-01', 'Công an tỉnh Thái Bình', '2022-07-17', 'Thái Bình', 'Bố', 63),
('Trần Thị Loan', NULL, '1968-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', '', '545454545456', '2015-01-01', 'Công an tỉnh Thái Bình', '2022-07-17', 'Thái Bình', 'Mẹ', 63),
-- HK 64 (2 người)
('Nguyễn Văn Toàn', NULL, '1996-04-12', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'Nam Định FC', '555555555555', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-09-28', 'Hải Dương', 'Chủ hộ', 64),
('Nguyễn Thị Nụ', NULL, '1970-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nội trợ', '', '555555555556', '2015-01-01', 'Công an tỉnh Hải Dương', '2017-09-28', 'Hải Dương', 'Mẹ', 64),
-- HK 65 (4 người)
('Nguyễn Công Phượng', NULL, '1995-01-21', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'Yokohama FC', '565656565656', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-02-05', 'Nghệ An', 'Chủ hộ', 65),
('Tô Ngọc Viên Minh', NULL, '1996-01-01', 'Nữ', 'TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 'Kinh', 'Kinh doanh', '', '565656565657', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-02-05', 'Nghệ An', 'Vợ', 65),
('Nguyễn Công Bảy', NULL, '1965-01-01', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Nông dân', '', '565656565658', '2015-01-01', 'Công an tỉnh Nghệ An', '2021-02-05', 'Nghệ An', 'Bố', 65),
('Nguyễn Thị Hoa', NULL, '1968-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Nội trợ', '', '565656565659', '2015-01-01', 'Công an tỉnh Nghệ An', '2021-02-05', 'Nghệ An', 'Mẹ', 65),
-- HK 66 (3 người)
('Nguyễn Phong Hồng Duy', NULL, '1996-06-13', 'Nam', 'Bình Phước', 'Bình Phước', 'Kinh', 'Cầu thủ bóng đá', 'Nam Định FC', '575757575757', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-06-19', 'Bình Phước', 'Chủ hộ', 66),
('Phạm Thị Kiều Oanh', NULL, '1997-01-01', 'Nữ', 'Bình Phước', 'Bình Phước', 'Kinh', 'Kinh doanh', '', '575757575758', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-06-19', 'Bình Phước', 'Vợ', 66),
('Nguyễn Phong Gia Hân', NULL, '2022-01-01', 'Nữ', 'Hà Nội', 'Bình Phước', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con gái', 66),
-- HK 67 (4 người)
('Trần Minh Vương', NULL, '1995-03-28', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Cầu thủ bóng đá', 'HAGL', '585858585858', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-11-11', 'Thái Bình', 'Chủ hộ', 67),
('Nguyễn Thị Nguyên', NULL, '1970-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', '', '585858585859', '2015-01-01', 'Công an tỉnh Thái Bình', '2023-11-11', 'Thái Bình', 'Mẹ', 67),
('Trần Văn Hùng', NULL, '1968-01-01', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nông dân', '', '585858585860', '2015-01-01', 'Công an tỉnh Thái Bình', '2023-11-11', 'Thái Bình', 'Bố', 67),
('Trần Thị Thảo', NULL, '2000-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Sinh viên', 'Đại học Thương mại', '585858585861', '2018-01-01', 'Cục CSQLHC về TTXH', '2023-11-11', 'Thái Bình', 'Em gái', 67),
-- HK 68 (3 người)
('Vũ Văn Thanh', NULL, '1996-04-14', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '595959595959', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-01-13', 'Hải Dương', 'Chủ hộ', 68),
('Bùi Thị Lan', NULL, '1997-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Kinh doanh', '', '595959595960', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-01-13', 'Hải Dương', 'Vợ', 68),
('Vũ Gia Huy', NULL, '2021-01-01', 'Nam', 'Hà Nội', 'Hải Dương', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2021-01-10', 'Mới sinh', 'Con trai', 68),
-- HK 69 (2 người)
('Nguyễn Thành Chung', NULL, '1997-09-08', 'Nam', 'Tuyên Quang', 'Tuyên Quang', 'Kinh', 'Cầu thủ bóng đá', 'Hà Nội FC', '606060606060', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-05-25', 'Tuyên Quang', 'Chủ hộ', 69),
('Ngô Tố Uyên', NULL, '1998-01-01', 'Nữ', 'Tuyên Quang', 'Tuyên Quang', 'Kinh', 'Kinh doanh', '', '606060606061', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-05-25', 'Tuyên Quang', 'Vợ', 69),
-- HK 70 (4 người)
('Đỗ Duy Mạnh', NULL, '1996-09-29', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'Hà Nội FC', '616161616161', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-02-02', 'Hà Nội', 'Chủ hộ', 70),
('Nguyễn Quỳnh Anh', NULL, '1997-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', '', '616161616162', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-02-02', 'Hà Nội', 'Vợ', 70),
('Đỗ Duy Minh', 'Ú', '2020-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 70),
('Nguyễn Huyền My', NULL, '1995-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Á hậu', '', '616161616163', '2018-01-01', 'Cục CSQLHC về TTXH', '2020-02-02', 'Hà Nội', 'Chị vợ', 70),
-- HK 71 (3 người)
('Phạm Tuấn Hải', NULL, '1998-05-19', 'Nam', 'Hà Nam', 'Hà Nam', 'Kinh', 'Cầu thủ bóng đá', 'Hà Nội FC', '626262626262', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-03-03', 'Hà Nam', 'Chủ hộ', 71),
('Doãn Thị Phương', NULL, '1999-01-01', 'Nữ', 'Hà Nam', 'Hà Nam', 'Kinh', 'Kinh doanh', '', '626262626263', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-03-03', 'Hà Nam', 'Vợ', 71),
('Phạm Doãn An', NULL, '2023-01-01', 'Nam', 'Hà Nội', 'Hà Nam', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2023-01-10', 'Mới sinh', 'Con trai', 71),
-- HK 72 (4 người)
('Nguyễn Hoàng Đức', NULL, '1998-01-11', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'Thể Công Viettel', '636363636363', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-08-24', 'Hải Dương', 'Chủ hộ', 72),
('Nguyễn Gia Hân', NULL, '1999-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Kinh doanh', '', '636363636364', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-08-24', 'Hải Dương', 'Bạn gái', 72),
('Nguyễn Văn Lợi', NULL, '1970-01-01', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nông dân', '', '6363636365', '2015-01-01', 'Công an tỉnh Hải Dương', '2016-08-24', 'Hải Dương', 'Bố', 72),
('Hoàng Thị Thắm', NULL, '1972-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nội trợ', '', '636363636366', '2015-01-01', 'Công an tỉnh Hải Dương', '2016-08-24', 'Hải Dương', 'Mẹ', 72),
-- HK 73 (3 người)
('Bùi Tiến Dũng', NULL, '1995-10-02', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Cầu thủ bóng đá', 'Thể Công Viettel', '646464646464', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-10-12', 'Hà Tĩnh', 'Chủ hộ', 73),
('Nguyễn Khánh Linh', NULL, '1996-01-01', 'Nữ', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Kinh doanh', '', '646464646465', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-10-12', 'Hà Tĩnh', 'Vợ', 73),
('Bùi Nguyễn An Nhiên', 'Sushi', '2021-01-01', 'Nữ', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2021-01-10', 'Mới sinh', 'Con gái', 73),
-- HK 74 (2 người)
('Nguyễn Thanh Bình', NULL, '2000-11-02', 'Nam', 'Thái Bình', 'Thái Bình', 'Kinh', 'Cầu thủ bóng đá', 'Thể Công Viettel', '656565656565', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-07-19', 'Thái Bình', 'Chủ hộ', 74),
('Nguyễn Thị Ngọc', NULL, '1975-01-01', 'Nữ', 'Thái Bình', 'Thái Bình', 'Kinh', 'Nội trợ', '', '656565656566', '2015-01-01', 'Công an tỉnh Thái Bình', '2019-07-19', 'Thái Bình', 'Mẹ', 74),
-- HK 75 (4 người)
('Phan Văn Đức', NULL, '1996-04-11', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'CAHN', '666666666666', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-03-23', 'Nghệ An', 'Chủ hộ', 75),
('Võ Nhật Linh', NULL, '1997-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Kinh doanh', '', '666666666667', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-03-23', 'Nghệ An', 'Vợ', 75),
('Phan Gia Huy', 'Dâu Tây', '2020-01-01', 'Nam', 'Hà Nội', 'Nghệ An', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 75),
('Phan Văn Bảy', NULL, '1970-01-01', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Nông dân', '', '666666666668', '2015-01-01', 'Công an tỉnh Nghệ An', '2017-03-23', 'Nghệ An', 'Bố', 75),
-- HK 76 (3 người)
('Quế Ngọc Hải', NULL, '1993-05-15', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'Bình Dương FC', '676767676767', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-09-18', 'Nghệ An', 'Chủ hộ', 76),
('Dương Thị Thùy Phương', NULL, '1994-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Hoa khôi', '', '676767676768', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-09-18', 'Nghệ An', 'Vợ', 76),
('Quế Ngọc Kim Ngân', 'Sunny', '2018-01-01', 'Nữ', 'Hà Nội', 'Nghệ An', 'Kinh', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2018-01-10', 'Mới sinh', 'Con gái', 76),
-- HK 77 (4 người)
('Nguyễn Tiến Linh', NULL, '1997-10-20', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'Bình Dương FC', '686868686868', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-08-03', 'Hải Dương', 'Chủ hộ', 77),
('Huỳnh Hồng Loan', NULL, '1998-01-01', 'Nữ', 'Bình Dương', 'Bình Dương', 'Kinh', 'Diễn viên', '', '686868686869', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-08-03', 'Hải Dương', 'Bạn gái', 77),
('Nguyễn Tiến Dũng', NULL, '1970-01-01', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nông dân', '', '686868686870', '2015-01-01', 'Công an tỉnh Hải Dương', '2022-08-03', 'Hải Dương', 'Bố', 77),
('Hà Thị Mai', NULL, '1972-01-01', 'Nữ', 'Hải Dương', 'Hải Dương', 'Kinh', 'Nội trợ', '', '686868686871', '2015-01-01', 'Công an tỉnh Hải Dương', '2022-08-03', 'Hải Dương', 'Mẹ', 77),
-- HK 78 (3 người)
('Nguyễn Văn Quyết', NULL, '1991-07-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'Hà Nội FC', '696969696969', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-12-21', 'Hà Nội', 'Chủ hộ', 78),
('Nguyễn Huyền Mi', NULL, '1992-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', '', '696969696970', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-12-21', 'Hà Nội', 'Vợ', 78),
('Nguyễn Văn Quân', 'Sóc', '2017-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2017-01-10', 'Mới sinh', 'Con trai', 78),
-- HK 79 (2 người)
('Trần Thành', NULL, '1997-01-01', 'Nam', 'Thừa Thiên Huế', 'Thừa Thiên Huế', 'Kinh', 'Cầu thủ bóng đá', 'Huế FC', '707070707070', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-07-27', 'Thừa Thiên Huế', 'Chủ hộ', 79),
('Lê Thị Nga', NULL, '1970-01-01', 'Nữ', 'Thừa Thiên Huế', 'Thừa Thiên Huế', 'Kinh', 'Nội trợ', '', '707070707071', '2015-01-01', 'Công an tỉnh Thừa Thiên Huế', '2023-07-27', 'Thừa Thiên Huế', 'Mẹ', 79),
-- HK 80 (4 người)
('Hà Đức Chinh', NULL, '1997-09-22', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Mường', 'Cầu thủ bóng đá', 'Bình Định FC', '717171717171', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-01-20', 'Phú Thọ', 'Chủ hộ', 80),
('Mai Hà Trang', NULL, '1998-01-01', 'Nữ', 'Bắc Giang', 'Bắc Giang', 'Kinh', 'Kinh doanh', '', '717171717172', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-01-20', 'Phú Thọ', 'Vợ', 80),
('Hà Văn Lịch', NULL, '1970-01-01', 'Nam', 'Phú Thọ', 'Phú Thọ', 'Mường', 'Nông dân', '', '717171717173', '2015-01-01', 'Công an tỉnh Phú Thọ', '2021-01-20', 'Phú Thọ', 'Bố', 80),
('Hà Thị Minh', NULL, '1972-01-01', 'Nữ', 'Phú Thọ', 'Phú Thọ', 'Mường', 'Nội trợ', '', '717171717174', '2015-01-01', 'Công an tỉnh Phú Thọ', '2021-01-20', 'Phú Thọ', 'Mẹ', 80),
-- HK 81 (3 người)
('Nguyễn Trọng Hoàng', NULL, '1989-04-14', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'SLNA', '727272727272', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-16', 'Nghệ An', 'Chủ hộ', 81),
('Nguyễn Thị Hạnh', NULL, '1990-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Kinh doanh', '', '727272727273', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-16', 'Nghệ An', 'Vợ', 81),
('Nguyễn Trọng Phúc', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Nghệ An', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 81),
-- HK 82 (4 người)
('Nguyễn Trọng Hùng', NULL, '1997-10-03', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Cầu thủ bóng đá', 'Thanh Hóa FC', '737373737373', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-07-21', 'Thanh Hóa', 'Chủ hộ', 82),
('Lê Thị Thùy', NULL, '1998-01-01', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Sinh viên', 'Đại học Hồng Đức', '737373737374', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-07-21', 'Thanh Hóa', 'Vợ', 82),
('Nguyễn Trọng Đức', NULL, '1970-01-01', 'Nam', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nông dân', '', '737373737375', '2015-01-01', 'Công an tỉnh Thanh Hóa', '2022-07-21', 'Thanh Hóa', 'Bố', 82),
('Lê Thị Hoa', NULL, '1972-01-01', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Nội trợ', '', '737373737376', '2015-01-01', 'Công an tỉnh Thanh Hóa', '2022-07-21', 'Thanh Hóa', 'Mẹ', 82),
-- HK 83 (3 người)
('Hồ Khắc Ngọc', NULL, '1992-08-02', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'SLNA', '747474747474', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-02-11', 'Nghệ An', 'Chủ hộ', 83),
('Trần Thị Thủy', NULL, '1993-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Giáo viên', '', '747474747475', '2017-01-01', 'Cục CSQLHC về TTXH', '2017-02-11', 'Nghệ An', 'Vợ', 83),
('Hồ Trần Gia Bảo', NULL, '2019-01-01', 'Nam', 'Hà Nội', 'Nghệ An', 'Kinh', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2019-01-10', 'Mới sinh', 'Con trai', 83),
-- HK 84 (2 người)
('Ngô Hoàng Thịnh', NULL, '1992-04-21', 'Nam', 'Nghệ An', 'Nghệ An', 'Kinh', 'Cầu thủ bóng đá', 'SLNA', '757575757575', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-02', 'Nghệ An', 'Chủ hộ', 84),
('Dương Thị Ánh', NULL, '1993-01-01', 'Nữ', 'Nghệ An', 'Nghệ An', 'Kinh', 'Kinh doanh', '', '757575757576', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-02', 'Nghệ An', 'Vợ', 84),
-- HK 85 (4 người)
('Trần Phi Sơn', NULL, '1992-03-14', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Cầu thủ bóng đá', 'Hà Tĩnh FC', '767676767676', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-11-06', 'Hà Tĩnh', 'Chủ hộ', 85),
('Lê Thị Thanh', NULL, '1993-01-01', 'Nữ', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Kinh doanh', '', '767676767677', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-11-06', 'Hà Tĩnh', 'Vợ', 85),
('Trần Lê An', NULL, '2019-01-01', 'Nam', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2019-01-10', 'Mới sinh', 'Con trai', 85),
('Trần Văn Hùng', NULL, '1965-01-01', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Nông dân', '', '767676767678', '2015-01-01', 'Công an tỉnh Hà Tĩnh', '2018-11-06', 'Hà Tĩnh', 'Bố', 85),
-- HK 86 (3 người)
('Đinh Thanh Trung', NULL, '1988-01-24', 'Nam', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Cầu thủ bóng đá', 'Hà Tĩnh FC', '777777777777', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-04-19', 'Hà Tĩnh', 'Chủ hộ', 86),
('Trần Thị Thảo', NULL, '1989-01-01', 'Nữ', 'Hà Tĩnh', 'Hà Tĩnh', 'Kinh', 'Kinh doanh', '', '777777777778', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-04-19', 'Hà Tĩnh', 'Vợ', 86),
('Đinh Trần Bảo', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Hà Tĩnh', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 86),
-- HK 87 (2 người)
('Mạc Hồng Quân', NULL, '1992-01-01', 'Nam', 'Hải Dương', 'Hải Dương', 'Kinh', 'Cầu thủ bóng đá', 'Bình Định FC', '787878787878', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-07-12', 'Hải Dương', 'Chủ hộ', 87),
('Kỳ Hân', NULL, '1995-01-01', 'Nữ', 'Sóc Trăng', 'Sóc Trăng', 'Kinh', 'Người mẫu', '', '787878787879', '2015-01-01', 'Cục CSQLHC về TTXH', '2015-07-12', 'Hải Dương', 'Vợ', 87),
-- HK 88 (4 người)
('Nghiêm Xuân Tú', NULL, '1988-08-28', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Cầu thủ bóng đá', 'Nam Định FC', '797979797979', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-12-24', 'Hà Nội', 'Chủ hộ', 88),
('Phạm Thanh Thủy', NULL, '1989-01-01', 'Nữ', 'Hà Nội', 'Hà Nội', 'Kinh', 'Kinh doanh', '', '797979797980', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-12-24', 'Hà Nội', 'Vợ', 88),
('Nghiêm Xuân Phúc', NULL, '2018-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Học sinh', 'Trường mầm non', NULL, NULL, NULL, '2018-01-10', 'Mới sinh', 'Con trai', 88),
('Nghiêm Xuân Lộc', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Hà Nội', 'Kinh', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 88),
-- HK 89 (3 người)
('Andre Fagan', NULL, '1987-01-01', 'Nam', 'Jamaica', 'Jamaica', 'Jamaica', 'Cầu thủ bóng đá', 'Nam Định FC', '808080808080', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-02-28', 'Jamaica', 'Chủ hộ', 89),
('Nguyễn Thị Lan', NULL, '1990-01-01', 'Nữ', 'Nam Định', 'Nam Định', 'Kinh', 'Kinh doanh', '', '808080808081', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-02-28', 'Jamaica', 'Vợ', 89),
('Andre Fagan Jr', NULL, '2021-01-01', 'Nam', 'Hà Nội', 'Jamaica', 'Jamaica', 'Ở nhà', '', NULL, NULL, NULL, '2021-01-10', 'Mới sinh', 'Con trai', 89),
-- HK 90 (4 người)
('Rafaelson', NULL, '1997-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Nam Định FC', '818181818181', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-10-15', 'Brazil', 'Chủ hộ', 90),
('Laryssa', NULL, '1998-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '818181818182', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-10-15', 'Brazil', 'Vợ', 90),
('Rafaelson Jr', NULL, '2022-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con trai', 90),
('Maria', NULL, '1970-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Nội trợ', '', '818181818183', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-10-15', 'Brazil', 'Mẹ vợ', 90),
-- HK 91 (3 người)
('Lucas Alves', NULL, '1992-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Nam Định FC', '828282828282', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-05-17', 'Brazil', 'Chủ hộ', 91),
('Juliana', NULL, '1993-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '828282828283', '2016-01-01', 'Cục CSQLHC về TTXH', '2016-05-17', 'Brazil', 'Vợ', 91),
('Lucas Jr', NULL, '2018-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Học sinh', 'Trường quốc tế', NULL, NULL, NULL, '2018-01-10', 'Mới sinh', 'Con trai', 91),
-- HK 92 (4 người)
('Hendrio Araujo', NULL, '1994-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Nam Định FC', '838383838383', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-09', 'Brazil', 'Chủ hộ', 92),
('Beatriz', NULL, '1995-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '8383838384', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-09-09', 'Brazil', 'Vợ', 92),
('Hendrio Jr', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 92),
('Ana', NULL, '2022-01-01', 'Nữ', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con gái', 92),
-- HK 93 (3 người)
('Joseph Mpande', NULL, '1994-01-01', 'Nam', 'Uganda', 'Uganda', 'Uganda', 'Cầu thủ bóng đá', 'Hải Phòng FC', '848484848484', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-08-18', 'Uganda', 'Chủ hộ', 93),
('Nguyễn Thị Thơm', NULL, '1995-01-01', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Kinh doanh', '', '848484848485', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-08-18', 'Uganda', 'Vợ', 93),
('Mpande Jr', NULL, '2023-01-01', 'Nam', 'Hà Nội', 'Uganda', 'Uganda', 'Ở nhà', '', NULL, NULL, NULL, '2023-01-10', 'Mới sinh', 'Con trai', 93),
-- HK 94 (2 người)
('Lucao do Break', NULL, '1991-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Hải Phòng FC', '858585858585', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-29', 'Brazil', 'Chủ hộ', 94),
('Isabela', NULL, '1992-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '858585858586', '2018-01-01', 'Cục CSQLHC về TTXH', '2018-10-29', 'Brazil', 'Vợ', 94),
-- HK 95 (4 người)
('Bicou Bissainthe', NULL, '1999-01-01', 'Nam', 'Haiti', 'Haiti', 'Haiti', 'Cầu thủ bóng đá', 'Hải Phòng FC', '868686868686', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-03-06', 'Haiti', 'Chủ hộ', 95),
('Trần Thị Ngọc', NULL, '2000-01-01', 'Nữ', 'Hải Phòng', 'Hải Phòng', 'Kinh', 'Sinh viên', 'Đại học Hàng hải', '868686868687', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-03-06', 'Haiti', 'Vợ', 95),
('Bissainthe Jr', NULL, '2023-01-01', 'Nam', 'Hà Nội', 'Haiti', 'Haiti', 'Ở nhà', '', NULL, NULL, NULL, '2023-01-10', 'Mới sinh', 'Con trai', 95),
('Jean', NULL, '1970-01-01', 'Nam', 'Haiti', 'Haiti', 'Haiti', 'Nông dân', '', '868686868688', '2022-01-01', 'Cục CSQLHC về TTXH', '2022-03-06', 'Haiti', 'Bố', 95),
-- HK 96 (3 người)
('Rimario Gordon', NULL, '1994-01-01', 'Nam', 'Jamaica', 'Jamaica', 'Jamaica', 'Cầu thủ bóng đá', 'Thanh Hóa FC', '878787878787', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-07-20', 'Jamaica', 'Chủ hộ', 96),
('Nguyễn Thị Mai', NULL, '1995-01-01', 'Nữ', 'Thanh Hóa', 'Thanh Hóa', 'Kinh', 'Kinh doanh', '', '878787878788', '2020-01-01', 'Cục CSQLHC về TTXH', '2020-07-20', 'Jamaica', 'Vợ', 96),
('Rimario Jr', NULL, '2021-01-01', 'Nam', 'Hà Nội', 'Jamaica', 'Jamaica', 'Ở nhà', '', NULL, NULL, NULL, '2021-01-10', 'Mới sinh', 'Con trai', 96),
-- HK 97 (4 người)
('Luiz Antonio', NULL, '1991-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Thanh Hóa FC', '888888888888', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-12-12', 'Brazil', 'Chủ hộ', 97),
('Livia', NULL, '1992-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '888888888889', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-12-12', 'Brazil', 'Vợ', 97),
('Luiz Jr', NULL, '2022-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con trai', 97),
('Antonio', NULL, '1965-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Nghỉ hưu', '', '888888888890', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-12-12', 'Brazil', 'Bố', 97),
-- HK 98 (3 người)
('Gustavo Santos', NULL, '1995-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Thanh Hóa FC', '898989898989', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-02-14', 'Brazil', 'Chủ hộ', 98),
('Camila', NULL, '1996-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '898989898990', '2019-01-01', 'Cục CSQLHC về TTXH', '2019-02-14', 'Brazil', 'Vợ', 98),
('Gustavo Jr', NULL, '2020-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2020-01-10', 'Mới sinh', 'Con trai', 98),
-- HK 99 (2 người)
('Jermie Lynch', NULL, '1991-01-01', 'Nam', 'Jamaica', 'Jamaica', 'Jamaica', 'Cầu thủ bóng đá', 'Bình Định FC', '909090909090', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-26', 'Jamaica', 'Chủ hộ', 99),
('Nguyễn Thị Huyền', NULL, '1992-01-01', 'Nữ', 'Bình Định', 'Bình Định', 'Kinh', 'Kinh doanh', '', '909090909091', '2023-01-01', 'Cục CSQLHC về TTXH', '2023-06-26', 'Jamaica', 'Vợ', 99),
-- HK 100 (4 người)
('Alan Grafite', NULL, '1998-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Cầu thủ bóng đá', 'Bình Định FC', '919191919191', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-03-03', 'Brazil', 'Chủ hộ', 100),
('Sofia', NULL, '1999-01-01', 'Nữ', 'Brazil', 'Brazil', 'Brazil', 'Kinh doanh', '', '919191919192', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-03-03', 'Brazil', 'Vợ', 100),
('Alan Jr', NULL, '2022-01-01', 'Nam', 'Hà Nội', 'Brazil', 'Brazil', 'Ở nhà', '', NULL, NULL, NULL, '2022-01-10', 'Mới sinh', 'Con trai', 100),
('Roberto', NULL, '1970-01-01', 'Nam', 'Brazil', 'Brazil', 'Brazil', 'Nghỉ hưu', '', '919191919193', '2021-01-01', 'Cục CSQLHC về TTXH', '2021-03-03', 'Brazil', 'Bố', 100);


-- =================================================================
-- CẬP NHẬT CHỦ HỘ
-- =================================================================
UPDATE ho_khau SET chu_ho_id = 1 WHERE id = 1;
UPDATE ho_khau SET chu_ho_id = 5 WHERE id = 2;
UPDATE ho_khau SET chu_ho_id = 8 WHERE id = 3;
UPDATE ho_khau SET chu_ho_id = 13 WHERE id = 4;
UPDATE ho_khau SET chu_ho_id = 15 WHERE id = 5;
UPDATE ho_khau SET chu_ho_id = 19 WHERE id = 6;
UPDATE ho_khau SET chu_ho_id = 22 WHERE id = 7;
UPDATE ho_khau SET chu_ho_id = 27 WHERE id = 8;
UPDATE ho_khau SET chu_ho_id = 31 WHERE id = 9;
UPDATE ho_khau SET chu_ho_id = 35 WHERE id = 10;
UPDATE ho_khau SET chu_ho_id = 38 WHERE id = 11;
UPDATE ho_khau SET chu_ho_id = 40 WHERE id = 12;
UPDATE ho_khau SET chu_ho_id = 44 WHERE id = 13;
UPDATE ho_khau SET chu_ho_id = 47 WHERE id = 14;
UPDATE ho_khau SET chu_ho_id = 52 WHERE id = 15;
UPDATE ho_khau SET chu_ho_id = 53 WHERE id = 16;
UPDATE ho_khau SET chu_ho_id = 57 WHERE id = 17;
UPDATE ho_khau SET chu_ho_id = 60 WHERE id = 18;
UPDATE ho_khau SET chu_ho_id = 64 WHERE id = 19;
UPDATE ho_khau SET chu_ho_id = 66 WHERE id = 20;
UPDATE ho_khau SET chu_ho_id = 71 WHERE id = 21;
UPDATE ho_khau SET chu_ho_id = 74 WHERE id = 22;
UPDATE ho_khau SET chu_ho_id = 78 WHERE id = 23;
UPDATE ho_khau SET chu_ho_id = 80 WHERE id = 24;
UPDATE ho_khau SET chu_ho_id = 81 WHERE id = 25;
UPDATE ho_khau SET chu_ho_id = 86 WHERE id = 26;
UPDATE ho_khau SET chu_ho_id = 90 WHERE id = 27;
UPDATE ho_khau SET chu_ho_id = 93 WHERE id = 28;
UPDATE ho_khau SET chu_ho_id = 97 WHERE id = 29;
UPDATE ho_khau SET chu_ho_id = 99 WHERE id = 30;
UPDATE ho_khau SET chu_ho_id = 102 WHERE id = 31;
UPDATE ho_khau SET chu_ho_id = 106 WHERE id = 32;
UPDATE ho_khau SET chu_ho_id = 108 WHERE id = 33;
UPDATE ho_khau SET chu_ho_id = 111 WHERE id = 34;
UPDATE ho_khau SET chu_ho_id = 116 WHERE id = 35;
UPDATE ho_khau SET chu_ho_id = 119 WHERE id = 36;
UPDATE ho_khau SET chu_ho_id = 123 WHERE id = 37;
UPDATE ho_khau SET chu_ho_id = 125 WHERE id = 38;
UPDATE ho_khau SET chu_ho_id = 128 WHERE id = 39;
UPDATE ho_khau SET chu_ho_id = 132 WHERE id = 40;
UPDATE ho_khau SET chu_ho_id = 135 WHERE id = 41;
UPDATE ho_khau SET chu_ho_id = 137 WHERE id = 42;
UPDATE ho_khau SET chu_ho_id = 141 WHERE id = 43;
UPDATE ho_khau SET chu_ho_id = 142 WHERE id = 44;
UPDATE ho_khau SET chu_ho_id = 145 WHERE id = 45;
UPDATE ho_khau SET chu_ho_id = 149 WHERE id = 46;
UPDATE ho_khau SET chu_ho_id = 151 WHERE id = 47;
UPDATE ho_khau SET chu_ho_id = 154 WHERE id = 48;
UPDATE ho_khau SET chu_ho_id = 159 WHERE id = 49;
UPDATE ho_khau SET chu_ho_id = 162 WHERE id = 50;
UPDATE ho_khau SET chu_ho_id = 166 WHERE id = 51;
UPDATE ho_khau SET chu_ho_id = 170 WHERE id = 52;
UPDATE ho_khau SET chu_ho_id = 173 WHERE id = 53;
UPDATE ho_khau SET chu_ho_id = 175 WHERE id = 54;
UPDATE ho_khau SET chu_ho_id = 180 WHERE id = 55;
UPDATE ho_khau SET chu_ho_id = 184 WHERE id = 56;
UPDATE ho_khau SET chu_ho_id = 187 WHERE id = 57;
UPDATE ho_khau SET chu_ho_id = 189 WHERE id = 58;
UPDATE ho_khau SET chu_ho_id = 193 WHERE id = 59;
UPDATE ho_khau SET chu_ho_id = 196 WHERE id = 60;
UPDATE ho_khau SET chu_ho_id = 200 WHERE id = 61;
UPDATE ho_khau SET chu_ho_id = 203 WHERE id = 62;
UPDATE ho_khau SET chu_ho_id = 207 WHERE id = 63;
UPDATE ho_khau SET chu_ho_id = 210 WHERE id = 64;
UPDATE ho_khau SET chu_ho_id = 212 WHERE id = 65;
UPDATE ho_khau SET chu_ho_id = 216 WHERE id = 66;
UPDATE ho_khau SET chu_ho_id = 219 WHERE id = 67;
UPDATE ho_khau SET chu_ho_id = 223 WHERE id = 68;
UPDATE ho_khau SET chu_ho_id = 226 WHERE id = 69;
UPDATE ho_khau SET chu_ho_id = 228 WHERE id = 70;
UPDATE ho_khau SET chu_ho_id = 232 WHERE id = 71;
UPDATE ho_khau SET chu_ho_id = 235 WHERE id = 72;
UPDATE ho_khau SET chu_ho_id = 239 WHERE id = 73;
UPDATE ho_khau SET chu_ho_id = 242 WHERE id = 74;
UPDATE ho_khau SET chu_ho_id = 244 WHERE id = 75;
UPDATE ho_khau SET chu_ho_id = 248 WHERE id = 76;
UPDATE ho_khau SET chu_ho_id = 251 WHERE id = 77;
UPDATE ho_khau SET chu_ho_id = 255 WHERE id = 78;
UPDATE ho_khau SET chu_ho_id = 258 WHERE id = 79;
UPDATE ho_khau SET chu_ho_id = 260 WHERE id = 80;
UPDATE ho_khau SET chu_ho_id = 264 WHERE id = 81;
UPDATE ho_khau SET chu_ho_id = 267 WHERE id = 82;
UPDATE ho_khau SET chu_ho_id = 271 WHERE id = 83;
UPDATE ho_khau SET chu_ho_id = 274 WHERE id = 84;
UPDATE ho_khau SET chu_ho_id = 276 WHERE id = 85;
UPDATE ho_khau SET chu_ho_id = 280 WHERE id = 86;
UPDATE ho_khau SET chu_ho_id = 283 WHERE id = 87;
UPDATE ho_khau SET chu_ho_id = 285 WHERE id = 88;
UPDATE ho_khau SET chu_ho_id = 289 WHERE id = 89;
UPDATE ho_khau SET chu_ho_id = 292 WHERE id = 90;
UPDATE ho_khau SET chu_ho_id = 296 WHERE id = 91;
UPDATE ho_khau SET chu_ho_id = 299 WHERE id = 92;
UPDATE ho_khau SET chu_ho_id = 303 WHERE id = 93;
UPDATE ho_khau SET chu_ho_id = 306 WHERE id = 94;
UPDATE ho_khau SET chu_ho_id = 308 WHERE id = 95;
UPDATE ho_khau SET chu_ho_id = 312 WHERE id = 96;
UPDATE ho_khau SET chu_ho_id = 315 WHERE id = 97;
UPDATE ho_khau SET chu_ho_id = 319 WHERE id = 98;
UPDATE ho_khau SET chu_ho_id = 322 WHERE id = 99;
UPDATE ho_khau SET chu_ho_id = 324 WHERE id = 100;


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG users
-- Mật khẩu cho cả 2 tài khoản đều là: 123456
-- =================================================================
INSERT INTO users(username, password, full_name, role) VALUES
('admin', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Tổ trưởng A', 'ROLE_ADMIN'),
('ketoan', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Kế toán B', 'ROLE_ACCOUNTANT');


-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG KHOẢN THU (khoan_thu)
-- =================================================================
INSERT INTO khoan_thu(ten_khoan_thu, ngay_tao, loai_khoan_thu, so_tien_tren_mot_nhan_khau) VALUES
('Phí vệ sinh năm 2025', '2025-10-01', 'BAT_BUOC', 6000),
('Ủng hộ ngày Thương binh - Liệt sỹ 27/07', '2025-07-01', 'DONG_GOP', NULL),
('Quỹ khuyến học năm 2025', '2025-08-15', 'DONG_GOP', NULL),
('Phí quản lý chung cư tháng 11/2025', '2025-11-01', 'BAT_BUOC', 150000);


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

-- Cập nhật lại sequence để đảm bảo ID không bị trùng lặp sau khi chèn dữ liệu cứng
-- Sử dụng cách tính toán động để tránh xung đột ID
SELECT setval('ho_khau_id_seq', COALESCE((SELECT MAX(id) FROM ho_khau), 1));
SELECT setval('nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM nhan_khau), 1));
SELECT setval('khoan_thu_id_seq', COALESCE((SELECT MAX(id) FROM khoan_thu), 1));
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('lich_su_bien_dong_nhan_khau_id_seq', COALESCE((SELECT MAX(id) FROM lich_su_bien_dong_nhan_khau), 1));
