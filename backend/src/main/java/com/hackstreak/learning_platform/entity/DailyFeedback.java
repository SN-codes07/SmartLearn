package com.hackstreak.learning_platform.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_feedback", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "feedback_date"})
})
public class DailyFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "feedback_date", nullable = false)
    private LocalDate feedbackDate;

    @Column(columnDefinition = "TEXT")
    private String todaysProgress;

    @Column(columnDefinition = "TEXT")
    private String whatImproved;

    @Column(columnDefinition = "TEXT")
    private String needsAttention;

    @Column(columnDefinition = "TEXT")
    private String recommendedNextStep;

    @Column(columnDefinition = "TEXT")
    private String encouragingSummary;

    private LocalDateTime generatedAt;

    private Boolean isFallback = false;

    public DailyFeedback() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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
