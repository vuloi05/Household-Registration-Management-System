package com.quanlynhankhau.api.service;

import com.quanlynhankhau.api.dto.BankAccountRequestDTO;
import com.quanlynhankhau.api.dto.BankAccountResponseDTO;
import com.quanlynhankhau.api.entity.BankAccount;
import com.quanlynhankhau.api.entity.NhanKhau;
import com.quanlynhankhau.api.repository.BankAccountRepository;
import com.quanlynhankhau.api.repository.NhanKhauRepository;
import com.quanlynhankhau.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BankAccountService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NhanKhauRepository nhanKhauRepository;

    /**
     * Lấy danh sách tài khoản ngân hàng của user
     */
    public List<BankAccountResponseDTO> getBankAccountsByUserId(Long userId) {
        List<BankAccount> accounts = bankAccountRepository.findByUserId(userId);
        return accounts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tài khoản ngân hàng theo ID
     */
    public BankAccountResponseDTO getBankAccountById(Long id, Long userId) {
        BankAccount account = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản ngân hàng không tồn tại"));
        
        // Kiểm tra quyền truy cập
        if (!account.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền truy cập tài khoản này");
        }
        
        return convertToDTO(account);
    }

    /**
     * Tạo tài khoản ngân hàng mới
     */
    @Transactional
    public BankAccountResponseDTO createBankAccount(BankAccountRequestDTO request, Long userId, String username) {
        // Kiểm tra user tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Validate tên chủ tài khoản phải trùng với tên trên CCCD (nếu là RESIDENT)
        if (username != null && !username.isEmpty()) {
            validateAccountName(request.getAccountName(), username);
        }

        // Kiểm tra số tài khoản đã tồn tại chưa
        bankAccountRepository.findByUserIdAndAccountNumber(userId, request.getAccountNumber())
                .ifPresent(account -> {
                    throw new RuntimeException("Số tài khoản đã tồn tại");
                });

        // Nếu đặt làm mặc định, bỏ mặc định của các tài khoản khác
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            bankAccountRepository.findByUserId(userId).forEach(account -> {
                account.setIsDefault(false);
                bankAccountRepository.save(account);
            });
        }

        BankAccount account = new BankAccount();
        account.setUserId(userId);
        account.setAccountNumber(request.getAccountNumber());
        account.setAccountName(request.getAccountName());
        account.setBankName(request.getBankName());
        account.setBankCode(request.getBankCode());
        account.setBranchName(request.getBranchName());
        account.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        BankAccount savedAccount = bankAccountRepository.save(account);
        return convertToDTO(savedAccount);
    }

    /**
     * Cập nhật tài khoản ngân hàng
     */
    @Transactional
    public BankAccountResponseDTO updateBankAccount(Long id, BankAccountRequestDTO request, Long userId, String username) {
        BankAccount account = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản ngân hàng không tồn tại"));

        // Kiểm tra quyền truy cập
        if (!account.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật tài khoản này");
        }

        // Validate tên chủ tài khoản phải trùng với tên trên CCCD (nếu là RESIDENT)
        if (username != null && !username.isEmpty()) {
            validateAccountName(request.getAccountName(), username);
        }

        // Kiểm tra số tài khoản đã tồn tại chưa (nếu thay đổi)
        if (!account.getAccountNumber().equals(request.getAccountNumber())) {
            bankAccountRepository.findByUserIdAndAccountNumber(userId, request.getAccountNumber())
                    .ifPresent(existingAccount -> {
                        if (!existingAccount.getId().equals(id)) {
                            throw new RuntimeException("Số tài khoản đã tồn tại");
                        }
                    });
        }

        // Nếu đặt làm mặc định, bỏ mặc định của các tài khoản khác
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            bankAccountRepository.findByUserId(userId).forEach(acc -> {
                if (!acc.getId().equals(id)) {
                    acc.setIsDefault(false);
                    bankAccountRepository.save(acc);
                }
            });
        }

        account.setAccountNumber(request.getAccountNumber());
        account.setAccountName(request.getAccountName());
        account.setBankName(request.getBankName());
        account.setBankCode(request.getBankCode());
        account.setBranchName(request.getBranchName());
        account.setIsDefault(request.getIsDefault() != null ? request.getIsDefault() : false);

        BankAccount updatedAccount = bankAccountRepository.save(account);
        return convertToDTO(updatedAccount);
    }

    /**
     * Xóa tài khoản ngân hàng
     */
    @Transactional
    public void deleteBankAccount(Long id, Long userId) {
        BankAccount account = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản ngân hàng không tồn tại"));

        // Kiểm tra quyền truy cập
        if (!account.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa tài khoản này");
        }

        bankAccountRepository.delete(account);
    }

    /**
     * Đặt tài khoản làm mặc định
     */
    @Transactional
    public BankAccountResponseDTO setDefaultBankAccount(Long id, Long userId) {
        BankAccount account = bankAccountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tài khoản ngân hàng không tồn tại"));

        // Kiểm tra quyền truy cập
        if (!account.getUserId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi tài khoản này");
        }

        // Bỏ mặc định của tất cả tài khoản khác
        bankAccountRepository.findByUserId(userId).forEach(acc -> {
            acc.setIsDefault(false);
            bankAccountRepository.save(acc);
        });

        // Đặt tài khoản này làm mặc định
        account.setIsDefault(true);
        BankAccount updatedAccount = bankAccountRepository.save(account);
        return convertToDTO(updatedAccount);
    }

    /**
     * Validate tên chủ tài khoản phải trùng với tên trên CCCD
     */
    private void validateAccountName(String accountName, String cccd) {
        Optional<NhanKhau> nhanKhauOpt = nhanKhauRepository.findByCmndCccd(cccd);
        
        if (nhanKhauOpt.isPresent()) {
            NhanKhau nhanKhau = nhanKhauOpt.get();
            String hoTen = nhanKhau.getHoTen();
            
            if (hoTen != null && !hoTen.isEmpty()) {
                // Chuyển tên trên CCCD thành chữ in hoa và không dấu
                String cccdName = removeVietnameseAccents(hoTen).toUpperCase();
                // Tên chủ tài khoản đã được xử lý thành chữ in hoa và không dấu ở frontend
                String accountNameProcessed = accountName.trim().toUpperCase();
                
                if (!accountNameProcessed.equals(cccdName)) {
                    throw new RuntimeException(
                        "Tên chủ tài khoản ngân hàng của bạn phải trùng với tên trên CCCD của bạn.\n" +
                        "Tên trên CCCD: " + hoTen + "\n" +
                        "Tên cần nhập: " + cccdName
                    );
                }
            }
        }
    }

    /**
     * Loại bỏ dấu tiếng Việt và chuyển thành chữ in hoa
     */
    private String removeVietnameseAccents(String str) {
        if (str == null) return "";
        
        // Normalize và loại bỏ dấu
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        
        // Thay thế đ/Đ
        withoutAccents = withoutAccents.replace("đ", "d").replace("Đ", "D");
        
        return withoutAccents;
    }

    /**
     * Chuyển đổi Entity sang DTO
     */
    private BankAccountResponseDTO convertToDTO(BankAccount account) {
        BankAccountResponseDTO dto = new BankAccountResponseDTO();
        dto.setId(account.getId());
        dto.setUserId(account.getUserId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountName(account.getAccountName());
        dto.setBankName(account.getBankName());
        dto.setBankCode(account.getBankCode());
        dto.setBranchName(account.getBranchName());
        dto.setIsDefault(account.getIsDefault());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());
        return dto;
    }
}

