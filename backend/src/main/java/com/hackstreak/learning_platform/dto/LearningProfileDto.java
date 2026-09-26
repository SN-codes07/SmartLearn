package com.hackstreak.learning_platform.dto;

import java.util.List;

public class LearningProfileDto {
    private Long studentId;
    private List<SubjectPerformanceDto> subjects;
    private List<ConceptPerformanceDto> concepts;
    private List<KnowledgeGapDto> knowledgeGaps;
    private List<String> recommendations;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public List<SubjectPerformanceDto> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectPerformanceDto> subjects) { this.subjects = subjects; }
    public List<ConceptPerformanceDto> getConcepts() { return concepts; }
    public void setConcepts(List<ConceptPerformanceDto> concepts) { this.concepts = concepts; }
    public List<KnowledgeGapDto> getKnowledgeGaps() { return knowledgeGaps; }
    public void setKnowledgeGaps(List<KnowledgeGapDto> knowledgeGaps) { this.knowledgeGaps = knowledgeGaps; }
    public List<String> getRecommendations() { return recommendations; }
    public void setRecommendations(List<String> recommendations) { this.recommendations = recommendations; }
}
