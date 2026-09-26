package com.hackstreak.learning_platform.dto;

public class PrerequisiteDiagnosisItemDto {
    private Long conceptId;
    private String conceptName;
    private Double mastery;
    private String status; // "MASTERED" or "PREREQUISITE_GAP"
    private boolean isGap;
    private String whyRequired;

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public Double getMastery() { return mastery; }
    public void setMastery(Double mastery) { this.mastery = mastery; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isGap() { return isGap; }
    public void setGap(boolean gap) { isGap = gap; }

    public String getWhyRequired() { return whyRequired; }
    public void setWhyRequired(String whyRequired) { this.whyRequired = whyRequired; }
}
