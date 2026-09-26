package com.hackstreak.learning_platform.dto;

import java.util.ArrayList;
import java.util.List;

public class KnowledgeGapDto {
    private Long conceptId;
    private String concept;
    private Double score;
    private String chapterName;
    private String subjectName;
    private String reason;
    private String recommendation;
    private String actionUrl;
    private String practiceUrl;
    private boolean hasPrerequisiteGap;
    private List<String> prerequisites = new ArrayList<>();
    private List<PrerequisiteGapItemDto> prerequisiteDetails = new ArrayList<>();

    public KnowledgeGapDto() {}

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConcept() { return concept; }
    public void setConcept(String concept) { this.concept = concept; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public String getChapterName() { return chapterName; }
    public void setChapterName(String chapterName) { this.chapterName = chapterName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public String getPracticeUrl() { return practiceUrl; }
    public void setPracticeUrl(String practiceUrl) { this.practiceUrl = practiceUrl; }

    public boolean isHasPrerequisiteGap() { return hasPrerequisiteGap; }
    public void setHasPrerequisiteGap(boolean hasPrerequisiteGap) { this.hasPrerequisiteGap = hasPrerequisiteGap; }

    public List<String> getPrerequisites() { return prerequisites; }
    public void setPrerequisites(List<String> prerequisites) { this.prerequisites = prerequisites; }

    public List<PrerequisiteGapItemDto> getPrerequisiteDetails() { return prerequisiteDetails; }
    public void setPrerequisiteDetails(List<PrerequisiteGapItemDto> prerequisiteDetails) { this.prerequisiteDetails = prerequisiteDetails; }
}
