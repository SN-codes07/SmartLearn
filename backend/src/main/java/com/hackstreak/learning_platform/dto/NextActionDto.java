package com.hackstreak.learning_platform.dto;

public class NextActionDto {
    private String title;
    private String reason;
    private String badge; // "CRITICAL PREREQUISITE GAP", "TARGET RECOVERY", "READY FOR REASSESSMENT", "NEXT ADVANCEMENT"
    private String actionType; // "LEARN", "PRACTICE", "REASSESS", "ADAPTIVE", "NEXT"
    private String actionUrl;
    private String buttonText; // "Start Learning", "Practice Now", "Reassess", "Continue Learning"
    private Long conceptId;
    private String conceptName;
    private String chapterName;
    private String subjectName;
    private Double currentMastery;
    private String prerequisiteName;

    public NextActionDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getButtonText() { return buttonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getChapterName() { return chapterName; }
    public void setChapterName(String chapterName) { this.chapterName = chapterName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Double getCurrentMastery() { return currentMastery; }
    public void setCurrentMastery(Double currentMastery) { this.currentMastery = currentMastery; }

    public String getPrerequisiteName() { return prerequisiteName; }
    public void setPrerequisiteName(String prerequisiteName) { this.prerequisiteName = prerequisiteName; }
}
