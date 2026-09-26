package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.config.DotenvLoader;
import com.hackstreak.learning_platform.dto.AiResponseDto;
import com.hackstreak.learning_platform.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @PostMapping("/chat")
    public AiResponseDto chat(@RequestBody Map<String, Object> payload) {
        if (payload == null || !payload.containsKey("message")) {
            return new AiResponseDto(false, "Request must contain a 'message' field.");
        }

        String message = (String) payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return new AiResponseDto(false, "Message cannot be empty.");
        }

        // Student ID (default 1L for demo student)
        Number sid = (Number) payload.get("studentId");
        Long studentId = sid != null ? sid.longValue() : 1L;

        // Support both currentConceptId and contextConceptId
        Number cid = (Number) payload.get("currentConceptId");
        if (cid == null) {
            cid = (Number) payload.get("contextConceptId");
        }
        Long conceptId = cid != null ? cid.longValue() : null;

        return aiService.getChatResponse(studentId, message, conceptId);
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", DotenvLoader.isConfigured());
        status.put("source", DotenvLoader.getSourceDescription());
        return status;
    }
}
