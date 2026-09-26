package com.hackstreak.learning_platform.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyFeedbackDto {
    private Long studentId;
    private String studentName;
    private LocalDate feedbackDate;
    private String todaysProgress;
    private String whatImproved;
    private String needsAttention;
    private String recommendedNextStep;
    private String encouragingSummary;
    private LocalDateTime generatedAt;
    private Boolean isFallback;

    public DailyFeedbackDto() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public LocalDate getFeedbackDate() { return feedbackDate; }
    public void setFeedbackDate(LocalDate feedbackDate) { this.feedbackDate = feedbackDate; }

    public String getTodaysProgress() { return todaysProgress; }
    public void setTodaysProgress(String todaysProgress) { this.todaysProgress = todaysProgress; }

    public String getWhatImproved() { return whatImproved; }
    public void setWhatImproved(String whatImproved) { this.whatImproved = whatImproved; }

    public String getNeedsAttention() { return needsAttention; }
    public void setNeedsAttention(String needsAttention) { this.needsAttention = needsAttention; }

    public String getRecommendedNextStep() { return recommendedNextStep; }
    public void setRecommendedNextStep(String recommendedNextStep) { this.recommendedNextStep = recommendedNextStep; }

    public String getEncouragingSummary() { return encouragingSummary; }
    public void setEncouragingSummary(String encouragingSummary) { this.encouragingSummary = encouragingSummary; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public Boolean getIsFallback() { return isFallback; }
    public void setIsFallback(Boolean isFallback) { this.isFallback = isFallback; }
}
