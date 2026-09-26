package com.hackstreak.learning_platform.repository;
import com.hackstreak.learning_platform.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    List<Chapter> findBySubjectId(Long subjectId);
    Chapter findByNameAndSubjectId(String name, Long subjectId);
}
