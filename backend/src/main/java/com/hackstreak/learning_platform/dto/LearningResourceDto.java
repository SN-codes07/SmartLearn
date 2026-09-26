package com.hackstreak.learning_platform.dto;

public class LearningResourceDto {
    private Long conceptId;
    private String conceptName;
    private String title;
    private String shortExplanation;
    private String example;
    private String practiceHint;

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }
    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getShortExplanation() { return shortExplanation; }
    public void setShortExplanation(String shortExplanation) { this.shortExplanation = shortExplanation; }
    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }
    public String getPracticeHint() { return practiceHint; }
    public void setPracticeHint(String practiceHint) { this.practiceHint = practiceHint; }
}
