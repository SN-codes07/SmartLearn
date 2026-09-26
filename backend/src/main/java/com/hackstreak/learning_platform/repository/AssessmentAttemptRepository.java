package com.hackstreak.learning_platform.repository;

import com.hackstreak.learning_platform.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByUserIdOrderByCreatedTimestampDesc(Long userId);
}
