package com.hackstreak.learning_platform.service;

import com.hackstreak.learning_platform.dto.AuthRequestDto;
import com.hackstreak.learning_platform.dto.AuthResponseDto;
import com.hackstreak.learning_platform.dto.SignUpRequestDto;
import com.hackstreak.learning_platform.entity.User;
import com.hackstreak.learning_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthRequestDto req) {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty() ||
            req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            return new AuthResponseDto(false, "Email and password are required.");
        }

        String input = req.getEmail().trim();
        String emailLower = input.toLowerCase();

        // 1. Try finding by email
        Optional<User> userOpt = userRepository.findByEmail(emailLower);

        // 2. Try finding by studentId (separating login identity from primary key)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentId(input);
        }

        // 3. Fallback for demo format
        if (userOpt.isEmpty() && !input.contains("@")) {
            userOpt = userRepository.findByEmail(emailLower + "@apsit.edu.in");
        }

        if (userOpt.isEmpty()) {
            return new AuthResponseDto(false, "Invalid email/Student ID or password.");
        }

        User user = userOpt.get();
        if (!user.getPassword().equals(req.getPassword())) {
            return new AuthResponseDto(false, "Invalid email/Student ID or password.");
        }

        AuthResponseDto res = new AuthResponseDto(true, "Login successful.");
        res.setToken("tok_" + user.getId() + "_" + System.currentTimeMillis());
        res.setId(user.getId()); // Internal database primary key
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole() != null ? user.getRole() : "STUDENT");
        res.setStudentId(user.getStudentId() != null ? user.getStudentId() : ("ADMIN".equalsIgnoreCase(user.getRole()) ? null : "123456"));
        res.setAcademicYear(user.getAcademicYear());
        res.setDepartment(user.getDepartment());
        return res;
    }

    @Transactional
    public AuthResponseDto signup(SignUpRequestDto req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            return new AuthResponseDto(false, "Full name is required.");
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return new AuthResponseDto(false, "Email is required.");
        }
        if (!req.getEmail().contains("@") || !req.getEmail().contains(".")) {
            return new AuthResponseDto(false, "Please provide a valid email address.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 4) {
            return new AuthResponseDto(false, "Password must be at least 4 characters long.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return new AuthResponseDto(false, "Passwords do not match.");
        }
        if (req.getStudentId() == null || req.getStudentId().trim().isEmpty()) {
            return new AuthResponseDto(false, "Student ID is required.");
        }

        String email = req.getEmail().trim().toLowerCase();
        String studentId = req.getStudentId().trim();

        if (userRepository.existsByEmail(email)) {
            return new AuthResponseDto(false, "An account with this email already exists.");
        }
        if (userRepository.existsByStudentId(studentId)) {
            return new AuthResponseDto(false, "An account with this Student ID already exists.");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPassword(req.getPassword());
        user.setRole("STUDENT"); // Strictly default to STUDENT
        user.setStudentId(studentId);
        user.setAcademicYear(req.getAcademicYear() != null && !req.getAcademicYear().trim().isEmpty() ? req.getAcademicYear().trim() : "Third Year (TE)");
        user.setDepartment(req.getDepartment() != null && !req.getDepartment().trim().isEmpty() ? req.getDepartment().trim() : "Computer Engineering");

        User saved = userRepository.save(user);

        AuthResponseDto res = new AuthResponseDto(true, "Registration successful! You can now log in.");
        res.setId(saved.getId());
        res.setName(saved.getName());
        res.setEmail(saved.getEmail());
        res.setRole(saved.getRole());
        res.setStudentId(saved.getStudentId());
        res.setAcademicYear(saved.getAcademicYear());
        res.setDepartment(saved.getDepartment());
        return res;
    }

    @Transactional(readOnly = true)
    public AuthResponseDto getMe(Long userId) {
        if (userId == null) {
            return new AuthResponseDto(false, "User not specified.");
        }
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return new AuthResponseDto(false, "User not found.");
        }
        User user = userOpt.get();
        AuthResponseDto res = new AuthResponseDto(true, "Profile loaded.");
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole() != null ? user.getRole() : "STUDENT");
        res.setStudentId(user.getStudentId());
        res.setAcademicYear(user.getAcademicYear());
        res.setDepartment(user.getDepartment());
        return res;
    }
}
