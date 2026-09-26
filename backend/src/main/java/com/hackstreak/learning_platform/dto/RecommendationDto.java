package com.hackstreak.learning_platform.dto;

public class RecommendationDto {
    private int priority;
    private String title;
    private String description;
    private String badge;
    private Long conceptId;
    private String conceptName;
    private String chapterName;
    private String subjectName;
    private String actionType; // LEARN, PRACTICE, REASSESS, NEXT
    private String actionButtonText; // "Start Learning", "Practice Now", "Reassess", "Continue Learning"
    private String actionUrl;
    private Double currentMastery;

    public RecommendationDto() {}

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getChapterName() { return chapterName; }
    public void setChapterName(String chapterName) { this.chapterName = chapterName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionButtonText() { return actionButtonText; }
    public void setActionButtonText(String actionButtonText) { this.actionButtonText = actionButtonText; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public Double getCurrentMastery() { return currentMastery; }
    public void setCurrentMastery(Double currentMastery) { this.currentMastery = currentMastery; }
}
