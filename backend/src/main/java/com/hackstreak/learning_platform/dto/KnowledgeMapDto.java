package com.hackstreak.learning_platform.dto;

import java.util.ArrayList;
import java.util.List;

public class KnowledgeMapDto {
    private List<KnowledgeNodeDto> nodes = new ArrayList<>();
    private List<KnowledgeLinkDto> links = new ArrayList<>();

    public List<KnowledgeNodeDto> getNodes() { return nodes; }
    public void setNodes(List<KnowledgeNodeDto> nodes) { this.nodes = nodes; }

    public List<KnowledgeLinkDto> getLinks() { return links; }
    public void setLinks(List<KnowledgeLinkDto> links) { this.links = links; }

    public static class KnowledgeNodeDto {
        private Long id;
        private String name;
        private String subject;
        private String chapter;
        private Double mastery;
        private String status; // "MASTERED", "WEAK", "CURRENT TARGET", "PREREQUISITE GAP", "NOT ATTEMPTED"
        private boolean isGap;
        private String actionUrl;
        private List<Long> prerequisiteIds = new ArrayList<>();
        private List<String> prerequisiteNames = new ArrayList<>();
        private List<Long> dependentIds = new ArrayList<>();
        private List<String> dependentNames = new ArrayList<>();

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public String getChapter() { return chapter; }
        public void setChapter(String chapter) { this.chapter = chapter; }

        public Double getMastery() { return mastery; }
        public void setMastery(Double mastery) { this.mastery = mastery; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public boolean isGap() { return isGap; }
        public void setGap(boolean gap) { isGap = gap; }

        public String getActionUrl() { return actionUrl; }
        public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

        public List<Long> getPrerequisiteIds() { return prerequisiteIds; }
        public void setPrerequisiteIds(List<Long> prerequisiteIds) { this.prerequisiteIds = prerequisiteIds; }

        public List<String> getPrerequisiteNames() { return prerequisiteNames; }
        public void setPrerequisiteNames(List<String> prerequisiteNames) { this.prerequisiteNames = prerequisiteNames; }

        public List<Long> getDependentIds() { return dependentIds; }
        public void setDependentIds(List<Long> dependentIds) { this.dependentIds = dependentIds; }

        public List<String> getDependentNames() { return dependentNames; }
        public void setDependentNames(List<String> dependentNames) { this.dependentNames = dependentNames; }
    }

    public static class KnowledgeLinkDto {
        private Long source; // prerequisite concept id
        private Long target; // dependent concept id
        private String relationship; // "requires"

        public Long getSource() { return source; }
        public void setSource(Long source) { this.source = source; }

        public Long getTarget() { return target; }
        public void setTarget(Long target) { this.target = target; }

        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
    }
}
