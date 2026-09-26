package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.AssessmentResultDto;
import com.hackstreak.learning_platform.dto.AssessmentSubmissionDto;
import com.hackstreak.learning_platform.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    @PostMapping("/submit")
    public AssessmentResultDto submitAssessment(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestBody AssessmentSubmissionDto submission) {
        return assessmentService.submitAssessment(submission, userId);
    }

    @GetMapping("/{id}/result")
    public AssessmentResultDto getResult(@PathVariable Long id) {
        return assessmentService.getAssessmentResult(id);
    }
}
