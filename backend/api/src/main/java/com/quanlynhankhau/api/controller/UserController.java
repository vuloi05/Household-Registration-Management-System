// src/main/java/com/quanlynhankhau/api/controller/UserController.java

package com.quanlynhankhau.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.quanlynhankhau.api.dto.UserDTO;
import com.quanlynhankhau.api.dto.UserRequestDTO;
import com.quanlynhankhau.api.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    // API 1: Get all users with pagination and search
    // Method: GET
    // URL: http://localhost:8080/api/users?page=0&size=10&search=admin
    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Page<UserDTO> users = userService.getAllUsers(page, size, search);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // API 2: Get user by ID
    // Method: GET
    // URL: http://localhost:8080/api/users/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // API 3: Create new user
    // Method: POST
    // URL: http://localhost:8080/api/users
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserRequestDTO userRequest) {
        UserDTO createdUser = userService.createUser(userRequest);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    // API 4: Update existing user
    // Method: PUT
    // URL: http://localhost:8080/api/users/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserRequestDTO userRequest) {
        UserDTO updatedUser = userService.updateUser(id, userRequest);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    // API 5: Delete user
    // Method: DELETE
    // URL: http://localhost:8080/api/users/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
