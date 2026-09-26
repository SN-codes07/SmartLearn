package com.hackstreak.learning_platform.repository;
import com.hackstreak.learning_platform.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query(value = "SELECT q.* FROM question q JOIN concept c ON q.concept_id = c.id JOIN chapter ch ON c.chapter_id = ch.id JOIN subject s ON ch.subject_id = s.id WHERE s.name IN (:subjects) ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsBySubjects(@Param("subjects") List<String> subjects, @Param("limit") int limit);

    @Query(value = "SELECT q.* FROM question q JOIN concept c ON q.concept_id = c.id JOIN chapter ch ON c.chapter_id = ch.id WHERE ch.subject_id = :subjectId ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Question> findRandomQuestionsBySubjectId(@Param("subjectId") Long subjectId, @Param("limit") int limit);

    List<Question> findByConceptIdAndDifficultyLevel(Long conceptId, String difficultyLevel);

    long countByConceptId(Long conceptId);
}
