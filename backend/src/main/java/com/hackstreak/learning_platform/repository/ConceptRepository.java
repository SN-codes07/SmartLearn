package com.hackstreak.learning_platform.repository;
import com.hackstreak.learning_platform.entity.Concept;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ConceptRepository extends JpaRepository<Concept, Long> {
    List<Concept> findByChapterId(Long chapterId);
    Concept findByNameAndChapterId(String name, Long chapterId);
}
