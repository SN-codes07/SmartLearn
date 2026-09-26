package com.hackstreak.learning_platform.service;

import com.hackstreak.learning_platform.dto.LearningProfileDto;
import com.hackstreak.learning_platform.dto.SignUpRequestDto;
import com.hackstreak.learning_platform.dto.StudentSummaryDto;
import com.hackstreak.learning_platform.dto.StudentUpdateDto;
import com.hackstreak.learning_platform.entity.AssessmentAttempt;
import com.hackstreak.learning_platform.entity.User;
import com.hackstreak.learning_platform.repository.AssessmentAttemptRepository;
import com.hackstreak.learning_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @Transactional(readOnly = true)
    public List<StudentSummaryDto> getAllStudents() {
        List<User> students = userRepository.findByRole("STUDENT");
        List<StudentSummaryDto> summaries = new ArrayList<>();

        for (User s : students) {
            StudentSummaryDto dto = new StudentSummaryDto();
            dto.setId(s.getId());
            dto.setName(s.getName());
            dto.setStudentId(s.getStudentId());
            dto.setEmail(s.getEmail());
            dto.setAcademicYear(s.getAcademicYear());
            dto.setDepartment(s.getDepartment());
            dto.setCreatedAt(s.getCreatedAt());

            try {
                LearningProfileDto profile = performanceService.getStudentProfile(s.getId());
                int totalConcepts = profile.getConcepts() != null ? profile.getConcepts().size() : 0;
                long mastered = profile.getConcepts() != null 
                        ? profile.getConcepts().stream().filter(c -> "MASTERED".equalsIgnoreCase(c.getStatus())).count() 
                        : 0;
                int gaps = profile.getKnowledgeGaps() != null ? profile.getKnowledgeGaps().size() : 0;

                dto.setTotalConcepts(totalConcepts);
                dto.setMasteredCount((int) mastered);
                dto.setGapsCount(gaps);

                double mastery = totalConcepts > 0 ? ((double) mastered / totalConcepts) * 100.0 : 0.0;
                dto.setOverallMastery(mastery);

                if (mastery >= 75.0 && gaps == 0) {
                    dto.setStatus("MASTERED");
                } else if (gaps > 0) {
                    dto.setStatus("NEEDS ATTENTION");
                } else {
                    dto.setStatus("IN PROGRESS");
                }
            } catch (Exception e) {
                dto.setOverallMastery(0.0);
                dto.setMasteredCount(0);
                dto.setTotalConcepts(0);
                dto.setGapsCount(0);
                dto.setStatus("NEW ENROLLMENT");
            }

            // Find last activity timestamp
            List<AssessmentAttempt> attempts = assessmentAttemptRepository.findByUserIdOrderByCreatedTimestampDesc(s.getId());
            if (!attempts.isEmpty()) {
                dto.setLastActivity(attempts.get(0).getCreatedTimestamp());
            }

            summaries.add(dto);
        }

        // Sort by id asc
        summaries.sort(Comparator.comparing(StudentSummaryDto::getId));
        return summaries;
    }

    @Transactional(readOnly = true)
    public User getStudentById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
    }

    @Transactional
    public User addStudent(SignUpRequestDto req) {
        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student full name is required.");
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Student email is required.");
        }
        if (req.getStudentId() == null || req.getStudentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID is required.");
        }
        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required.");
        }

        String email = req.getEmail().trim().toLowerCase();
        String studentId = req.getStudentId().trim();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A student with this email address already exists.");
        }
        if (userRepository.existsByStudentId(studentId)) {
            throw new IllegalArgumentException("A student with this Student ID already exists.");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(email);
        user.setPassword(req.getPassword());
        user.setRole("STUDENT");
        user.setStudentId(studentId);
        user.setAcademicYear(req.getAcademicYear() != null && !req.getAcademicYear().trim().isEmpty() ? req.getAcademicYear().trim() : "Third Year (TE)");
        user.setDepartment(req.getDepartment() != null && !req.getDepartment().trim().isEmpty() ? req.getDepartment().trim() : "Computer Engineering");

        return userRepository.save(user);
    }

    @Transactional
    public User updateStudent(Long id, StudentUpdateDto req) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            user.setName(req.getName().trim());
        }

        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            Optional<User> existing = userRepository.findByEmail(newEmail);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new IllegalArgumentException("Email is already in use by another account.");
            }
            user.setEmail(newEmail);
        }

        if (req.getStudentId() != null && !req.getStudentId().trim().isEmpty()) {
            String newStudentId = req.getStudentId().trim();
            Optional<User> existing = userRepository.findByStudentId(newStudentId);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                throw new IllegalArgumentException("Student ID is already assigned to another account.");
            }
            user.setStudentId(newStudentId);
        }

        if (req.getAcademicYear() != null && !req.getAcademicYear().trim().isEmpty()) {
            user.setAcademicYear(req.getAcademicYear().trim());
        }

        if (req.getDepartment() != null && !req.getDepartment().trim().isEmpty()) {
            user.setDepartment(req.getDepartment().trim());
        }

        if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
            user.setPassword(req.getPassword().trim());
        }

        return userRepository.save(user);
    }
}
