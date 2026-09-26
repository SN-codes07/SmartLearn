package com.hackstreak.learning_platform.service;

import com.hackstreak.learning_platform.dto.AssessmentResultDto;
import com.hackstreak.learning_platform.dto.AssessmentSubmissionDto;
import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentAttemptRepository attemptRepository;
    
    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    private static final double PASSING_THRESHOLD = 75.0;

    @Transactional
    public AssessmentResultDto submitAssessment(AssessmentSubmissionDto submission) {
        return submitAssessment(submission, null);
    }

    @Transactional
    public AssessmentResultDto submitAssessment(AssessmentSubmissionDto submission, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail("123456@apsit.edu.in")
                    .or(() -> userRepository.findByEmail("student@example.com"))
                    .or(() -> userRepository.findById(1L))
                    .orElseThrow(() -> new RuntimeException("Student user not found"));
        }

        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setUser(user);
        attempt.setAssessmentType(submission.getAssessmentType());
        
        if (submission.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(submission.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            attempt.setSubject(subject);
        }

        int totalQuestions = submission.getAnswers().size();
        int correctAnswers = 0;

        attempt.setTotalQuestions(totalQuestions);
        
        // Save initially to get ID for StudentAnswer
        attempt = attemptRepository.save(attempt);

        for (Map.Entry<Long, String> entry : submission.getAnswers().entrySet()) {
            Long questionId = entry.getKey();
            String selectedOption = entry.getValue();

            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(selectedOption);
            if (isCorrect) correctAnswers++;

            StudentAnswer answer = new StudentAnswer();
            answer.setAssessmentAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOption(selectedOption);
            answer.setIsCorrect(isCorrect);
            
            // We can add it to attempt list if needed, or just save via cascade if set up.
            // Since we don't have a StudentAnswerRepository here, we should rely on Cascade or create one.
            // Let's create a StudentAnswerRepository or just add to list.
            if (attempt.getStudentAnswers() == null) {
                attempt.setStudentAnswers(new java.util.ArrayList<>());
            }
            attempt.getStudentAnswers().add(answer);
        }

        double scorePercentage = totalQuestions == 0 ? 0 : ((double) correctAnswers / totalQuestions) * 100.0;
        boolean passed = scorePercentage >= PASSING_THRESHOLD;

        attempt.setCorrectAnswers(correctAnswers);
        attempt.setScorePercentage(scorePercentage);
        attempt.setPassed(passed);
        
        attemptRepository.save(attempt);

        AssessmentResultDto result = new AssessmentResultDto();
        result.setAttemptId(attempt.getId());
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setScorePercentage(scorePercentage);
        result.setPassed(passed);
        
        if (passed) {
            result.setMessage("Your assessment is cleared.");
        } else {
            result.setMessage("Your score is below the required 75% mastery level.");
        }

        return result;
    }

    public AssessmentResultDto getAssessmentResult(Long id) {
        AssessmentAttempt attempt = attemptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        AssessmentResultDto result = new AssessmentResultDto();
        result.setAttemptId(attempt.getId());
        result.setTotalQuestions(attempt.getTotalQuestions());
        result.setCorrectAnswers(attempt.getCorrectAnswers());
        result.setScorePercentage(attempt.getScorePercentage());
        result.setPassed(attempt.getPassed());
        
        if (attempt.getPassed()) {
            result.setMessage("Your assessment is cleared.");
        } else {
            result.setMessage("Your score is below the required 75% mastery level.");
        }

        return result;
    }
}
