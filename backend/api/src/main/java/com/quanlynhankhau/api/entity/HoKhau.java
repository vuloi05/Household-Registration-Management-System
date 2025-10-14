// src/main/java/com/quanlynhankhau/api/entity/HoKhau.java

package com.quanlynhankhau.api.entity;

import java.time.LocalDate; 
import java.util.List;
// <<<< THAY ĐỔI 1: Xóa import JsonIgnore và thêm import JsonManagedReference >>>>
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;



@Entity
@Table(name = "ho_khau")
@Getter
@Setter
public class HoKhau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String maHoKhau;
    private String diaChi;
    private LocalDate ngayLap; 

    /**
     * Mối quan hệ Một-Một: Mỗi Hộ khẩu có một Chủ hộ.
     * Chủ hộ này là một bản ghi trong bảng NhanKhau.
     * fetch = FetchType.LAZY: chỉ lấy thông tin chủ hộ khi thực sự cần.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chu_ho_id") // Liên kết với cột 'chu_ho_id' trong bảng 'ho_khau'
    private NhanKhau chuHo;

    /**
     * Mối quan hệ Một-Nhiều: Một Hộ khẩu có nhiều Nhân khẩu.
     * @JsonManagedReference: Đánh dấu đây là "phía cha" của mối quan hệ. 
     * Khi chuyển sang JSON, nó sẽ hiển thị danh sách này, nhưng các phần tử con (NhanKhau) 
     * sẽ không hiển thị lại thông tin của Hộ khẩu này, nhờ đó tránh được vòng lặp.
     */
    // <<<< THAY ĐỔI 2: Thay @JsonIgnore bằng @JsonManagedReference >>>>
    @OneToMany(mappedBy = "hoKhau", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("nhanKhau-hoKhau")
    private List<NhanKhau> danhSachNhanKhau;
}