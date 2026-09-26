package com.hackstreak.learning_platform.repository;

import com.hackstreak.learning_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByStudentId(String studentId);
    List<User> findByRole(String role);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
}
