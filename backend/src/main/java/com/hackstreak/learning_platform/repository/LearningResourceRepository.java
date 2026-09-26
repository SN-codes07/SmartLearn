package com.hackstreak.learning_platform.repository;

import com.hackstreak.learning_platform.entity.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {
    Optional<LearningResource> findByConceptId(Long conceptId);
}
