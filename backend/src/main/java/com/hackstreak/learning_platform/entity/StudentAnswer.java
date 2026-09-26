package com.hackstreak.learning_platform.entity;

import jakarta.persistence.*;

@Entity
public class StudentAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_attempt_id")
    private AssessmentAttempt assessmentAttempt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;
    
    private String selectedOption; // e.g. "A", "B", "C", "D"
    private Boolean isCorrect;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AssessmentAttempt getAssessmentAttempt() { return assessmentAttempt; }
    public void setAssessmentAttempt(AssessmentAttempt assessmentAttempt) { this.assessmentAttempt = assessmentAttempt; }
    public Question getQuestion() { return question; }
    public void setQuestion(Question question) { this.question = question; }
    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
}
