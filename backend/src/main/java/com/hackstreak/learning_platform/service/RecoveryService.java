package com.hackstreak.learning_platform.service;

import com.hackstreak.learning_platform.dto.*;
import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecoveryService {

    @Autowired
    private PerformanceService performanceService;

    @Autowired
    private ConceptRepository conceptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private LearningResourceRepository learningResourceRepository;

    private static final double MASTERY_THRESHOLD = 75.0;

    @Transactional(readOnly = true)
    public List<RecoveryPlanDto> getRecoveryPlans(Long studentId) {
        LearningProfileDto profile = performanceService.getStudentProfile(studentId);
        Map<String, ConceptPerformanceDto> scoreMap = profile.getConcepts().stream()
                .collect(Collectors.toMap(ConceptPerformanceDto::getConceptName, c -> c, (c1, c2) -> c1));

        List<RecoveryPlanDto> plans = new ArrayList<>();

        for (ConceptPerformanceDto cp : profile.getConcepts()) {
            if ("WEAK".equalsIgnoreCase(cp.getStatus()) || cp.getScore() < MASTERY_THRESHOLD) {
                Concept concept = conceptRepository.findById(cp.getConceptId()).orElse(null);
                if (concept == null) continue;

                RecoveryPlanDto plan = new RecoveryPlanDto();
                plan.setWeakConceptId(concept.getId());
                plan.setWeakConceptName(concept.getName());
                plan.setCurrentMastery(cp.getScore());
                plan.setStatus("WEAK");
                plan.setSeverity(cp.getScore() < 50.0 ? "CRITICAL" : "MODERATE");

                if (concept.getChapter() != null) {
                    plan.setChapterName(concept.getChapter().getName());
                    if (concept.getChapter().getSubject() != null) {
                        plan.setSubjectName(concept.getChapter().getSubject().getName());
                    }
                }

                // Diagnose Prerequisites
                List<PrerequisiteDiagnosisItemDto> prereqDiagnosis = new ArrayList<>();
                List<Concept> prereqs = concept.getPrerequisites() != null ? concept.getPrerequisites() : Collections.emptyList();
                List<String> gapNames = new ArrayList<>();

                for (Concept p : prereqs) {
                    PrerequisiteDiagnosisItemDto item = new PrerequisiteDiagnosisItemDto();
                    item.setConceptId(p.getId());
                    item.setConceptName(p.getName());

                    ConceptPerformanceDto pScoreDto = scoreMap.get(p.getName());
                    double pScore = pScoreDto != null ? pScoreDto.getScore() : 0.0;
                    item.setMastery(pScore);

                    boolean isMastered = pScore >= MASTERY_THRESHOLD;
                    item.setStatus(isMastered ? "MASTERED" : "PREREQUISITE_GAP");
                    item.setGap(!isMastered);
                    item.setWhyRequired("Foundational prerequisite required to master " + concept.getName());

                    if (!isMastered) {
                        gapNames.add(p.getName() + " (" + String.format("%.0f", pScore) + "%)");
                    }
                    prereqDiagnosis.add(item);
                }
                plan.setPrerequisiteDiagnosis(prereqDiagnosis);

                // Root Cause Analysis Summary
                if (!gapNames.isEmpty()) {
                    plan.setRootCauseSummary("Struggling in " + concept.getName() + " (" + String.format("%.0f", cp.getScore()) + "%) primarily due to foundational gaps in: " 
                            + String.join(", ", gapNames) + ". Resolving these foundations first is required for recovery.");
                } else {
                    plan.setRootCauseSummary("Prerequisites are satisfied. Weakness in " + concept.getName() + " (" + String.format("%.0f", cp.getScore()) + "%) is due to conceptual unfamiliarity. Targeted practice will restore mastery above 75%.");
                }

                // Step-by-Step Learning Recovery Path
                List<RecoveryStepDto> steps = new ArrayList<>();
                int stepNum = 1;

                // Step 1..N: Recover Prerequisite Gaps First
                for (PrerequisiteDiagnosisItemDto gap : prereqDiagnosis) {
                    if (gap.isGap()) {
                        RecoveryStepDto stepLearn = new RecoveryStepDto();
                        stepLearn.setStepNumber(stepNum++);
                        stepLearn.setConceptId(gap.getConceptId());
                        stepLearn.setConceptName(gap.getConceptName());
                        stepLearn.setAction("Review Core Theory & Worked Examples");
                        stepLearn.setActionType("LEARN");
                        stepLearn.setActionUrl("/learning/" + gap.getConceptId());
                        stepLearn.setCurrentMastery(gap.getMastery());
                        stepLearn.setStatus("PENDING");
                        stepLearn.setReason("Recover missing foundation for " + concept.getName());
                        steps.add(stepLearn);

                        RecoveryStepDto stepPractice = new RecoveryStepDto();
                        stepPractice.setStepNumber(stepNum++);
                        stepPractice.setConceptId(gap.getConceptId());
                        stepPractice.setConceptName(gap.getConceptName());
                        stepPractice.setAction("Complete Targeted Foundation Practice");
                        stepPractice.setActionType("PRACTICE");
                        stepPractice.setActionUrl("/practice/" + gap.getConceptId());
                        stepPractice.setCurrentMastery(gap.getMastery());
                        stepPractice.setStatus("PENDING");
                        stepPractice.setReason("Achieve >= 75% on foundation before advancing");
                        steps.add(stepPractice);
                    }
                }

                // Next Step: Study Target Concept
                RecoveryStepDto targetLearn = new RecoveryStepDto();
                targetLearn.setStepNumber(stepNum++);
                targetLearn.setConceptId(concept.getId());
                targetLearn.setConceptName(concept.getName());
                targetLearn.setAction("Deep Dive Learning on " + concept.getName());
                targetLearn.setActionType("LEARN");
                targetLearn.setActionUrl("/learning/" + concept.getId());
                targetLearn.setCurrentMastery(cp.getScore());
                targetLearn.setStatus("PENDING");
                targetLearn.setReason("Learn target concept after foundations are secure");
                steps.add(targetLearn);

                // Next Step: Adaptive Assessment
                RecoveryStepDto targetAdaptive = new RecoveryStepDto();
                targetAdaptive.setStepNumber(stepNum++);
                targetAdaptive.setConceptId(concept.getId());
                targetAdaptive.setConceptName(concept.getName());
                targetAdaptive.setAction("Dynamic Adaptive Assessment (5 Questions)");
                targetAdaptive.setActionType("ADAPTIVE");
                targetAdaptive.setActionUrl("/adaptive-quiz/" + concept.getId());
                targetAdaptive.setCurrentMastery(cp.getScore());
                targetAdaptive.setStatus("PENDING");
                targetAdaptive.setReason("Calibrate difficulty from EASY to HARD");
                steps.add(targetAdaptive);

                // Final Step: Verification Reassessment
                RecoveryStepDto targetReassess = new RecoveryStepDto();
                targetReassess.setStepNumber(stepNum++);
                targetReassess.setConceptId(concept.getId());
                targetReassess.setConceptName(concept.getName());
                targetReassess.setAction("Verification Reassessment (Target >= 75%)");
                targetReassess.setActionType("REASSESS");
                targetReassess.setActionUrl("/reassessment/" + concept.getId());
                targetReassess.setCurrentMastery(cp.getScore());
                targetReassess.setStatus("PENDING");
                targetReassess.setReason("Verify whether weakness has been recovered to MASTERED");
                steps.add(targetReassess);

                plan.setRecoverySteps(steps);
                plan.setReadyForReassessment(gapNames.isEmpty());
                plan.setRecovered(cp.getScore() >= MASTERY_THRESHOLD);

                plans.add(plan);
            }
        }

        // Sort by severity (CRITICAL first, then lowest score)
        plans.sort(Comparator.comparingDouble(RecoveryPlanDto::getCurrentMastery));
        return plans;
    }

    /**
     * Decision priority flow:
     * 1. Identify concepts below 75%.
     * 2. Check whether they have weak prerequisites.
     * 3. If prerequisites are weak, recommend the prerequisite first [Start Learning].
     * 4. If prerequisites are sufficiently mastered, recommend the target concept [Start Learning].
     * 5. If the concept has been learned but remains below 75%, recommend practice [Practice Now].
     * 6. If practice has improved performance, recommend reassessment [Reassess].
     * 7. If reassessment reaches >=75%, mark MASTERED and recommend next dependent concept [Continue Learning].
     * 8. Continuously update recommendations after every assessment, practice, quiz, and reassessment.
     */
    @Transactional(readOnly = true)
    public List<RecommendationDto> getPersonalizedRecommendations(Long studentId) {
        LearningProfileDto profile = performanceService.getStudentProfile(studentId);
        Map<String, ConceptPerformanceDto> scoreMap = profile.getConcepts().stream()
                .collect(Collectors.toMap(ConceptPerformanceDto::getConceptName, c -> c, (c1, c2) -> c1));

        List<Concept> allConcepts = conceptRepository.findAll();
        Map<Long, Concept> conceptById = allConcepts.stream().collect(Collectors.toMap(Concept::getId, c -> c));

        // Track concepts student has attempted
        List<StudentAnswer> answers = studentAnswerRepository.findByStudentId(studentId);
        Set<Long> attemptedConceptIds = answers.stream()
                .map(a -> a.getQuestion().getConcept().getId())
                .collect(Collectors.toSet());

        // Track concepts practiced recently
        Set<Long> practicedConceptIds = answers.stream()
                .filter(a -> a.getAssessmentAttempt() != null && "PRACTICE".equalsIgnoreCase(a.getAssessmentAttempt().getAssessmentType()))
                .map(a -> a.getQuestion().getConcept().getId())
                .collect(Collectors.toSet());

        List<RecommendationDto> recommendations = new ArrayList<>();

        // Group 1 & 2: Concepts below 75%
        for (Concept c : allConcepts) {
            ConceptPerformanceDto perf = scoreMap.get(c.getName());
            double score = perf != null ? perf.getScore() : 0.0;
            boolean isAttempted = attemptedConceptIds.contains(c.getId());

            if (isAttempted && score < MASTERY_THRESHOLD) {
                // Check weak prerequisites
                List<Concept> prereqs = c.getPrerequisites() != null ? c.getPrerequisites() : Collections.emptyList();
                List<Concept> weakPrereqs = new ArrayList<>();

                for (Concept p : prereqs) {
                    ConceptPerformanceDto pPerf = scoreMap.get(p.getName());
                    double pScore = pPerf != null ? pPerf.getScore() : 0.0;
                    if (pScore < MASTERY_THRESHOLD) {
                        weakPrereqs.add(p);
                    }
                }

                if (!weakPrereqs.isEmpty()) {
                    // Priority 1: Weak prerequisite first!
                    for (Concept wp : weakPrereqs) {
                        ConceptPerformanceDto wpPerf = scoreMap.get(wp.getName());
                        double wpScore = wpPerf != null ? wpPerf.getScore() : 0.0;

                        RecommendationDto rec = new RecommendationDto();
                        rec.setPriority(1);
                        rec.setTitle("Review Foundation: " + wp.getName() + " first");
                        rec.setDescription(wp.getName() + " (" + String.format("%.0f", wpScore) 
                                + "% mastery) is a critical prerequisite required for " + c.getName() 
                                + " (" + String.format("%.0f", score) + "%). Master this foundation before proceeding.");
                        rec.setBadge("PREREQUISITE GAP");
                        rec.setConceptId(wp.getId());
                        rec.setConceptName(wp.getName());
                        if (wp.getChapter() != null) {
                            rec.setChapterName(wp.getChapter().getName());
                            if (wp.getChapter().getSubject() != null) {
                                rec.setSubjectName(wp.getChapter().getSubject().getName());
                            }
                        }
                        rec.setActionType("LEARN");
                        rec.setActionButtonText("Start Learning");
                        rec.setActionUrl("/learning/" + wp.getId());
                        rec.setCurrentMastery(wpScore);
                        recommendations.add(rec);
                    }
                } else {
                    // Prerequisites are satisfied!
                    if (practicedConceptIds.contains(c.getId())) {
                        // Priority 2: Student has practiced -> Recommend Verification Reassessment
                        RecommendationDto rec = new RecommendationDto();
                        rec.setPriority(2);
                        rec.setTitle("Reassess " + c.getName());
                        rec.setDescription("You completed practice on " + c.getName() + ". Take the verification reassessment to reach >= 75% and certify mastery.");
                        rec.setBadge("READY FOR REASSESSMENT");
                        rec.setConceptId(c.getId());
                        rec.setConceptName(c.getName());
                        if (c.getChapter() != null) {
                            rec.setChapterName(c.getChapter().getName());
                            if (c.getChapter().getSubject() != null) {
                                rec.setSubjectName(c.getChapter().getSubject().getName());
                            }
                        }
                        rec.setActionType("REASSESS");
                        rec.setActionButtonText("Reassess");
                        rec.setActionUrl("/reassessment/" + c.getId());
                        rec.setCurrentMastery(score);
                        recommendations.add(rec);
                    } else {
                        // Priority 3: Prerequisites satisfied, needs targeted practice
                        RecommendationDto rec = new RecommendationDto();
                        rec.setPriority(3);
                        rec.setTitle("Practice " + c.getName());
                        rec.setDescription("Prerequisites for " + c.getName() + " are satisfied. Complete targeted practice questions with instant misconception analysis to reach >= 75%.");
                        rec.setBadge("PRACTICE NOW");
                        rec.setConceptId(c.getId());
                        rec.setConceptName(c.getName());
                        if (c.getChapter() != null) {
                            rec.setChapterName(c.getChapter().getName());
                            if (c.getChapter().getSubject() != null) {
                                rec.setSubjectName(c.getChapter().getSubject().getName());
                            }
                        }
                        rec.setActionType("PRACTICE");
                        rec.setActionButtonText("Practice Now");
                        rec.setActionUrl("/practice/" + c.getId());
                        rec.setCurrentMastery(score);
                        recommendations.add(rec);
                    }
                }
            }
        }

        // Group 3: Mastered Concepts unlocking dependent concepts
        for (Concept c : allConcepts) {
            ConceptPerformanceDto perf = scoreMap.get(c.getName());
            if (perf != null && perf.getScore() >= MASTERY_THRESHOLD) {
                // Find concepts that have c as a prerequisite
                for (Concept dependent : allConcepts) {
                    if (dependent.getPrerequisites() != null && dependent.getPrerequisites().stream().anyMatch(p -> p.getId().equals(c.getId()))) {
                        ConceptPerformanceDto depPerf = scoreMap.get(dependent.getName());
                        double depScore = depPerf != null ? depPerf.getScore() : 0.0;

                        if (depScore < MASTERY_THRESHOLD) {
                            // Check if all prerequisites of dependent are mastered
                            boolean allPrereqsMastered = dependent.getPrerequisites().stream().allMatch(p -> {
                                ConceptPerformanceDto pp = scoreMap.get(p.getName());
                                return pp != null && pp.getScore() >= MASTERY_THRESHOLD;
                            });

                            if (allPrereqsMastered) {
                                RecommendationDto rec = new RecommendationDto();
                                rec.setPriority(4);
                                rec.setTitle("You are ready to learn: " + dependent.getName());
                                rec.setDescription("You mastered foundational prerequisites (including " + c.getName() 
                                        + "). You are now cleared to learn " + dependent.getName() + ".");
                                rec.setBadge("NEXT TOPIC UNLOCKED");
                                rec.setConceptId(dependent.getId());
                                rec.setConceptName(dependent.getName());
                                if (dependent.getChapter() != null) {
                                    rec.setChapterName(dependent.getChapter().getName());
                                    if (dependent.getChapter().getSubject() != null) {
                                        rec.setSubjectName(dependent.getChapter().getSubject().getName());
                                    }
                                }
                                rec.setActionType("LEARN");
                                rec.setActionButtonText("Start Learning");
                                rec.setActionUrl("/learning/" + dependent.getId());
                                rec.setCurrentMastery(depScore);
                                recommendations.add(rec);
                            }
                        }
                    }
                }
            }
        }

        // Group 4: Unattempted entry concepts with no prerequisites
        for (Concept c : allConcepts) {
            if (!attemptedConceptIds.contains(c.getId())) {
                List<Concept> prereqs = c.getPrerequisites() != null ? c.getPrerequisites() : Collections.emptyList();
                if (prereqs.isEmpty()) {
                    RecommendationDto rec = new RecommendationDto();
                    rec.setPriority(5);
                    rec.setTitle("Start Learning: " + c.getName());
                    rec.setDescription("Foundational topic with zero prerequisite barriers. Explore core concepts and examples.");
                    rec.setBadge("FOUNDATION TOPIC");
                    rec.setConceptId(c.getId());
                    rec.setConceptName(c.getName());
                    if (c.getChapter() != null) {
                        rec.setChapterName(c.getChapter().getName());
                        if (c.getChapter().getSubject() != null) {
                            rec.setSubjectName(c.getChapter().getSubject().getName());
                        }
                    }
                    rec.setActionType("LEARN");
                    rec.setActionButtonText("Start Learning");
                    rec.setActionUrl("/learning/" + c.getId());
                    rec.setCurrentMastery(0.0);
                    recommendations.add(rec);
                }
            }
        }

        // Deduplicate recommendations by actionUrl
        Map<String, RecommendationDto> uniqueRecs = new LinkedHashMap<>();
        for (RecommendationDto r : recommendations) {
            uniqueRecs.putIfAbsent(r.getActionUrl(), r);
        }

        List<RecommendationDto> sorted = new ArrayList<>(uniqueRecs.values());
        sorted.sort(Comparator.comparingInt(RecommendationDto::getPriority)
                .thenComparingDouble(RecommendationDto::getCurrentMastery));

        if (sorted.isEmpty()) {
            RecommendationDto fallback = new RecommendationDto();
            fallback.setPriority(6);
            fallback.setTitle("Continue Your Learning Path");
            fallback.setDescription("All attempted concepts meet or exceed the 75% threshold. Explore new engineering subjects.");
            fallback.setBadge("READY TO ADVANCE");
            fallback.setActionType("NEXT");
            fallback.setActionButtonText("Continue Learning");
            fallback.setActionUrl("/learning-path");
            fallback.setCurrentMastery(100.0);
            sorted.add(fallback);
        }

        return sorted;
    }

    @Transactional(readOnly = true)
    public NextActionDto getNextAction(Long studentId) {
        List<RecommendationDto> recs = getPersonalizedRecommendations(studentId);
        RecommendationDto top = recs.get(0);

        NextActionDto next = new NextActionDto();
        next.setTitle(top.getTitle());
        next.setReason(top.getDescription());
        next.setBadge(top.getBadge());
        next.setActionType(top.getActionType());
        next.setActionUrl(top.getActionUrl());
        next.setButtonText(top.getActionButtonText());
        next.setConceptId(top.getConceptId());
        next.setConceptName(top.getConceptName());
        next.setChapterName(top.getChapterName());
        next.setSubjectName(top.getSubjectName());
        next.setCurrentMastery(top.getCurrentMastery());
        return next;
    }

    @Transactional(readOnly = true)
    public KnowledgeMapDto getKnowledgeMap(Long studentId) {
        LearningProfileDto profile = performanceService.getStudentProfile(studentId);
        Map<String, ConceptPerformanceDto> scoreMap = profile.getConcepts().stream()
                .collect(Collectors.toMap(ConceptPerformanceDto::getConceptName, c -> c, (c1, c2) -> c1));

        List<Concept> allConcepts = conceptRepository.findAll();

        NextActionDto nextAction = getNextAction(studentId);
        Long currentTargetId = nextAction.getConceptId();

        // Build prerequisite mappings
        Map<Long, List<Concept>> prereqMap = new HashMap<>();
        Map<Long, List<Concept>> dependentMap = new HashMap<>();

        for (Concept c : allConcepts) {
            if (c.getPrerequisites() != null) {
                prereqMap.put(c.getId(), c.getPrerequisites());
                for (Concept p : c.getPrerequisites()) {
                    dependentMap.computeIfAbsent(p.getId(), k -> new ArrayList<>()).add(c);
                }
            }
        }

        // Identify prerequisite gap concepts: prerequisites of weak concepts that are not yet mastered (<75%)
        Set<Long> prereqGapIds = new HashSet<>();
        for (Concept c : allConcepts) {
            ConceptPerformanceDto perf = scoreMap.get(c.getName());
            if (perf != null && perf.getScore() < MASTERY_THRESHOLD) {
                List<Concept> pList = prereqMap.getOrDefault(c.getId(), Collections.emptyList());
                for (Concept p : pList) {
                    ConceptPerformanceDto pPerf = scoreMap.get(p.getName());
                    double pScore = pPerf != null ? pPerf.getScore() : 0.0;
                    if (pScore < MASTERY_THRESHOLD) {
                        prereqGapIds.add(p.getId());
                    }
                }
            }
        }

        List<KnowledgeMapDto.KnowledgeNodeDto> nodes = new ArrayList<>();
        List<KnowledgeMapDto.KnowledgeLinkDto> links = new ArrayList<>();

        for (Concept c : allConcepts) {
            KnowledgeMapDto.KnowledgeNodeDto node = new KnowledgeMapDto.KnowledgeNodeDto();
            node.setId(c.getId());
            node.setName(c.getName());
            node.setActionUrl("/learning/" + c.getId());

            if (c.getChapter() != null) {
                node.setChapter(c.getChapter().getName());
                if (c.getChapter().getSubject() != null) {
                    node.setSubject(c.getChapter().getSubject().getName());
                }
            }

            // Prerequisite & Dependent Lists
            List<Concept> pList = prereqMap.getOrDefault(c.getId(), Collections.emptyList());
            node.setPrerequisiteIds(pList.stream().map(Concept::getId).collect(Collectors.toList()));
            node.setPrerequisiteNames(pList.stream().map(Concept::getName).collect(Collectors.toList()));

            List<Concept> dList = dependentMap.getOrDefault(c.getId(), Collections.emptyList());
            node.setDependentIds(dList.stream().map(Concept::getId).collect(Collectors.toList()));
            node.setDependentNames(dList.stream().map(Concept::getName).collect(Collectors.toList()));

            ConceptPerformanceDto perf = scoreMap.get(c.getName());
            double score = perf != null ? perf.getScore() : 0.0;
            node.setMastery(score);

            // Exactly matching required statuses:
            // MASTERED (>=75%) | WEAK (<75%) | CURRENT TARGET | PREREQUISITE GAP | NOT ATTEMPTED
            if (score >= MASTERY_THRESHOLD) {
                node.setStatus("MASTERED");
                node.setGap(false);
            } else if (c.getId().equals(currentTargetId)) {
                node.setStatus("CURRENT TARGET");
                node.setGap(prereqGapIds.contains(c.getId()));
            } else if (prereqGapIds.contains(c.getId())) {
                node.setStatus("PREREQUISITE GAP");
                node.setGap(true);
            } else if (perf != null && perf.getScore() > 0.0) {
                node.setStatus("WEAK");
                node.setGap(true);
            } else {
                node.setStatus("NOT ATTEMPTED");
                node.setGap(false);
            }

            nodes.add(node);

            // Add links
            for (Concept p : pList) {
                KnowledgeMapDto.KnowledgeLinkDto link = new KnowledgeMapDto.KnowledgeLinkDto();
                link.setSource(p.getId());
                link.setTarget(c.getId());
                link.setRelationship("requires");
                links.add(link);
            }
        }

        KnowledgeMapDto map = new KnowledgeMapDto();
        map.setNodes(nodes);
        map.setLinks(links);
        return map;
    }

    @Transactional(readOnly = true)
    public MistakeAnalysisDto analyzeMistake(Long studentId, Long questionId, String selectedOption) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        MistakeAnalysisDto dto = new MistakeAnalysisDto();
        dto.setQuestionId(question.getId());
        dto.setQuestionText(question.getText());
        dto.setSelectedOption(selectedOption);
        dto.setCorrectOption(question.getCorrectOption());
        dto.setDifficultyLevel(question.getDifficultyLevel());

        // Extract option texts
        String selectedText = getOptionText(question, selectedOption);
        String correctText = getOptionText(question, question.getCorrectOption());
        dto.setSelectedOptionText(selectedText);
        dto.setCorrectOptionText(correctText);

        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(selectedOption);
        dto.setCorrect(isCorrect);

        if (question.getConcept() != null) {
            dto.setConceptId(question.getConcept().getId());
            dto.setConceptName(question.getConcept().getName());
            if (question.getConcept().getChapter() != null && question.getConcept().getChapter().getSubject() != null) {
                dto.setSubjectName(question.getConcept().getChapter().getSubject().getName());
            }
        }

        if (!isCorrect) {
            String conceptName = question.getConcept() != null ? question.getConcept().getName() : "this concept";
            
            // Generate Intelligent Misconception Analysis
            dto.setPossibleMisconception("Your choice of (" + selectedOption + ") indicates a common confusion between the operational behavior of " + conceptName + " and related mechanisms.");
            dto.setSimpleExplanation("In " + conceptName + ", the standard rule is: " + correctText + ". Option (" + selectedOption + ") is incorrect because it contradicts foundational specifications.");
            dto.setTechnicalExplanation("Technical diagnosis: The selected option (" + selectedOption + ") violates standard invariant checks. In production engineering, applying this option would result in unintended behavior or computational overhead.");

            dto.setAiPrompt("I selected option (" + selectedOption + ": " + selectedText + ") instead of the correct option (" + question.getCorrectOption() + ": " + correctText + ") for question: '" + question.getText() + "'. Can you explain in simple terms why my answer is a misconception and how I should approach problems in " + conceptName + "?");

            // Find Similar Question for immediate remediation
            if (question.getConcept() != null) {
                List<Question> candidates = questionRepository.findByConceptIdAndDifficultyLevel(question.getConcept().getId(), question.getDifficultyLevel());
                Optional<Question> similar = candidates.stream()
                        .filter(q -> !q.getId().equals(question.getId()))
                        .findAny();
                if (similar.isEmpty()) {
                    similar = questionRepository.findAll().stream()
                            .filter(q -> q.getConcept().getId().equals(question.getConcept().getId()) && !q.getId().equals(question.getId()))
                            .findAny();
                }
                similar.ifPresent(q -> {
                    dto.setSimilarQuestionId(q.getId());
                    dto.setSimilarQuestionText(q.getText());
                });
            }
        }

        return dto;
    }

    private String getOptionText(Question q, String opt) {
        if (opt == null) return "";
        switch (opt.toUpperCase()) {
            case "A": return q.getOptionA();
            case "B": return q.getOptionB();
            case "C": return q.getOptionC();
            case "D": return q.getOptionD();
            default: return "";
        }
    }
}
