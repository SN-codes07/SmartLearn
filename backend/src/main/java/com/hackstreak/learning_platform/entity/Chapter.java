package com.hackstreak.learning_platform.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Subject subject;
    
    @OneToMany(mappedBy = "chapter", cascade = CascadeType.ALL)
    private List<Concept> concepts;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }
    public List<Concept> getConcepts() { return concepts; }
    public void setConcepts(List<Concept> concepts) { this.concepts = concepts; }
}
