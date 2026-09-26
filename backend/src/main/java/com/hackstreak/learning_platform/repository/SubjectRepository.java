package com.hackstreak.learning_platform.repository;
import com.hackstreak.learning_platform.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Subject findByName(String name);
}
