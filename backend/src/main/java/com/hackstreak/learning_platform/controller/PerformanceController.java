package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.LearningProfileDto;
import com.hackstreak.learning_platform.service.PerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @GetMapping("/{studentId}/profile")
    public LearningProfileDto getStudentProfile(@PathVariable Long studentId) {
        return performanceService.getStudentProfile(studentId);
    }

    @GetMapping("/{studentId}/performance")
    public java.util.List<com.hackstreak.learning_platform.dto.ConceptPerformanceDto> getPerformance(@PathVariable Long studentId) {
        return performanceService.getStudentProfile(studentId).getConcepts();
    }

    @GetMapping("/{studentId}/knowledge-gaps")
    public java.util.Map<String, java.util.List<com.hackstreak.learning_platform.dto.KnowledgeGapDto>> getKnowledgeGaps(@PathVariable Long studentId) {
        java.util.Map<String, java.util.List<com.hackstreak.learning_platform.dto.KnowledgeGapDto>> response = new java.util.HashMap<>();
        response.put("knowledgeGaps", performanceService.getStudentProfile(studentId).getKnowledgeGaps());
        return response;
    }
}
