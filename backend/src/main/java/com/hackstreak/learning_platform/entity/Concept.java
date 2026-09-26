package com.hackstreak.learning_platform.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Concept {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Chapter chapter;
    
    @ManyToMany
    @JoinTable(
        name = "concept_prerequisites",
        joinColumns = @JoinColumn(name = "concept_id"),
        inverseJoinColumns = @JoinColumn(name = "prerequisite_id")
    )
    private List<Concept> prerequisites;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Chapter getChapter() { return chapter; }
    public void setChapter(Chapter chapter) { this.chapter = chapter; }
    public List<Concept> getPrerequisites() { return prerequisites; }
    public void setPrerequisites(List<Concept> prerequisites) { this.prerequisites = prerequisites; }
}
