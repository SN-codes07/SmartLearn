package com.hackstreak.learning_platform.service;

import com.hackstreak.learning_platform.config.DotenvLoader;
import com.hackstreak.learning_platform.dto.*;
import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DailyFeedbackService {

    private static final Logger logger = LoggerFactory.getLogger(DailyFeedbackService.class);

    @Autowired
    private DailyFeedbackRepository dailyFeedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @Value("${ai.api.key:}")
    private String aiApiKeyProperty;

    @Value("${ai.gemini.model:gemini-flash-latest}")
    private String primaryModel;

    private final RestTemplate restTemplate = new RestTemplate();

    @Transactional
    public DailyFeedbackDto getDailyFeedback(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        LocalDate today = LocalDate.now();

        // 1. Check Cache: Return if already generated today
        Optional<DailyFeedback> cached = dailyFeedbackRepository.findByUserIdAndFeedbackDate(studentId, today);
        if (cached.isPresent()) {
            return toDto(cached.get(), student);
        }

        // 2. Load Real Student Learning State
        LearningProfileDto profile = performanceService.getStudentProfile(studentId);
        NextActionDto nextAction = recoveryService.getNextAction(studentId);
        List<AssessmentAttempt> attempts = assessmentAttemptRepository.findByUserIdOrderByCreatedTimestampDesc(studentId);

        List<ConceptPerformanceDto> masteredConcepts = profile.getConcepts().stream()
                .filter(c -> "MASTERED".equalsIgnoreCase(c.getStatus()))
                .collect(Collectors.toList());

        List<ConceptPerformanceDto> weakConcepts = profile.getConcepts().stream()
                .filter(c -> "WEAK".equalsIgnoreCase(c.getStatus()))
                .collect(Collectors.toList());

        List<String> prereqGaps = profile.getKnowledgeGaps().stream()
                .filter(KnowledgeGapDto::isHasPrerequisiteGap)
                .map(KnowledgeGapDto::getConcept)
                .collect(Collectors.toList());

        // 3. Formulate Deterministic Rule-Based Feedback from Actual Database Data
        String progressText;
        if (!attempts.isEmpty()) {
            AssessmentAttempt lastAttempt = attempts.get(0);
            progressText = String.format("You completed an assessment (%s) scoring %.0f%%. Across all evaluated engineering concepts, you currently hold %d mastered topics.",
                    lastAttempt.getAssessmentType(), lastAttempt.getScorePercentage(), masteredConcepts.size());
        } else {
            progressText = String.format("You currently have %d mastered concepts and %d active focus areas across your engineering syllabus.",
                    masteredConcepts.size(), weakConcepts.size());
        }

        String improvedText;
        if (!masteredConcepts.isEmpty()) {
            List<String> topMastered = masteredConcepts.stream()
                    .map(c -> c.getConceptName() + " (" + String.format("%.0f", c.getScore()) + "%)")
                    .limit(3)
                    .collect(Collectors.toList());
            improvedText = "Strong foundations certified: " + String.join(", ", topMastered) + ". You have cleared the prerequisite threshold (≥75%) for these topics.";
        } else {
            improvedText = "You are actively building foundational knowledge across entry-level topics.";
        }

        String attentionText;
        if (!weakConcepts.isEmpty()) {
            List<String> topWeak = weakConcepts.stream()
                    .map(c -> c.getConceptName() + " (" + String.format("%.0f", c.getScore()) + "%)")
                    .limit(3)
                    .collect(Collectors.toList());
            if (!prereqGaps.isEmpty()) {
                attentionText = "Foundational prerequisite gaps blocking advancement in: " + String.join(", ", prereqGaps) + ". Scores needing improvement: " + String.join(", ", topWeak) + ".";
            } else {
                attentionText = "Needs practice: " + String.join(", ", topWeak) + " (<75% mastery standard).";
            }
        } else {
            attentionText = "No active critical weaknesses. Ready to advance to new chapters.";
        }

        String nextStepText = nextAction != null 
                ? (nextAction.getTitle() + " - " + nextAction.getReason())
                : "Continue with the next concept along your learning path.";

        String encouragingText = "Consistent, deliberate practice on weak prerequisites is the most efficient path to engineering mastery. Keep up the momentum!";

        // 4. Try Gemini AI Enhancement (if available and not quota-exhausted)
        boolean usedAi = false;
        String apiKey = resolveKey();

        if (apiKey != null) {
            try {
                String prompt = "You are SmartLearn AI, an educational analytics assistant for engineering students.\n" +
                        "Generate a concise, professional 3-sentence daily feedback summary for student: " + student.getName() + ".\n" +
                        "- Recent Progress: " + progressText + "\n" +
                        "- Mastered Concepts (>=75%): " + improvedText + "\n" +
                        "- Areas Needing Attention (<75%): " + attentionText + "\n" +
                        "- Recommended Next Step: " + nextStepText + "\n\n" +
                        "Rules:\n" +
                        "1. Stick strictly to these factual numbers. Do not invent grades.\n" +
                        "2. Provide an encouraging but professional tone suitable for engineering undergrads.\n" +
                        "3. Explicitly state the recommended next action.";

                String aiResult = callGeminiQuick(apiKey, prompt);
                if (aiResult != null && !aiResult.trim().isEmpty()) {
                    encouragingText = aiResult.trim();
                    usedAi = true;
                }
            } catch (Exception e) {
                logger.warn("[DAILY FEEDBACK] Gemini AI skipped or quota exhausted, using deterministic engine: {}", e.getMessage());
            }
        }

        // 5. Persist to Cache (At most once per day)
        DailyFeedback feedback = new DailyFeedback();
        feedback.setUser(student);
        feedback.setFeedbackDate(today);
        feedback.setTodaysProgress(progressText);
        feedback.setWhatImproved(improvedText);
        feedback.setNeedsAttention(attentionText);
        feedback.setRecommendedNextStep(nextStepText);
        feedback.setEncouragingSummary(encouragingText);
        feedback.setGeneratedAt(LocalDateTime.now());
        feedback.setIsFallback(!usedAi);

        DailyFeedback saved = dailyFeedbackRepository.save(feedback);
        return toDto(saved, student);
    }

    private DailyFeedbackDto toDto(DailyFeedback entity, User student) {
        DailyFeedbackDto dto = new DailyFeedbackDto();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getName());
        dto.setFeedbackDate(entity.getFeedbackDate());
        dto.setTodaysProgress(entity.getTodaysProgress());
        dto.setWhatImproved(entity.getWhatImproved());
        dto.setNeedsAttention(entity.getNeedsAttention());
        dto.setRecommendedNextStep(entity.getRecommendedNextStep());
        dto.setEncouragingSummary(entity.getEncouragingSummary());
        dto.setGeneratedAt(entity.getGeneratedAt());
        dto.setIsFallback(entity.getIsFallback());
        return dto;
    }

    private String callGeminiQuick(String apiKey, String promptText) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + primaryModel + ":generateContent?key=" + apiKey;

        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        Map<String, Object> body = response.getBody();

        if (body != null && body.containsKey("candidates")) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (!candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> candContent = (Map<String, Object>) firstCandidate.get("content");
                if (candContent != null && candContent.containsKey("parts")) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candContent.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        }
        return null;
    }

    private String resolveKey() {
        if (aiApiKeyProperty != null && !aiApiKeyProperty.trim().isEmpty()
                && !aiApiKeyProperty.equalsIgnoreCase("YOUR_API_KEY")
                && !aiApiKeyProperty.equalsIgnoreCase("YOUR_GEMINI_API_KEY")
                && !aiApiKeyProperty.contains("${")) {
            return aiApiKeyProperty.trim();
        }
        return DotenvLoader.getResolvedApiKey();
    }
}
