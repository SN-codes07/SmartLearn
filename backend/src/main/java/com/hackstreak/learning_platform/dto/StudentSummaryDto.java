package com.hackstreak.learning_platform.dto;

import java.time.LocalDateTime;

public class StudentSummaryDto {
    private Long id;
    private String name;
    private String studentId;
    private String email;
    private String academicYear;
    private String department;
    private Double overallMastery;
    private int masteredCount;
    private int totalConcepts;
    private int gapsCount;
    private String status; // "MASTERED", "IN PROGRESS", "NEEDS ATTENTION"
    private LocalDateTime lastActivity;
    private LocalDateTime createdAt;

    public StudentSummaryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getOverallMastery() { return overallMastery; }
    public void setOverallMastery(Double overallMastery) { this.overallMastery = overallMastery; }

    public int getMasteredCount() { return masteredCount; }
    public void setMasteredCount(int masteredCount) { this.masteredCount = masteredCount; }

    public int getTotalConcepts() { return totalConcepts; }
    public void setTotalConcepts(int totalConcepts) { this.totalConcepts = totalConcepts; }

    public int getGapsCount() { return gapsCount; }
    public void setGapsCount(int gapsCount) { this.gapsCount = gapsCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
