package com.quanlynhankhau.api.controller;

import com.quanlynhankhau.api.dto.BankAccountRequestDTO;
import com.quanlynhankhau.api.dto.BankAccountResponseDTO;
import com.quanlynhankhau.api.repository.UserRepository;
import com.quanlynhankhau.api.service.BankAccountService;
import com.quanlynhankhau.api.service.NhanKhauService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bank-accounts")
@CrossOrigin(origins = "*")
public class BankAccountController {

    @Autowired
    private BankAccountService bankAccountService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NhanKhauService nhanKhauService;

    /**
     * Lấy danh sách tài khoản ngân hàng của user hiện tại
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<List<BankAccountResponseDTO>> getBankAccounts(Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            List<BankAccountResponseDTO> accounts = bankAccountService.getBankAccountsByUserId(userId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Lấy tài khoản ngân hàng theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> getBankAccountById(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            BankAccountResponseDTO account = bankAccountService.getBankAccountById(id, userId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Tạo tài khoản ngân hàng mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> createBankAccount(
            @RequestBody BankAccountRequestDTO request,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            String username = authentication.getName(); // username là CCCD đối với RESIDENT
            BankAccountResponseDTO account = bankAccountService.createBankAccount(request, userId, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(account);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Cập nhật tài khoản ngân hàng
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> updateBankAccount(
            @PathVariable Long id,
            @RequestBody BankAccountRequestDTO request,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            String username = authentication.getName(); // username là CCCD đối với RESIDENT
            BankAccountResponseDTO account = bankAccountService.updateBankAccount(id, request, userId, username);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Xóa tài khoản ngân hàng
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> deleteBankAccount(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            bankAccountService.deleteBankAccount(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Đặt tài khoản làm mặc định
     */
    @PutMapping("/{id}/set-default")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> setDefaultBankAccount(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            BankAccountResponseDTO account = bankAccountService.setDefaultBankAccount(id, userId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Lấy thông tin nhân khẩu của chính mình (để validate tên chủ tài khoản)
     * Chỉ trả về thông tin của chính user đang đăng nhập (dựa trên CCCD)
     */
    @GetMapping("/my-nhankhau-info")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'RESIDENT')")
    public ResponseEntity<?> getMyNhanKhauInfo(Authentication authentication) {
        try {
            String username = authentication.getName(); // username là CCCD đối với RESIDENT
            var nhanKhauOpt = nhanKhauService.findByCmndCccd(username);
            
            if (nhanKhauOpt.isPresent()) {
                var nhanKhau = nhanKhauOpt.get();
                Map<String, String> response = new HashMap<>();
                response.put("hoTen", nhanKhau.getHoTen());
                response.put("cmndCccd", nhanKhau.getCmndCccd());
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Không tìm thấy thông tin nhân khẩu");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy userId từ Authentication
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
    }
}

