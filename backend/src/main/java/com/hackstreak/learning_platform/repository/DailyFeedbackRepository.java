package com.hackstreak.learning_platform.repository;

import com.hackstreak.learning_platform.entity.DailyFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DailyFeedbackRepository extends JpaRepository<DailyFeedback, Long> {
    Optional<DailyFeedback> findByUserIdAndFeedbackDate(Long userId, LocalDate feedbackDate);
}
