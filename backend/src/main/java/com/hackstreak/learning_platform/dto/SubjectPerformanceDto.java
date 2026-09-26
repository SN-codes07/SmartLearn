package com.hackstreak.learning_platform.dto;

public class SubjectPerformanceDto {
    private String subjectName;
    private Double score;
    private String status; // "MASTERED" or "WEAK"

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
