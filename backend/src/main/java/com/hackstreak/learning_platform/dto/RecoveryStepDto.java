package com.hackstreak.learning_platform.dto;

public class RecoveryStepDto {
    private int stepNumber;
    private Long conceptId;
    private String conceptName;
    private String action; // e.g. "Review Theory & Foundations"
    private String actionType; // "LEARN", "PRACTICE", "ADAPTIVE", "REASSESS"
    private String actionUrl; // e.g. "/learning/50"
    private Double currentMastery;
    private String status; // "COMPLETED", "IN_PROGRESS", "PENDING"
    private String reason; // e.g. "Prerequisite gap for Props"

    public int getStepNumber() { return stepNumber; }
    public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public Double getCurrentMastery() { return currentMastery; }
    public void setCurrentMastery(Double currentMastery) { this.currentMastery = currentMastery; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
