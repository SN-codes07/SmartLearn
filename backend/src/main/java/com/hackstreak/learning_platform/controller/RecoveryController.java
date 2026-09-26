package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.*;
import com.hackstreak.learning_platform.entity.Question;
import com.hackstreak.learning_platform.repository.QuestionRepository;
import com.hackstreak.learning_platform.service.RecoveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students/{studentId}")
public class RecoveryController {

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/recovery-plan")
    public List<RecoveryPlanDto> getRecoveryPlan(@PathVariable Long studentId) {
        return recoveryService.getRecoveryPlans(studentId);
    }

    @GetMapping("/next-action")
    public NextActionDto getNextAction(@PathVariable Long studentId) {
        return recoveryService.getNextAction(studentId);
    }

    @GetMapping("/recommendations")
    public List<RecommendationDto> getRecommendations(@PathVariable Long studentId) {
        return recoveryService.getPersonalizedRecommendations(studentId);
    }

    @GetMapping("/knowledge-map")
    public KnowledgeMapDto getKnowledgeMap(@PathVariable Long studentId) {
        return recoveryService.getKnowledgeMap(studentId);
    }

    @PostMapping("/analyze-mistake")
    public MistakeAnalysisDto analyzeMistake(@PathVariable Long studentId, @RequestBody Map<String, Object> payload) {
        Number qid = (Number) payload.get("questionId");
        String selectedOption = (String) payload.get("selectedOption");

        if (qid == null || selectedOption == null) {
            throw new IllegalArgumentException("questionId and selectedOption are required");
        }

        return recoveryService.analyzeMistake(studentId, qid.longValue(), selectedOption);
    }

    @GetMapping("/similar-question/{questionId}")
    public Question getSimilarQuestion(@PathVariable Long studentId, @PathVariable Long questionId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        if (q.getConcept() == null) return q;

        List<Question> candidates = questionRepository.findByConceptIdAndDifficultyLevel(q.getConcept().getId(), q.getDifficultyLevel());
        return candidates.stream()
                .filter(cand -> !cand.getId().equals(questionId))
                .findAny()
                .orElse(q);
    }
}
