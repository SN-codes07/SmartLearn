package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.DailyFeedbackDto;
import com.hackstreak.learning_platform.service.DailyFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students/{studentId}/daily-feedback")
public class DailyFeedbackController {

    @Autowired
    private DailyFeedbackService dailyFeedbackService;

    @GetMapping
    public ResponseEntity<DailyFeedbackDto> getDailyFeedback(@PathVariable Long studentId) {
        DailyFeedbackDto feedback = dailyFeedbackService.getDailyFeedback(studentId);
        return ResponseEntity.ok(feedback);
    }
}
