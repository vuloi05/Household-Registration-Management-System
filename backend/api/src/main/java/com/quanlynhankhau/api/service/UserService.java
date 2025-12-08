package com.quanlynhankhau.api.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quanlynhankhau.api.dto.UserDTO;
import com.quanlynhankhau.api.dto.UserRequestDTO;
import com.quanlynhankhau.api.entity.User;
import com.quanlynhankhau.api.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get all users with pagination and optional search
    public Page<UserDTO> getAllUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        List<User> allUsers = userRepository.findAll();

        // Filter by search if provided
        List<User> filteredUsers = allUsers;
        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.toLowerCase();
            filteredUsers = allUsers.stream()
                    .filter(user -> user.getUsername().toLowerCase().contains(lowerSearch)
                            || (user.getFullName() != null && user.getFullName().toLowerCase().contains(lowerSearch))
                            || user.getRole().toLowerCase().contains(lowerSearch))
                    .toList();
        }

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredUsers.size());
        List<User> paginatedUsers = filteredUsers.subList(start, end);

        // Convert to DTO
        List<UserDTO> userDTOs = paginatedUsers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageable, filteredUsers.size());
    }

    // Get user by ID
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        return convertToDTO(user);
    }

    // Create new user
    public UserDTO createUser(UserRequestDTO userRequest) {
        // Check if username already exists
        if (userRepository.findByUsername(userRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại: " + userRequest.getUsername());
        }

        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setRole(userRequest.getRole());

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // Update existing user
    public UserDTO updateUser(Long id, UserRequestDTO userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

        // Check if username is being changed and if it's already taken
        if (!user.getUsername().equals(userRequest.getUsername())) {
            if (userRepository.findByUsername(userRequest.getUsername()).isPresent()) {
                throw new RuntimeException("Tên đăng nhập đã tồn tại: " + userRequest.getUsername());
            }
            user.setUsername(userRequest.getUsername());
        }

        // Only update password if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }

        user.setFullName(userRequest.getFullName());
        user.setRole(userRequest.getRole());

        User updatedUser = userRepository.save(user);
        return convertToDTO(updatedUser);
    }

    // Delete user
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
        userRepository.delete(user);
    }

    // Convert entity to DTO (without password)
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole());
    }
}
