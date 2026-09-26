package com.hackstreak.learning_platform.dto;

public class PrerequisiteGapItemDto {
    private Long conceptId;
    private String name;
    private Double score;
    private String status;
    private boolean gap;
    private String actionUrl;

    public PrerequisiteGapItemDto() {}

    public PrerequisiteGapItemDto(Long conceptId, String name, Double score, String status, boolean gap, String actionUrl) {
        this.conceptId = conceptId;
        this.name = name;
        this.score = score;
        this.status = status;
        this.gap = gap;
        this.actionUrl = actionUrl;
    }

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isGap() { return gap; }
    public void setGap(boolean gap) { this.gap = gap; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
}
