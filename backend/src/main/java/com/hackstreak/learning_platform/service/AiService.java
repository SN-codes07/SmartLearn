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
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${ai.api.key:}")
    private String aiApiKeyProperty;

    @Value("${ai.gemini.model:gemini-flash-latest}")
    private String primaryModel;

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private RecoveryService recoveryService;

    @Autowired
    private ConceptRepository conceptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private LearningResourceRepository learningResourceRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public AiResponseDto getChatResponse(Long studentId, String userMessage, Long contextConceptId) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return new AiResponseDto(false, "Student message cannot be empty.");
        }

        Long sid = studentId != null ? studentId : 1L;

        // 1. Load Student Learning Profile & Next Action
        LearningProfileDto profile = null;
        try {
            profile = performanceService.getStudentProfile(sid);
        } catch (Exception e) {
            logger.warn("[AI] Could not load profile for student {}, proceeding with general context: {}", sid, e.getMessage());
        }

        NextActionDto nextAction = null;
        try {
            nextAction = recoveryService.getNextAction(sid);
        } catch (Exception e) {
            logger.warn("[AI] Could not load next action: {}", e.getMessage());
        }

        // 2. Load Concept Context
        String subjectName = "Engineering / General";
        String chapterName = "General Topics";
        String conceptName = "General Engineering";

        if (contextConceptId != null) {
            Concept concept = conceptRepository.findById(contextConceptId).orElse(null);
            if (concept != null) {
                conceptName = concept.getName();
                if (concept.getChapter() != null) {
                    chapterName = concept.getChapter().getName();
                    if (concept.getChapter().getSubject() != null) {
                        subjectName = concept.getChapter().getSubject().getName();
                    }
                }
            }
        }

        // Build knowledge profile strings
        String weakConceptsWithScores = "None";
        String prereqGaps = "None";
        String masteredConcepts = "None";

        if (profile != null) {
            List<String> weaks = profile.getConcepts().stream()
                    .filter(c -> "WEAK".equals(c.getStatus()))
                    .map(c -> c.getConceptName() + " (" + String.format("%.0f", c.getScore()) + "%)")
                    .collect(Collectors.toList());
            if (!weaks.isEmpty()) weakConceptsWithScores = String.join(", ", weaks);

            List<String> gaps = profile.getKnowledgeGaps().stream()
                    .flatMap(g -> g.getPrerequisites().stream())
                    .distinct()
                    .collect(Collectors.toList());
            if (!gaps.isEmpty()) prereqGaps = String.join(", ", gaps);

            List<String> mastered = profile.getConcepts().stream()
                    .filter(c -> "MASTERED".equals(c.getStatus()))
                    .map(c -> c.getConceptName() + " (" + String.format("%.0f", c.getScore()) + "%)")
                    .collect(Collectors.toList());
            if (!mastered.isEmpty()) masteredConcepts = String.join(", ", mastered);
        }

        String nextActionText = nextAction != null ? (nextAction.getTitle() + " - " + nextAction.getReason()) : "Continue learning path";

        // 3. Construct Structured Engineering Education Prompt
        String prompt = "You are SmartLearn AI Tutor, a personalized AI teaching assistant for undergraduate engineering students.\n\n" +
                "STUDENT KNOWLEDGE PROFILE (Strict 75% Mastery Standard):\n" +
                "- Current Subject: " + subjectName + "\n" +
                "- Current Chapter: " + chapterName + "\n" +
                "- Context Concept: " + conceptName + "\n" +
                "- Mastered Concepts (>=75%): " + masteredConcepts + "\n" +
                "- Weak Concepts (<75%): " + weakConceptsWithScores + "\n" +
                "- Active Prerequisite Gaps: " + prereqGaps + "\n" +
                "- Recommended Next Action: " + nextActionText + "\n\n" +
                "STUDENT REQUEST:\n" + userMessage.trim() + "\n\n" +
                "PEDAGOGICAL INSTRUCTIONS:\n" +
                "1. If the student asks 'What should I learn next?', guide them using their Recommended Next Action and explain why based on their mastery scores.\n" +
                "2. If the student asks 'Why am I struggling with this?' or 'Which prerequisite should I study?', explain how missing prerequisites are blocking their understanding.\n" +
                "3. If the student asks to 'Explain this concept based on my weak areas', teach " + conceptName + " by first reviewing their weak prerequisite foundations.\n" +
                "4. If the student asks for practice questions, provide an engineering question for their weakest area with full solution breakdown.\n" +
                "5. Connect new ideas to their already mastered concepts.\n" +
                "6. Format code, mathematical expressions, or SQL cleanly.";

        // 4. Try Gemini API
        String apiKey = resolveKey();
        if (apiKey != null) {
            String[] candidateModels = new String[]{primaryModel, "gemini-flash-latest", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.8-flash"};

            for (String model : candidateModels) {
                try {
                    String generatedText = callGeminiApi(model, apiKey, prompt);
                    if (generatedText != null && !generatedText.trim().isEmpty()) {
                        return new AiResponseDto(true, generatedText.trim());
                    }
                } catch (Exception ex) {
                    logger.warn("[AI] Gemini model {} call failed: {}", model, ex.getMessage());
                }
            }
        }

        // 5. Intelligent Pedagogical Fallback when API key quota is exhausted (429) or offline
        String fallback = generatePedagogicalResponse(sid, userMessage.trim(), contextConceptId, profile, nextAction);
        return new AiResponseDto(true, fallback);
    }

    private String generatePedagogicalResponse(Long studentId, String query, Long contextConceptId, LearningProfileDto profile, NextActionDto nextAction) {
        String lower = query.toLowerCase();

        // Query: "What should I learn next?" or similar
        if (lower.contains("next") || lower.contains("what should i learn") || lower.contains("what should i do")) {
            if (nextAction != null) {
                return "### ⚡ Recommended Next Action\n\n" +
                        "Based on your current performance and prerequisite relationships, your highest priority is:\n\n" +
                        "**" + nextAction.getTitle() + "**\n\n" +
                        nextAction.getReason() + "\n\n" +
                        "- **Status**: `" + nextAction.getBadge() + "`\n" +
                        "- **Threshold Standard**: Requires ≥ 75% score for mastery\n\n" +
                        "👉 Click **" + (nextAction.getButtonText() != null ? nextAction.getButtonText() : "Start Learning") + "** on your dashboard or navigate to `" + nextAction.getActionUrl() + "` to begin!";
            }
        }

        // Query: "Why am I struggling?" or "Why"
        if (lower.contains("struggling") || lower.contains("why") || lower.contains("prerequisite")) {
            List<RecoveryPlanDto> plans = recoveryService.getRecoveryPlans(studentId);
            if (!plans.isEmpty()) {
                RecoveryPlanDto top = plans.get(0);
                StringBuilder sb = new StringBuilder();
                sb.append("### 🔍 Root Cause & Prerequisite Diagnosis\n\n");
                sb.append("You are currently struggling in **").append(top.getWeakConceptName())
                  .append("** (Mastery: ").append(String.format("%.0f", top.getCurrentMastery())).append("%).\n\n");
                sb.append(top.getRootCauseSummary()).append("\n\n");
                if (top.getPrerequisiteDiagnosis() != null && !top.getPrerequisiteDiagnosis().isEmpty()) {
                    sb.append("**Prerequisite Status Breakdown:**\n");
                    for (PrerequisiteDiagnosisItemDto item : top.getPrerequisiteDiagnosis()) {
                        sb.append("- ").append(item.isGap() ? "❌ **" : "✅ ")
                          .append(item.getConceptName()).append("** (")
                          .append(String.format("%.0f", item.getMastery())).append("%): ")
                          .append(item.getStatus()).append("\n");
                    }
                    sb.append("\n**Recommendation:** Master the foundational prerequisite first to unlock success in ").append(top.getWeakConceptName()).append("!");
                }
                return sb.toString();
            }
        }

        // Query: "Give me practice for my weakest concept"
        if (lower.contains("practice") || lower.contains("quiz") || lower.contains("question")) {
            List<RecoveryPlanDto> plans = recoveryService.getRecoveryPlans(studentId);
            Long targetConceptId = (contextConceptId != null) ? contextConceptId : (!plans.isEmpty() ? plans.get(0).getWeakConceptId() : 15L);
            Concept concept = conceptRepository.findById(targetConceptId).orElse(null);

            if (concept != null) {
                List<Question> questions = questionRepository.findByConceptIdAndDifficultyLevel(concept.getId(), "EASY");
                if (questions.isEmpty()) {
                    questions = questionRepository.findAll().stream()
                            .filter(q -> q.getConcept() != null && q.getConcept().getId().equals(concept.getId()))
                            .collect(Collectors.toList());
                }

                if (!questions.isEmpty()) {
                    Question q = questions.get(0);
                    return "### 🎯 Targeted Practice Question: " + concept.getName() + "\n\n" +
                            "**Question:**\n" + q.getText() + "\n\n" +
                            "- **A)** " + q.getOptionA() + "\n" +
                            "- **B)** " + q.getOptionB() + "\n" +
                            "- **C)** " + q.getOptionC() + "\n" +
                            "- **D)** " + q.getOptionD() + "\n\n" +
                            "💡 *Try solving this question! Navigate to `" + "/practice/" + concept.getId() + "` for interactive checking and immediate misconception feedback.*";
                }
            }
        }

        // Context Concept Explanation / "Explain this concept based on my weak areas"
        Long targetConceptId = contextConceptId;
        if (targetConceptId == null) {
            List<RecoveryPlanDto> plans = recoveryService.getRecoveryPlans(studentId);
            if (!plans.isEmpty()) targetConceptId = plans.get(0).getWeakConceptId();
        }

        if (targetConceptId != null) {
            Concept concept = conceptRepository.findById(targetConceptId).orElse(null);
            if (concept != null) {
                Optional<LearningResource> optRes = learningResourceRepository.findByConceptId(concept.getId());
                if (optRes.isPresent()) {
                    LearningResource res = optRes.get();
                    return "### 📘 Personalized Study Guide: " + concept.getName() + "\n\n" +
                            (res.getShortExplanation() != null ? "**Definition / Core Idea:**\n" + res.getShortExplanation() + "\n\n" : "") +
                            (res.getDetailedExplanation() != null ? "**Detailed Explanation:**\n" + res.getDetailedExplanation() + "\n\n" : "") +
                            (res.getSyntaxOrStructure() != null ? "**Syntax / Structure:**\n```\n" + res.getSyntaxOrStructure() + "\n```\n\n" : "") +
                            (res.getRealWorldExample() != null ? "**Real-World Application:**\n" + res.getRealWorldExample() + "\n\n" : "") +
                            (res.getCommonMistakes() != null ? "⚠️ **Common Mistakes:**\n" + res.getCommonMistakes() + "\n\n" : "") +
                            "💡 *Next step: Test your understanding with targeted practice questions at `/practice/" + concept.getId() + "`!*";
                }
            }
        }

        return "### 🤖 SmartLearn AI Tutor\n\n" +
                "I am tracking your learning progress across all engineering subjects based on the **75% mastery standard**.\n\n" +
                (nextAction != null ? "**Next Recommended Step:** " + nextAction.getTitle() + " (" + nextAction.getReason() + ")\n\n" : "") +
                "You can ask me:\n" +
                "- *'What should I learn next?'*\n" +
                "- *'Why am I struggling with this?'*\n" +
                "- *'Which prerequisite should I study?'*\n" +
                "- *'Explain this concept based on my weak areas.'*\n" +
                "- *'Give me practice for my weakest concept.'*";
    }

    private String callGeminiApi(String model, String apiKey, String promptText) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

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
