package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.*;
import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import com.hackstreak.learning_platform.service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students/{studentId}")
public class LearningController {

    @Autowired
    private PerformanceService performanceService;
    
    @Autowired
    private LearningResourceRepository learningResourceRepository;
    
    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/learning")
    public Map<String, List<LearningResourceDto>> getPersonalizedLearning(@PathVariable Long studentId) {
        LearningProfileDto profile = performanceService.getStudentProfile(studentId);
        
        List<String> weakConceptNames = profile.getKnowledgeGaps().stream()
            .flatMap(gap -> {
                List<String> concepts = new ArrayList<>();
                concepts.addAll(gap.getPrerequisites());
                concepts.add(gap.getConcept());
                return concepts.stream();
            })
            .distinct()
            .collect(Collectors.toList());

        List<LearningResourceDto> resources = new ArrayList<>();
        for (String cName : weakConceptNames) {
            learningResourceRepository.findAll().stream()
                .filter(lr -> lr.getConcept().getName().equals(cName))
                .findFirst()
                .ifPresent(lr -> {
                    LearningResourceDto dto = new LearningResourceDto();
                    dto.setConceptId(lr.getConcept().getId());
                    dto.setConceptName(lr.getConcept().getName());
                    dto.setTitle(lr.getTitle());
                    dto.setShortExplanation(lr.getShortExplanation());
                    dto.setExample(lr.getExample());
                    dto.setPracticeHint(lr.getPracticeHint());
                    resources.add(dto);
                });
        }
        
        Map<String, List<LearningResourceDto>> response = new HashMap<>();
        response.put("resources", resources);
        return response;
    }

    @GetMapping("/learning/{conceptId}")
    public LearningResourceDto getLearningResource(@PathVariable Long studentId, @PathVariable Long conceptId) {
        LearningResource lr = learningResourceRepository.findByConceptId(conceptId)
            .orElseThrow(() -> new RuntimeException("Learning resource not found"));
            
        LearningResourceDto dto = new LearningResourceDto();
        dto.setConceptId(lr.getConcept().getId());
        dto.setConceptName(lr.getConcept().getName());
        dto.setTitle(lr.getTitle());
        dto.setShortExplanation(lr.getShortExplanation());
        dto.setExample(lr.getExample());
        dto.setPracticeHint(lr.getPracticeHint());
        return dto;
    }

    @GetMapping("/practice/{conceptId}")
    public List<Question> getPracticeQuestions(@PathVariable Long studentId, @PathVariable Long conceptId) {
        List<Question> all = questionRepository.findAll().stream()
            .filter(q -> q.getConcept().getId().equals(conceptId))
            .collect(Collectors.toList());
        Collections.shuffle(all);
        return all.stream().limit(5).collect(Collectors.toList());
    }

    @GetMapping("/reassessment/{conceptId}")
    public List<Question> getReassessmentQuestions(@PathVariable Long studentId, @PathVariable Long conceptId) {
        List<Question> all = questionRepository.findAll().stream()
            .filter(q -> q.getConcept().getId().equals(conceptId))
            .collect(Collectors.toList());
        Collections.shuffle(all);
        return all.stream().limit(5).collect(Collectors.toList());
    }
    
    @GetMapping("/adaptive-question")
    public AdaptiveQuestionDto getAdaptiveQuestion(@PathVariable Long studentId, 
                                                   @RequestParam Long conceptId, 
                                                   @RequestParam String difficulty) {
        List<Question> questions = questionRepository.findByConceptIdAndDifficultyLevel(conceptId, difficulty);
        
        if (questions.isEmpty()) {
            questions = questionRepository.findAll().stream()
                .filter(q -> q.getConcept().getId().equals(conceptId))
                .collect(Collectors.toList());
        }

        if (questions.isEmpty()) {
            throw new RuntimeException("No questions found for concept");
        }
        
        Collections.shuffle(questions);
        Question q = questions.get(0);
        
        AdaptiveQuestionDto dto = new AdaptiveQuestionDto();
        dto.setQuestionId(q.getId());
        dto.setConceptId(q.getConcept().getId());
        dto.setConceptName(q.getConcept().getName());
        dto.setQuestionText(q.getText());
        dto.setOptionA(q.getOptionA());
        dto.setOptionB(q.getOptionB());
        dto.setOptionC(q.getOptionC());
        dto.setOptionD(q.getOptionD());
        dto.setDifficulty(q.getDifficultyLevel());
        return dto;
    }

    @GetMapping("/adaptive-check")
    public Map<String, Boolean> checkAnswer(@RequestParam Long questionId, @RequestParam String selectedOption) {
        Question q = questionRepository.findById(questionId).orElseThrow();
        Map<String, Boolean> response = new HashMap<>();
        response.put("isCorrect", q.getCorrectOption().equalsIgnoreCase(selectedOption));
        return response;
    }
}
