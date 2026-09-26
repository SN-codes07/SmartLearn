package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.*;
import com.hackstreak.learning_platform.entity.User;
import com.hackstreak.learning_platform.repository.UserRepository;
import com.hackstreak.learning_platform.service.AdminService;
import com.hackstreak.learning_platform.service.DailyFeedbackService;
import com.hackstreak.learning_platform.service.PerformanceService;
import com.hackstreak.learning_platform.service.RecoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private DailyFeedbackService dailyFeedbackService;

    /**
     * Enforce backend role check: verify against the actual database User record.
     */
    private boolean isAdmin(Long callerId) {
        if (callerId == null) return false;
        Optional<User> caller = userRepository.findById(callerId);
        return caller.isPresent() && "ADMIN".equalsIgnoreCase(caller.get().getRole());
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents(@RequestHeader(value = "X-User-Id", required = false) Long callerId) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @PostMapping("/students")
    public ResponseEntity<?> addStudent(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @RequestBody SignUpRequestDto req) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        try {
            User created = adminService.addStudent(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudent(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        try {
            User s = adminService.getStudentById(id);
            return ResponseEntity.ok(s);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<?> updateStudent(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id,
            @RequestBody StudentUpdateDto req) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Only administrators can modify student profile records.");
        }
        try {
            User updated = adminService.updateStudent(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/students/{id}/progress")
    public ResponseEntity<?> getStudentProgress(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        LearningProfileDto profile = performanceService.getStudentProfile(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/students/{id}/knowledge-map")
    public ResponseEntity<?> getStudentKnowledgeMap(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        KnowledgeMapDto km = recoveryService.getKnowledgeMap(id);
        return ResponseEntity.ok(km);
    }

    @GetMapping("/students/{id}/recovery-plan")
    public ResponseEntity<?> getStudentRecoveryPlan(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        List<RecoveryPlanDto> plans = recoveryService.getRecoveryPlans(id);
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/students/{id}/daily-feedback")
    public ResponseEntity<?> getStudentDailyFeedback(
            @RequestHeader(value = "X-User-Id", required = false) Long callerId,
            @PathVariable Long id) {
        if (!isAdmin(callerId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Admin role required.");
        }
        DailyFeedbackDto feedback = dailyFeedbackService.getDailyFeedback(id);
        return ResponseEntity.ok(feedback);
    }
}
