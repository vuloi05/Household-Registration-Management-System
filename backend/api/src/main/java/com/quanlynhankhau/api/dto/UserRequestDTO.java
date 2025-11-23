// src/main/java/com/quanlynhankhau/api/dto/UserRequestDTO.java

package com.quanlynhankhau.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {
    private String username;
    private String password;
    private String fullName;
    private String role;
}
