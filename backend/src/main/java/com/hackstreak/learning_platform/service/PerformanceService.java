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
public class PerformanceService {

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private UserRepository userRepository;

    private static final double PASSING_THRESHOLD = 75.0;

    @Transactional(readOnly = true)
    public LearningProfileDto getStudentProfile(Long studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<StudentAnswer> answers = studentAnswerRepository.findByStudentId(studentId);

        // Group by Concept (only keeping latest attempt per concept)
        Map<Concept, Long> latestAttemptIdForConcept = new HashMap<>();
        Map<Concept, List<StudentAnswer>> conceptAnswers = new HashMap<>();

        for (StudentAnswer ans : answers) {
            Concept concept = ans.getQuestion().getConcept();
            Long attemptId = ans.getAssessmentAttempt().getId();

            latestAttemptIdForConcept.putIfAbsent(concept, attemptId);

            if (latestAttemptIdForConcept.get(concept).equals(attemptId)) {
                conceptAnswers.computeIfAbsent(concept, k -> new ArrayList<>()).add(ans);
            }
        }

        // Group by Subject using the filtered concept answers
        Map<String, List<StudentAnswer>> subjectAnswers = new HashMap<>();
        for (Map.Entry<Concept, List<StudentAnswer>> entry : conceptAnswers.entrySet()) {
            String subjectName = entry.getKey().getChapter().getSubject().getName();
            subjectAnswers.computeIfAbsent(subjectName, k -> new ArrayList<>()).addAll(entry.getValue());
        }

        List<SubjectPerformanceDto> subjectPerformance = new ArrayList<>();
        for (Map.Entry<String, List<StudentAnswer>> entry : subjectAnswers.entrySet()) {
            double score = calculateScore(entry.getValue());
            SubjectPerformanceDto dto = new SubjectPerformanceDto();
            dto.setSubjectName(entry.getKey());
            dto.setScore(score);
            dto.setStatus(score >= PASSING_THRESHOLD ? "MASTERED" : "WEAK");
            subjectPerformance.add(dto);
        }

        // Pre-calculate all concept scores for fast prerequisite cross-checks
        Map<Long, Double> conceptScoreMap = new HashMap<>();
        for (Map.Entry<Concept, List<StudentAnswer>> entry : conceptAnswers.entrySet()) {
            conceptScoreMap.put(entry.getKey().getId(), calculateScore(entry.getValue()));
        }

        List<ConceptPerformanceDto> conceptPerformance = new ArrayList<>();
        List<KnowledgeGapDto> knowledgeGaps = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        for (Map.Entry<Concept, List<StudentAnswer>> entry : conceptAnswers.entrySet()) {
            Concept concept = entry.getKey();
            double score = calculateScore(entry.getValue());
            boolean isMastered = score >= PASSING_THRESHOLD;

            ConceptPerformanceDto dto = new ConceptPerformanceDto();
            dto.setConceptId(concept.getId());
            dto.setConceptName(concept.getName());
            dto.setScore(score);
            dto.setStatus(isMastered ? "MASTERED" : "WEAK");
            if (concept.getChapter() != null && concept.getChapter().getSubject() != null) {
                dto.setSubjectName(concept.getChapter().getSubject().getName());
            }
            conceptPerformance.add(dto);

            if (!isMastered) {
                KnowledgeGapDto gap = new KnowledgeGapDto();
                gap.setConceptId(concept.getId());
                gap.setConcept(concept.getName());
                gap.setScore(score);
                gap.setActionUrl("/learning/" + concept.getId());
                gap.setPracticeUrl("/practice/" + concept.getId());

                if (concept.getChapter() != null) {
                    gap.setChapterName(concept.getChapter().getName());
                    if (concept.getChapter().getSubject() != null) {
                        gap.setSubjectName(concept.getChapter().getSubject().getName());
                    }
                }

                List<PrerequisiteGapItemDto> prereqDetails = new ArrayList<>();
                List<String> prereqNames = new ArrayList<>();
                List<String> missingPrereqNames = new ArrayList<>();

                if (concept.getPrerequisites() != null) {
                    for (Concept p : concept.getPrerequisites()) {
                        prereqNames.add(p.getName());
                        double pScore = conceptScoreMap.getOrDefault(p.getId(), 0.0);
                        boolean isGap = pScore < PASSING_THRESHOLD;

                        PrerequisiteGapItemDto pDto = new PrerequisiteGapItemDto(
                                p.getId(),
                                p.getName(),
                                pScore,
                                isGap ? "PREREQUISITE_GAP" : "MASTERED",
                                isGap,
                                "/learning/" + p.getId()
                        );
                        prereqDetails.add(pDto);

                        if (isGap) {
                            missingPrereqNames.add(p.getName() + " (" + String.format("%.0f", pScore) + "%)");
                        }
                    }
                }

                gap.setPrerequisites(prereqNames);
                gap.setPrerequisiteDetails(prereqDetails);
                gap.setHasPrerequisiteGap(!missingPrereqNames.isEmpty());

                if (!missingPrereqNames.isEmpty()) {
                    String reasonText = "Prerequisite gap: Blocked by unmastered foundation in " + String.join(", ", missingPrereqNames) + ". Study prerequisite first.";
                    gap.setReason(reasonText);
                    String rec = "Recommended: Strengthen " + String.join(" and ", missingPrereqNames) + " before continuing with " + concept.getName() + ".";
                    gap.setRecommendation(rec);
                    if (!recommendations.contains(rec)) {
                        recommendations.add(rec);
                    }
                } else {
                    String reasonText = "Current mastery is " + String.format("%.0f", score) + "% (needs >=75% for mastery). Ready for targeted practice.";
                    gap.setReason(reasonText);
                    String rec = "Recommended: Complete practice on " + concept.getName() + " to achieve >= 75% mastery.";
                    gap.setRecommendation(rec);
                    if (!recommendations.contains(rec)) {
                        recommendations.add(rec);
                    }
                }
                knowledgeGaps.add(gap);
            }
        }

        LearningProfileDto profile = new LearningProfileDto();
        profile.setStudentId(studentId);
        profile.setSubjects(subjectPerformance);
        profile.setConcepts(conceptPerformance);
        profile.setKnowledgeGaps(knowledgeGaps);
        profile.setRecommendations(recommendations);

        return profile;
    }

    private double calculateScore(List<StudentAnswer> answers) {
        if (answers.isEmpty()) return 0.0;
        long correctCount = answers.stream().filter(StudentAnswer::getIsCorrect).count();
        return ((double) correctCount / answers.size()) * 100.0;
    }
}
