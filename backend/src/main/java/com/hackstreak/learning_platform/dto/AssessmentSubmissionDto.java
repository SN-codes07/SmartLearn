package com.hackstreak.learning_platform.dto;

import java.util.Map;

public class AssessmentSubmissionDto {
    private String assessmentType;
    private Long subjectId; // null if diagnostic
    private Map<Long, String> answers; // questionId -> selectedOption ("A", "B", etc)

    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }
    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}
