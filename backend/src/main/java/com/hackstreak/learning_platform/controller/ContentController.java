package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ContentController {

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private ChapterRepository chapterRepository;

    @Autowired
    private ConceptRepository conceptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/subjects")
    public List<Subject> getSubjects() {
        return subjectRepository.findAll();
    }

    @GetMapping("/subjects/{id}/chapters")
    public List<Chapter> getChapters(@PathVariable Long id) {
        return chapterRepository.findBySubjectId(id);
    }

    @GetMapping("/chapters/{id}/concepts")
    public List<Concept> getConcepts(@PathVariable Long id) {
        return conceptRepository.findByChapterId(id);
    }

    @GetMapping("/questions/diagnostic")
    public List<Question> getDiagnosticQuestions() {
        List<String> subjects = Arrays.asList(
            "Database Management", "Data Structures", "Java", 
            "Python", "React.js", "Automata Theory"
        );
        return questionRepository.findRandomQuestionsBySubjects(subjects, 12);
    }

    @GetMapping("/subjects/{id}/questions")
    public List<Question> getSubjectQuestions(@PathVariable Long id) {
        return questionRepository.findRandomQuestionsBySubjectId(id, 10);
    }
    
    @GetMapping("/curriculum")
    public List<Subject> getCurriculum() {
        return subjectRepository.findAll();
    }
}
