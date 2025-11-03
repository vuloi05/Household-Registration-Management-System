-- =================================================================
-- DỮ LIỆU MẪU CHO BẢNG users
-- Mật khẩu cho cả 2 tài khoản đều là: 123456
-- =================================================================
INSERT INTO users(username, password, full_name, role) VALUES
('admin', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Tổ trưởng A', 'ROLE_ADMIN'),
('ketoan', '$2a$10$JDd/YhSg.GTiEuH22K/POOL0pisEjyhApabrsiyaAxtCOkORCpC2a', 'Kế toán B', 'ROLE_ACCOUNTANT');
