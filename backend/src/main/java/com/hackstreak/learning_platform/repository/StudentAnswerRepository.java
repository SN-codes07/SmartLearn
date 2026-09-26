package com.hackstreak.learning_platform.repository;

import com.hackstreak.learning_platform.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    @Query("SELECT sa FROM StudentAnswer sa JOIN sa.assessmentAttempt aa WHERE aa.user.id = :studentId ORDER BY aa.createdTimestamp DESC")
    List<StudentAnswer> findByStudentId(@Param("studentId") Long studentId);
}
