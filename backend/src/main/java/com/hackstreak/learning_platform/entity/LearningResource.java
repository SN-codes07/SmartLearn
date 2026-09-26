package com.hackstreak.learning_platform.entity;

import jakarta.persistence.*;

@Entity
public class LearningResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    private Concept concept;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String shortExplanation;
    
    @Column(columnDefinition = "TEXT")
    private String example;
    
    @Column(columnDefinition = "TEXT")
    private String practiceHint;
    
    @Column(columnDefinition = "TEXT")
    private String detailedExplanation;
    
    @Column(columnDefinition = "TEXT")
    private String keyPoints;
    
    @Column(columnDefinition = "TEXT")
    private String syntaxOrStructure;
    
    @Column(columnDefinition = "TEXT")
    private String realWorldExample;
    
    @Column(columnDefinition = "TEXT")
    private String workedExample;
    
    @Column(columnDefinition = "TEXT")
    private String commonMistakes;
    
    @Column(columnDefinition = "TEXT")
    private String examPoints;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Concept getConcept() { return concept; }
    public void setConcept(Concept concept) { this.concept = concept; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getShortExplanation() { return shortExplanation; }
    public void setShortExplanation(String shortExplanation) { this.shortExplanation = shortExplanation; }
    public String getExample() { return example; }
    public void setExample(String example) { this.example = example; }
    public String getPracticeHint() { return practiceHint; }
    public void setPracticeHint(String practiceHint) { this.practiceHint = practiceHint; }
    public String getDetailedExplanation() { return detailedExplanation; }
    public void setDetailedExplanation(String detailedExplanation) { this.detailedExplanation = detailedExplanation; }
    public String getKeyPoints() { return keyPoints; }
    public void setKeyPoints(String keyPoints) { this.keyPoints = keyPoints; }
    public String getSyntaxOrStructure() { return syntaxOrStructure; }
    public void setSyntaxOrStructure(String syntaxOrStructure) { this.syntaxOrStructure = syntaxOrStructure; }
    public String getRealWorldExample() { return realWorldExample; }
    public void setRealWorldExample(String realWorldExample) { this.realWorldExample = realWorldExample; }
    public String getWorkedExample() { return workedExample; }
    public void setWorkedExample(String workedExample) { this.workedExample = workedExample; }
    public String getCommonMistakes() { return commonMistakes; }
    public void setCommonMistakes(String commonMistakes) { this.commonMistakes = commonMistakes; }
    public String getExamPoints() { return examPoints; }
    public void setExamPoints(String examPoints) { this.examPoints = examPoints; }
}
