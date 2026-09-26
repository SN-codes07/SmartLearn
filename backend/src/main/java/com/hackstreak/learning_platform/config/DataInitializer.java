package com.hackstreak.learning_platform.config;

import com.hackstreak.learning_platform.entity.*;
import com.hackstreak.learning_platform.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository,
                                      SubjectRepository subjectRepository,
                                      ChapterRepository chapterRepository,
                                      ConceptRepository conceptRepository,
                                      QuestionRepository questionRepository,
                                      LearningResourceRepository learningResourceRepository) {
        return args -> {
            // 1. Seed / Update Demo Student (idempotent, preserving existing attempt records)
            User student = userRepository.findByEmail("123456@apsit.edu.in")
                    .or(() -> userRepository.findByStudentId("123456"))
                    .or(() -> userRepository.findByEmail("student@example.com"))
                    .or(() -> userRepository.findById(1L))
                    .orElseGet(User::new);

            student.setName(student.getName() != null && !student.getName().trim().isEmpty() ? student.getName() : "Demo Student");
            student.setEmail("123456@apsit.edu.in");
            student.setPassword("123456");
            student.setRole("STUDENT");
            student.setStudentId("123456");
            if (student.getAcademicYear() == null || student.getAcademicYear().trim().isEmpty()) {
                student.setAcademicYear("Third Year (TE)");
            }
            if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
                student.setDepartment("Computer Engineering");
            }
            userRepository.save(student);

            // 2. Seed / Update Demo Admin (idempotent)
            User admin = userRepository.findByEmail("admin@apsit.edu.in")
                    .or(() -> userRepository.findByRole("ADMIN").stream().findFirst())
                    .orElseGet(User::new);

            admin.setName(admin.getName() != null && !admin.getName().trim().isEmpty() ? admin.getName() : "System Administrator");
            admin.setEmail("admin@apsit.edu.in");
            admin.setPassword("admin");
            admin.setRole("ADMIN");
            if (admin.getDepartment() == null || admin.getDepartment().trim().isEmpty()) {
                admin.setDepartment("Academic Administration");
            }
            userRepository.save(admin);

            Map<String, Concept> conceptMap = new HashMap<>();
            Subject s_DatabaseManagement = subjectRepository.findByName("Database Management");
            if (s_DatabaseManagement == null) {
                s_DatabaseManagement = createSubject("Database Management", "Comprehensive Database Management Curriculum");
                s_DatabaseManagement = subjectRepository.save(s_DatabaseManagement);
            }
            Chapter ch_DatabaseManagement_DBMSFundamentals = chapterRepository.findByNameAndSubjectId("DBMS Fundamentals", s_DatabaseManagement.getId());
            if (ch_DatabaseManagement_DBMSFundamentals == null) {
                ch_DatabaseManagement_DBMSFundamentals = createChapter("DBMS Fundamentals", s_DatabaseManagement);
                ch_DatabaseManagement_DBMSFundamentals = chapterRepository.save(ch_DatabaseManagement_DBMSFundamentals);
            }
            Concept con_DatabaseManagement_DatabasevsFileSystem = conceptRepository.findByNameAndChapterId("Database vs File System", ch_DatabaseManagement_DBMSFundamentals.getId());
            if (con_DatabaseManagement_DatabasevsFileSystem == null) {
                con_DatabaseManagement_DatabasevsFileSystem = createConcept("Database vs File System", ch_DatabaseManagement_DBMSFundamentals);
                con_DatabaseManagement_DatabasevsFileSystem = conceptRepository.save(con_DatabaseManagement_DatabasevsFileSystem);
            }
            conceptMap.put("Database vs File System", con_DatabaseManagement_DatabasevsFileSystem);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_DatabasevsFileSystem.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_DatabasevsFileSystem, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_DatabasevsFileSystem.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_DatabasevsFileSystem, "Database Management");
            }
            Concept con_DatabaseManagement_DataModels = conceptRepository.findByNameAndChapterId("Data Models", ch_DatabaseManagement_DBMSFundamentals.getId());
            if (con_DatabaseManagement_DataModels == null) {
                con_DatabaseManagement_DataModels = createConcept("Data Models", ch_DatabaseManagement_DBMSFundamentals);
                con_DatabaseManagement_DataModels = conceptRepository.save(con_DatabaseManagement_DataModels);
            }
            conceptMap.put("Data Models", con_DatabaseManagement_DataModels);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_DataModels.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_DataModels, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_DataModels.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_DataModels, "Database Management");
            }
            Concept con_DatabaseManagement_DataIndependence = conceptRepository.findByNameAndChapterId("Data Independence", ch_DatabaseManagement_DBMSFundamentals.getId());
            if (con_DatabaseManagement_DataIndependence == null) {
                con_DatabaseManagement_DataIndependence = createConcept("Data Independence", ch_DatabaseManagement_DBMSFundamentals);
                con_DatabaseManagement_DataIndependence = conceptRepository.save(con_DatabaseManagement_DataIndependence);
            }
            conceptMap.put("Data Independence", con_DatabaseManagement_DataIndependence);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_DataIndependence.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_DataIndependence, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_DataIndependence.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_DataIndependence, "Database Management");
            }
            Chapter ch_DatabaseManagement_SQL = chapterRepository.findByNameAndSubjectId("SQL", s_DatabaseManagement.getId());
            if (ch_DatabaseManagement_SQL == null) {
                ch_DatabaseManagement_SQL = createChapter("SQL", s_DatabaseManagement);
                ch_DatabaseManagement_SQL = chapterRepository.save(ch_DatabaseManagement_SQL);
            }
            Concept con_DatabaseManagement_CREATETABLE = conceptRepository.findByNameAndChapterId("CREATE TABLE", ch_DatabaseManagement_SQL.getId());
            if (con_DatabaseManagement_CREATETABLE == null) {
                con_DatabaseManagement_CREATETABLE = createConcept("CREATE TABLE", ch_DatabaseManagement_SQL);
                con_DatabaseManagement_CREATETABLE = conceptRepository.save(con_DatabaseManagement_CREATETABLE);
            }
            conceptMap.put("CREATE TABLE", con_DatabaseManagement_CREATETABLE);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_CREATETABLE.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_CREATETABLE, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_CREATETABLE.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_CREATETABLE, "Database Management");
            }
            Concept con_DatabaseManagement_INSERT = conceptRepository.findByNameAndChapterId("INSERT", ch_DatabaseManagement_SQL.getId());
            if (con_DatabaseManagement_INSERT == null) {
                con_DatabaseManagement_INSERT = createConcept("INSERT", ch_DatabaseManagement_SQL);
                con_DatabaseManagement_INSERT = conceptRepository.save(con_DatabaseManagement_INSERT);
            }
            conceptMap.put("INSERT", con_DatabaseManagement_INSERT);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_INSERT.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_INSERT, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_INSERT.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_INSERT, "Database Management");
            }
            Concept con_DatabaseManagement_SELECT = conceptRepository.findByNameAndChapterId("SELECT", ch_DatabaseManagement_SQL.getId());
            if (con_DatabaseManagement_SELECT == null) {
                con_DatabaseManagement_SELECT = createConcept("SELECT", ch_DatabaseManagement_SQL);
                con_DatabaseManagement_SELECT = conceptRepository.save(con_DatabaseManagement_SELECT);
            }
            conceptMap.put("SELECT", con_DatabaseManagement_SELECT);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_SELECT.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_SELECT, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_SELECT.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_SELECT, "Database Management");
            }
            Concept con_DatabaseManagement_JOIN = conceptRepository.findByNameAndChapterId("JOIN", ch_DatabaseManagement_SQL.getId());
            if (con_DatabaseManagement_JOIN == null) {
                con_DatabaseManagement_JOIN = createConcept("JOIN", ch_DatabaseManagement_SQL);
                con_DatabaseManagement_JOIN = conceptRepository.save(con_DatabaseManagement_JOIN);
            }
            conceptMap.put("JOIN", con_DatabaseManagement_JOIN);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_JOIN.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_JOIN, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_JOIN.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_JOIN, "Database Management");
            }
            Concept con_DatabaseManagement_GROUPBY = conceptRepository.findByNameAndChapterId("GROUP BY", ch_DatabaseManagement_SQL.getId());
            if (con_DatabaseManagement_GROUPBY == null) {
                con_DatabaseManagement_GROUPBY = createConcept("GROUP BY", ch_DatabaseManagement_SQL);
                con_DatabaseManagement_GROUPBY = conceptRepository.save(con_DatabaseManagement_GROUPBY);
            }
            conceptMap.put("GROUP BY", con_DatabaseManagement_GROUPBY);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_GROUPBY.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_GROUPBY, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_GROUPBY.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_GROUPBY, "Database Management");
            }
            Chapter ch_DatabaseManagement_Normalization = chapterRepository.findByNameAndSubjectId("Normalization", s_DatabaseManagement.getId());
            if (ch_DatabaseManagement_Normalization == null) {
                ch_DatabaseManagement_Normalization = createChapter("Normalization", s_DatabaseManagement);
                ch_DatabaseManagement_Normalization = chapterRepository.save(ch_DatabaseManagement_Normalization);
            }
            Concept con_DatabaseManagement_FunctionalDependency = conceptRepository.findByNameAndChapterId("Functional Dependency", ch_DatabaseManagement_Normalization.getId());
            if (con_DatabaseManagement_FunctionalDependency == null) {
                con_DatabaseManagement_FunctionalDependency = createConcept("Functional Dependency", ch_DatabaseManagement_Normalization);
                con_DatabaseManagement_FunctionalDependency = conceptRepository.save(con_DatabaseManagement_FunctionalDependency);
            }
            conceptMap.put("Functional Dependency", con_DatabaseManagement_FunctionalDependency);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_FunctionalDependency.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_FunctionalDependency, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_FunctionalDependency.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_FunctionalDependency, "Database Management");
            }
            Concept con_DatabaseManagement_1NF = conceptRepository.findByNameAndChapterId("1NF", ch_DatabaseManagement_Normalization.getId());
            if (con_DatabaseManagement_1NF == null) {
                con_DatabaseManagement_1NF = createConcept("1NF", ch_DatabaseManagement_Normalization);
                con_DatabaseManagement_1NF = conceptRepository.save(con_DatabaseManagement_1NF);
            }
            conceptMap.put("1NF", con_DatabaseManagement_1NF);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_1NF.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_1NF, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_1NF.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_1NF, "Database Management");
            }
            Concept con_DatabaseManagement_2NF = conceptRepository.findByNameAndChapterId("2NF", ch_DatabaseManagement_Normalization.getId());
            if (con_DatabaseManagement_2NF == null) {
                con_DatabaseManagement_2NF = createConcept("2NF", ch_DatabaseManagement_Normalization);
                con_DatabaseManagement_2NF = conceptRepository.save(con_DatabaseManagement_2NF);
            }
            conceptMap.put("2NF", con_DatabaseManagement_2NF);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_2NF.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_2NF, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_2NF.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_2NF, "Database Management");
            }
            Concept con_DatabaseManagement_3NF = conceptRepository.findByNameAndChapterId("3NF", ch_DatabaseManagement_Normalization.getId());
            if (con_DatabaseManagement_3NF == null) {
                con_DatabaseManagement_3NF = createConcept("3NF", ch_DatabaseManagement_Normalization);
                con_DatabaseManagement_3NF = conceptRepository.save(con_DatabaseManagement_3NF);
            }
            conceptMap.put("3NF", con_DatabaseManagement_3NF);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_3NF.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_3NF, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_3NF.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_3NF, "Database Management");
            }
            Chapter ch_DatabaseManagement_Transactions = chapterRepository.findByNameAndSubjectId("Transactions", s_DatabaseManagement.getId());
            if (ch_DatabaseManagement_Transactions == null) {
                ch_DatabaseManagement_Transactions = createChapter("Transactions", s_DatabaseManagement);
                ch_DatabaseManagement_Transactions = chapterRepository.save(ch_DatabaseManagement_Transactions);
            }
            Concept con_DatabaseManagement_ACIDProperties = conceptRepository.findByNameAndChapterId("ACID Properties", ch_DatabaseManagement_Transactions.getId());
            if (con_DatabaseManagement_ACIDProperties == null) {
                con_DatabaseManagement_ACIDProperties = createConcept("ACID Properties", ch_DatabaseManagement_Transactions);
                con_DatabaseManagement_ACIDProperties = conceptRepository.save(con_DatabaseManagement_ACIDProperties);
            }
            conceptMap.put("ACID Properties", con_DatabaseManagement_ACIDProperties);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_ACIDProperties.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_ACIDProperties, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_ACIDProperties.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_ACIDProperties, "Database Management");
            }
            Concept con_DatabaseManagement_Concurrency = conceptRepository.findByNameAndChapterId("Concurrency", ch_DatabaseManagement_Transactions.getId());
            if (con_DatabaseManagement_Concurrency == null) {
                con_DatabaseManagement_Concurrency = createConcept("Concurrency", ch_DatabaseManagement_Transactions);
                con_DatabaseManagement_Concurrency = conceptRepository.save(con_DatabaseManagement_Concurrency);
            }
            conceptMap.put("Concurrency", con_DatabaseManagement_Concurrency);
            if (learningResourceRepository.findByConceptId(con_DatabaseManagement_Concurrency.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DatabaseManagement_Concurrency, "Database Management"));
            }
            if (questionRepository.countByConceptId(con_DatabaseManagement_Concurrency.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DatabaseManagement_Concurrency, "Database Management");
            }
            Subject s_DataStructures = subjectRepository.findByName("Data Structures");
            if (s_DataStructures == null) {
                s_DataStructures = createSubject("Data Structures", "Comprehensive Data Structures Curriculum");
                s_DataStructures = subjectRepository.save(s_DataStructures);
            }
            Chapter ch_DataStructures_ComplexityAnalysis = chapterRepository.findByNameAndSubjectId("Complexity Analysis", s_DataStructures.getId());
            if (ch_DataStructures_ComplexityAnalysis == null) {
                ch_DataStructures_ComplexityAnalysis = createChapter("Complexity Analysis", s_DataStructures);
                ch_DataStructures_ComplexityAnalysis = chapterRepository.save(ch_DataStructures_ComplexityAnalysis);
            }
            Concept con_DataStructures_BigO = conceptRepository.findByNameAndChapterId("Big O", ch_DataStructures_ComplexityAnalysis.getId());
            if (con_DataStructures_BigO == null) {
                con_DataStructures_BigO = createConcept("Big O", ch_DataStructures_ComplexityAnalysis);
                con_DataStructures_BigO = conceptRepository.save(con_DataStructures_BigO);
            }
            conceptMap.put("Big O", con_DataStructures_BigO);
            if (learningResourceRepository.findByConceptId(con_DataStructures_BigO.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_BigO, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_BigO.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_BigO, "Data Structures");
            }
            Chapter ch_DataStructures_Arrays = chapterRepository.findByNameAndSubjectId("Arrays", s_DataStructures.getId());
            if (ch_DataStructures_Arrays == null) {
                ch_DataStructures_Arrays = createChapter("Arrays", s_DataStructures);
                ch_DataStructures_Arrays = chapterRepository.save(ch_DataStructures_Arrays);
            }
            Concept con_DataStructures_Traversal = conceptRepository.findByNameAndChapterId("Traversal", ch_DataStructures_Arrays.getId());
            if (con_DataStructures_Traversal == null) {
                con_DataStructures_Traversal = createConcept("Traversal", ch_DataStructures_Arrays);
                con_DataStructures_Traversal = conceptRepository.save(con_DataStructures_Traversal);
            }
            conceptMap.put("Traversal", con_DataStructures_Traversal);
            if (learningResourceRepository.findByConceptId(con_DataStructures_Traversal.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_Traversal, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_Traversal.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_Traversal, "Data Structures");
            }
            Concept con_DataStructures_Insertion = conceptRepository.findByNameAndChapterId("Insertion", ch_DataStructures_Arrays.getId());
            if (con_DataStructures_Insertion == null) {
                con_DataStructures_Insertion = createConcept("Insertion", ch_DataStructures_Arrays);
                con_DataStructures_Insertion = conceptRepository.save(con_DataStructures_Insertion);
            }
            conceptMap.put("Insertion", con_DataStructures_Insertion);
            if (learningResourceRepository.findByConceptId(con_DataStructures_Insertion.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_Insertion, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_Insertion.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_Insertion, "Data Structures");
            }
            Concept con_DataStructures_Deletion = conceptRepository.findByNameAndChapterId("Deletion", ch_DataStructures_Arrays.getId());
            if (con_DataStructures_Deletion == null) {
                con_DataStructures_Deletion = createConcept("Deletion", ch_DataStructures_Arrays);
                con_DataStructures_Deletion = conceptRepository.save(con_DataStructures_Deletion);
            }
            conceptMap.put("Deletion", con_DataStructures_Deletion);
            if (learningResourceRepository.findByConceptId(con_DataStructures_Deletion.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_Deletion, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_Deletion.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_Deletion, "Data Structures");
            }
            Chapter ch_DataStructures_LinkedLists = chapterRepository.findByNameAndSubjectId("Linked Lists", s_DataStructures.getId());
            if (ch_DataStructures_LinkedLists == null) {
                ch_DataStructures_LinkedLists = createChapter("Linked Lists", s_DataStructures);
                ch_DataStructures_LinkedLists = chapterRepository.save(ch_DataStructures_LinkedLists);
            }
            Concept con_DataStructures_SinglyLinkedList = conceptRepository.findByNameAndChapterId("Singly Linked List", ch_DataStructures_LinkedLists.getId());
            if (con_DataStructures_SinglyLinkedList == null) {
                con_DataStructures_SinglyLinkedList = createConcept("Singly Linked List", ch_DataStructures_LinkedLists);
                con_DataStructures_SinglyLinkedList = conceptRepository.save(con_DataStructures_SinglyLinkedList);
            }
            conceptMap.put("Singly Linked List", con_DataStructures_SinglyLinkedList);
            if (learningResourceRepository.findByConceptId(con_DataStructures_SinglyLinkedList.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_SinglyLinkedList, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_SinglyLinkedList.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_SinglyLinkedList, "Data Structures");
            }
            Chapter ch_DataStructures_Trees = chapterRepository.findByNameAndSubjectId("Trees", s_DataStructures.getId());
            if (ch_DataStructures_Trees == null) {
                ch_DataStructures_Trees = createChapter("Trees", s_DataStructures);
                ch_DataStructures_Trees = chapterRepository.save(ch_DataStructures_Trees);
            }
            Concept con_DataStructures_BinaryTree = conceptRepository.findByNameAndChapterId("Binary Tree", ch_DataStructures_Trees.getId());
            if (con_DataStructures_BinaryTree == null) {
                con_DataStructures_BinaryTree = createConcept("Binary Tree", ch_DataStructures_Trees);
                con_DataStructures_BinaryTree = conceptRepository.save(con_DataStructures_BinaryTree);
            }
            conceptMap.put("Binary Tree", con_DataStructures_BinaryTree);
            if (learningResourceRepository.findByConceptId(con_DataStructures_BinaryTree.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_BinaryTree, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_BinaryTree.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_BinaryTree, "Data Structures");
            }
            Concept con_DataStructures_BST = conceptRepository.findByNameAndChapterId("BST", ch_DataStructures_Trees.getId());
            if (con_DataStructures_BST == null) {
                con_DataStructures_BST = createConcept("BST", ch_DataStructures_Trees);
                con_DataStructures_BST = conceptRepository.save(con_DataStructures_BST);
            }
            conceptMap.put("BST", con_DataStructures_BST);
            if (learningResourceRepository.findByConceptId(con_DataStructures_BST.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_BST, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_BST.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_BST, "Data Structures");
            }
            Chapter ch_DataStructures_Sorting = chapterRepository.findByNameAndSubjectId("Sorting", s_DataStructures.getId());
            if (ch_DataStructures_Sorting == null) {
                ch_DataStructures_Sorting = createChapter("Sorting", s_DataStructures);
                ch_DataStructures_Sorting = chapterRepository.save(ch_DataStructures_Sorting);
            }
            Concept con_DataStructures_BubbleSort = conceptRepository.findByNameAndChapterId("Bubble Sort", ch_DataStructures_Sorting.getId());
            if (con_DataStructures_BubbleSort == null) {
                con_DataStructures_BubbleSort = createConcept("Bubble Sort", ch_DataStructures_Sorting);
                con_DataStructures_BubbleSort = conceptRepository.save(con_DataStructures_BubbleSort);
            }
            conceptMap.put("Bubble Sort", con_DataStructures_BubbleSort);
            if (learningResourceRepository.findByConceptId(con_DataStructures_BubbleSort.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_BubbleSort, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_BubbleSort.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_BubbleSort, "Data Structures");
            }
            Concept con_DataStructures_MergeSort = conceptRepository.findByNameAndChapterId("Merge Sort", ch_DataStructures_Sorting.getId());
            if (con_DataStructures_MergeSort == null) {
                con_DataStructures_MergeSort = createConcept("Merge Sort", ch_DataStructures_Sorting);
                con_DataStructures_MergeSort = conceptRepository.save(con_DataStructures_MergeSort);
            }
            conceptMap.put("Merge Sort", con_DataStructures_MergeSort);
            if (learningResourceRepository.findByConceptId(con_DataStructures_MergeSort.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_DataStructures_MergeSort, "Data Structures"));
            }
            if (questionRepository.countByConceptId(con_DataStructures_MergeSort.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_DataStructures_MergeSort, "Data Structures");
            }
            Subject s_Java = subjectRepository.findByName("Java");
            if (s_Java == null) {
                s_Java = createSubject("Java", "Comprehensive Java Curriculum");
                s_Java = subjectRepository.save(s_Java);
            }
            Chapter ch_Java_JavaFundamentals = chapterRepository.findByNameAndSubjectId("Java Fundamentals", s_Java.getId());
            if (ch_Java_JavaFundamentals == null) {
                ch_Java_JavaFundamentals = createChapter("Java Fundamentals", s_Java);
                ch_Java_JavaFundamentals = chapterRepository.save(ch_Java_JavaFundamentals);
            }
            Concept con_Java_Variables = conceptRepository.findByNameAndChapterId("Variables", ch_Java_JavaFundamentals.getId());
            if (con_Java_Variables == null) {
                con_Java_Variables = createConcept("Variables", ch_Java_JavaFundamentals);
                con_Java_Variables = conceptRepository.save(con_Java_Variables);
            }
            conceptMap.put("Variables", con_Java_Variables);
            if (learningResourceRepository.findByConceptId(con_Java_Variables.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_Variables, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_Variables.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_Variables, "Java");
            }
            Concept con_Java_Operators = conceptRepository.findByNameAndChapterId("Operators", ch_Java_JavaFundamentals.getId());
            if (con_Java_Operators == null) {
                con_Java_Operators = createConcept("Operators", ch_Java_JavaFundamentals);
                con_Java_Operators = conceptRepository.save(con_Java_Operators);
            }
            conceptMap.put("Operators", con_Java_Operators);
            if (learningResourceRepository.findByConceptId(con_Java_Operators.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_Operators, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_Operators.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_Operators, "Java");
            }
            Chapter ch_Java_OOP = chapterRepository.findByNameAndSubjectId("OOP", s_Java.getId());
            if (ch_Java_OOP == null) {
                ch_Java_OOP = createChapter("OOP", s_Java);
                ch_Java_OOP = chapterRepository.save(ch_Java_OOP);
            }
            Concept con_Java_ClassandObject = conceptRepository.findByNameAndChapterId("Class and Object", ch_Java_OOP.getId());
            if (con_Java_ClassandObject == null) {
                con_Java_ClassandObject = createConcept("Class and Object", ch_Java_OOP);
                con_Java_ClassandObject = conceptRepository.save(con_Java_ClassandObject);
            }
            conceptMap.put("Class and Object", con_Java_ClassandObject);
            if (learningResourceRepository.findByConceptId(con_Java_ClassandObject.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_ClassandObject, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_ClassandObject.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_ClassandObject, "Java");
            }
            Concept con_Java_Inheritance = conceptRepository.findByNameAndChapterId("Inheritance", ch_Java_OOP.getId());
            if (con_Java_Inheritance == null) {
                con_Java_Inheritance = createConcept("Inheritance", ch_Java_OOP);
                con_Java_Inheritance = conceptRepository.save(con_Java_Inheritance);
            }
            conceptMap.put("Inheritance", con_Java_Inheritance);
            if (learningResourceRepository.findByConceptId(con_Java_Inheritance.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_Inheritance, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_Inheritance.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_Inheritance, "Java");
            }
            Concept con_Java_Polymorphism = conceptRepository.findByNameAndChapterId("Polymorphism", ch_Java_OOP.getId());
            if (con_Java_Polymorphism == null) {
                con_Java_Polymorphism = createConcept("Polymorphism", ch_Java_OOP);
                con_Java_Polymorphism = conceptRepository.save(con_Java_Polymorphism);
            }
            conceptMap.put("Polymorphism", con_Java_Polymorphism);
            if (learningResourceRepository.findByConceptId(con_Java_Polymorphism.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_Polymorphism, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_Polymorphism.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_Polymorphism, "Java");
            }
            Chapter ch_Java_Collections = chapterRepository.findByNameAndSubjectId("Collections", s_Java.getId());
            if (ch_Java_Collections == null) {
                ch_Java_Collections = createChapter("Collections", s_Java);
                ch_Java_Collections = chapterRepository.save(ch_Java_Collections);
            }
            Concept con_Java_ArrayList = conceptRepository.findByNameAndChapterId("ArrayList", ch_Java_Collections.getId());
            if (con_Java_ArrayList == null) {
                con_Java_ArrayList = createConcept("ArrayList", ch_Java_Collections);
                con_Java_ArrayList = conceptRepository.save(con_Java_ArrayList);
            }
            conceptMap.put("ArrayList", con_Java_ArrayList);
            if (learningResourceRepository.findByConceptId(con_Java_ArrayList.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_ArrayList, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_ArrayList.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_ArrayList, "Java");
            }
            Concept con_Java_HashMap = conceptRepository.findByNameAndChapterId("HashMap", ch_Java_Collections.getId());
            if (con_Java_HashMap == null) {
                con_Java_HashMap = createConcept("HashMap", ch_Java_Collections);
                con_Java_HashMap = conceptRepository.save(con_Java_HashMap);
            }
            conceptMap.put("HashMap", con_Java_HashMap);
            if (learningResourceRepository.findByConceptId(con_Java_HashMap.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_HashMap, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_HashMap.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_HashMap, "Java");
            }
            Chapter ch_Java_ExceptionHandling = chapterRepository.findByNameAndSubjectId("Exception Handling", s_Java.getId());
            if (ch_Java_ExceptionHandling == null) {
                ch_Java_ExceptionHandling = createChapter("Exception Handling", s_Java);
                ch_Java_ExceptionHandling = chapterRepository.save(ch_Java_ExceptionHandling);
            }
            Concept con_Java_trycatch = conceptRepository.findByNameAndChapterId("try/catch", ch_Java_ExceptionHandling.getId());
            if (con_Java_trycatch == null) {
                con_Java_trycatch = createConcept("try/catch", ch_Java_ExceptionHandling);
                con_Java_trycatch = conceptRepository.save(con_Java_trycatch);
            }
            conceptMap.put("try/catch", con_Java_trycatch);
            if (learningResourceRepository.findByConceptId(con_Java_trycatch.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Java_trycatch, "Java"));
            }
            if (questionRepository.countByConceptId(con_Java_trycatch.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Java_trycatch, "Java");
            }
            Subject s_Python = subjectRepository.findByName("Python");
            if (s_Python == null) {
                s_Python = createSubject("Python", "Comprehensive Python Curriculum");
                s_Python = subjectRepository.save(s_Python);
            }
            Chapter ch_Python_PythonFundamentals = chapterRepository.findByNameAndSubjectId("Python Fundamentals", s_Python.getId());
            if (ch_Python_PythonFundamentals == null) {
                ch_Python_PythonFundamentals = createChapter("Python Fundamentals", s_Python);
                ch_Python_PythonFundamentals = chapterRepository.save(ch_Python_PythonFundamentals);
            }
            Concept con_Python_Variables = conceptRepository.findByNameAndChapterId("Variables", ch_Python_PythonFundamentals.getId());
            if (con_Python_Variables == null) {
                con_Python_Variables = createConcept("Variables", ch_Python_PythonFundamentals);
                con_Python_Variables = conceptRepository.save(con_Python_Variables);
            }
            conceptMap.put("Variables", con_Python_Variables);
            if (learningResourceRepository.findByConceptId(con_Python_Variables.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Variables, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Variables.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Variables, "Python");
            }
            Concept con_Python_Loops = conceptRepository.findByNameAndChapterId("Loops", ch_Python_PythonFundamentals.getId());
            if (con_Python_Loops == null) {
                con_Python_Loops = createConcept("Loops", ch_Python_PythonFundamentals);
                con_Python_Loops = conceptRepository.save(con_Python_Loops);
            }
            conceptMap.put("Loops", con_Python_Loops);
            if (learningResourceRepository.findByConceptId(con_Python_Loops.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Loops, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Loops.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Loops, "Python");
            }
            Chapter ch_Python_DataStructures = chapterRepository.findByNameAndSubjectId("Data Structures", s_Python.getId());
            if (ch_Python_DataStructures == null) {
                ch_Python_DataStructures = createChapter("Data Structures", s_Python);
                ch_Python_DataStructures = chapterRepository.save(ch_Python_DataStructures);
            }
            Concept con_Python_Lists = conceptRepository.findByNameAndChapterId("Lists", ch_Python_DataStructures.getId());
            if (con_Python_Lists == null) {
                con_Python_Lists = createConcept("Lists", ch_Python_DataStructures);
                con_Python_Lists = conceptRepository.save(con_Python_Lists);
            }
            conceptMap.put("Lists", con_Python_Lists);
            if (learningResourceRepository.findByConceptId(con_Python_Lists.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Lists, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Lists.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Lists, "Python");
            }
            Concept con_Python_Dictionaries = conceptRepository.findByNameAndChapterId("Dictionaries", ch_Python_DataStructures.getId());
            if (con_Python_Dictionaries == null) {
                con_Python_Dictionaries = createConcept("Dictionaries", ch_Python_DataStructures);
                con_Python_Dictionaries = conceptRepository.save(con_Python_Dictionaries);
            }
            conceptMap.put("Dictionaries", con_Python_Dictionaries);
            if (learningResourceRepository.findByConceptId(con_Python_Dictionaries.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Dictionaries, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Dictionaries.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Dictionaries, "Python");
            }
            Chapter ch_Python_OOP = chapterRepository.findByNameAndSubjectId("OOP", s_Python.getId());
            if (ch_Python_OOP == null) {
                ch_Python_OOP = createChapter("OOP", s_Python);
                ch_Python_OOP = chapterRepository.save(ch_Python_OOP);
            }
            Concept con_Python_Classes = conceptRepository.findByNameAndChapterId("Classes", ch_Python_OOP.getId());
            if (con_Python_Classes == null) {
                con_Python_Classes = createConcept("Classes", ch_Python_OOP);
                con_Python_Classes = conceptRepository.save(con_Python_Classes);
            }
            conceptMap.put("Classes", con_Python_Classes);
            if (learningResourceRepository.findByConceptId(con_Python_Classes.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Classes, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Classes.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Classes, "Python");
            }
            Concept con_Python_Inheritance = conceptRepository.findByNameAndChapterId("Inheritance", ch_Python_OOP.getId());
            if (con_Python_Inheritance == null) {
                con_Python_Inheritance = createConcept("Inheritance", ch_Python_OOP);
                con_Python_Inheritance = conceptRepository.save(con_Python_Inheritance);
            }
            conceptMap.put("Inheritance", con_Python_Inheritance);
            if (learningResourceRepository.findByConceptId(con_Python_Inheritance.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Python_Inheritance, "Python"));
            }
            if (questionRepository.countByConceptId(con_Python_Inheritance.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Python_Inheritance, "Python");
            }
            Subject s_Reactjs = subjectRepository.findByName("React.js");
            if (s_Reactjs == null) {
                s_Reactjs = createSubject("React.js", "Comprehensive React.js Curriculum");
                s_Reactjs = subjectRepository.save(s_Reactjs);
            }
            Chapter ch_Reactjs_ReactFundamentals = chapterRepository.findByNameAndSubjectId("React Fundamentals", s_Reactjs.getId());
            if (ch_Reactjs_ReactFundamentals == null) {
                ch_Reactjs_ReactFundamentals = createChapter("React Fundamentals", s_Reactjs);
                ch_Reactjs_ReactFundamentals = chapterRepository.save(ch_Reactjs_ReactFundamentals);
            }
            Concept con_Reactjs_Components = conceptRepository.findByNameAndChapterId("Components", ch_Reactjs_ReactFundamentals.getId());
            if (con_Reactjs_Components == null) {
                con_Reactjs_Components = createConcept("Components", ch_Reactjs_ReactFundamentals);
                con_Reactjs_Components = conceptRepository.save(con_Reactjs_Components);
            }
            conceptMap.put("Components", con_Reactjs_Components);
            if (learningResourceRepository.findByConceptId(con_Reactjs_Components.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_Components, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_Components.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_Components, "React.js");
            }
            Concept con_Reactjs_JSX = conceptRepository.findByNameAndChapterId("JSX", ch_Reactjs_ReactFundamentals.getId());
            if (con_Reactjs_JSX == null) {
                con_Reactjs_JSX = createConcept("JSX", ch_Reactjs_ReactFundamentals);
                con_Reactjs_JSX = conceptRepository.save(con_Reactjs_JSX);
            }
            conceptMap.put("JSX", con_Reactjs_JSX);
            if (learningResourceRepository.findByConceptId(con_Reactjs_JSX.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_JSX, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_JSX.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_JSX, "React.js");
            }
            Concept con_Reactjs_Props = conceptRepository.findByNameAndChapterId("Props", ch_Reactjs_ReactFundamentals.getId());
            if (con_Reactjs_Props == null) {
                con_Reactjs_Props = createConcept("Props", ch_Reactjs_ReactFundamentals);
                con_Reactjs_Props = conceptRepository.save(con_Reactjs_Props);
            }
            conceptMap.put("Props", con_Reactjs_Props);
            if (learningResourceRepository.findByConceptId(con_Reactjs_Props.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_Props, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_Props.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_Props, "React.js");
            }
            Concept con_Reactjs_State = conceptRepository.findByNameAndChapterId("State", ch_Reactjs_ReactFundamentals.getId());
            if (con_Reactjs_State == null) {
                con_Reactjs_State = createConcept("State", ch_Reactjs_ReactFundamentals);
                con_Reactjs_State = conceptRepository.save(con_Reactjs_State);
            }
            conceptMap.put("State", con_Reactjs_State);
            if (learningResourceRepository.findByConceptId(con_Reactjs_State.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_State, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_State.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_State, "React.js");
            }
            Chapter ch_Reactjs_Hooks = chapterRepository.findByNameAndSubjectId("Hooks", s_Reactjs.getId());
            if (ch_Reactjs_Hooks == null) {
                ch_Reactjs_Hooks = createChapter("Hooks", s_Reactjs);
                ch_Reactjs_Hooks = chapterRepository.save(ch_Reactjs_Hooks);
            }
            Concept con_Reactjs_useState = conceptRepository.findByNameAndChapterId("useState", ch_Reactjs_Hooks.getId());
            if (con_Reactjs_useState == null) {
                con_Reactjs_useState = createConcept("useState", ch_Reactjs_Hooks);
                con_Reactjs_useState = conceptRepository.save(con_Reactjs_useState);
            }
            conceptMap.put("useState", con_Reactjs_useState);
            if (learningResourceRepository.findByConceptId(con_Reactjs_useState.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_useState, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_useState.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_useState, "React.js");
            }
            Concept con_Reactjs_useEffect = conceptRepository.findByNameAndChapterId("useEffect", ch_Reactjs_Hooks.getId());
            if (con_Reactjs_useEffect == null) {
                con_Reactjs_useEffect = createConcept("useEffect", ch_Reactjs_Hooks);
                con_Reactjs_useEffect = conceptRepository.save(con_Reactjs_useEffect);
            }
            conceptMap.put("useEffect", con_Reactjs_useEffect);
            if (learningResourceRepository.findByConceptId(con_Reactjs_useEffect.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_useEffect, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_useEffect.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_useEffect, "React.js");
            }
            Chapter ch_Reactjs_ReactRouter = chapterRepository.findByNameAndSubjectId("React Router", s_Reactjs.getId());
            if (ch_Reactjs_ReactRouter == null) {
                ch_Reactjs_ReactRouter = createChapter("React Router", s_Reactjs);
                ch_Reactjs_ReactRouter = chapterRepository.save(ch_Reactjs_ReactRouter);
            }
            Concept con_Reactjs_Routing = conceptRepository.findByNameAndChapterId("Routing", ch_Reactjs_ReactRouter.getId());
            if (con_Reactjs_Routing == null) {
                con_Reactjs_Routing = createConcept("Routing", ch_Reactjs_ReactRouter);
                con_Reactjs_Routing = conceptRepository.save(con_Reactjs_Routing);
            }
            conceptMap.put("Routing", con_Reactjs_Routing);
            if (learningResourceRepository.findByConceptId(con_Reactjs_Routing.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_Reactjs_Routing, "React.js"));
            }
            if (questionRepository.countByConceptId(con_Reactjs_Routing.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_Reactjs_Routing, "React.js");
            }
            Subject s_AutomataTheory = subjectRepository.findByName("Automata Theory");
            if (s_AutomataTheory == null) {
                s_AutomataTheory = createSubject("Automata Theory", "Comprehensive Automata Theory Curriculum");
                s_AutomataTheory = subjectRepository.save(s_AutomataTheory);
            }
            Chapter ch_AutomataTheory_Foundations = chapterRepository.findByNameAndSubjectId("Foundations", s_AutomataTheory.getId());
            if (ch_AutomataTheory_Foundations == null) {
                ch_AutomataTheory_Foundations = createChapter("Foundations", s_AutomataTheory);
                ch_AutomataTheory_Foundations = chapterRepository.save(ch_AutomataTheory_Foundations);
            }
            Concept con_AutomataTheory_Alphabet = conceptRepository.findByNameAndChapterId("Alphabet", ch_AutomataTheory_Foundations.getId());
            if (con_AutomataTheory_Alphabet == null) {
                con_AutomataTheory_Alphabet = createConcept("Alphabet", ch_AutomataTheory_Foundations);
                con_AutomataTheory_Alphabet = conceptRepository.save(con_AutomataTheory_Alphabet);
            }
            conceptMap.put("Alphabet", con_AutomataTheory_Alphabet);
            if (learningResourceRepository.findByConceptId(con_AutomataTheory_Alphabet.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_AutomataTheory_Alphabet, "Automata Theory"));
            }
            if (questionRepository.countByConceptId(con_AutomataTheory_Alphabet.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_AutomataTheory_Alphabet, "Automata Theory");
            }
            Concept con_AutomataTheory_Language = conceptRepository.findByNameAndChapterId("Language", ch_AutomataTheory_Foundations.getId());
            if (con_AutomataTheory_Language == null) {
                con_AutomataTheory_Language = createConcept("Language", ch_AutomataTheory_Foundations);
                con_AutomataTheory_Language = conceptRepository.save(con_AutomataTheory_Language);
            }
            conceptMap.put("Language", con_AutomataTheory_Language);
            if (learningResourceRepository.findByConceptId(con_AutomataTheory_Language.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_AutomataTheory_Language, "Automata Theory"));
            }
            if (questionRepository.countByConceptId(con_AutomataTheory_Language.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_AutomataTheory_Language, "Automata Theory");
            }
            Chapter ch_AutomataTheory_FiniteAutomata = chapterRepository.findByNameAndSubjectId("Finite Automata", s_AutomataTheory.getId());
            if (ch_AutomataTheory_FiniteAutomata == null) {
                ch_AutomataTheory_FiniteAutomata = createChapter("Finite Automata", s_AutomataTheory);
                ch_AutomataTheory_FiniteAutomata = chapterRepository.save(ch_AutomataTheory_FiniteAutomata);
            }
            Concept con_AutomataTheory_DFA = conceptRepository.findByNameAndChapterId("DFA", ch_AutomataTheory_FiniteAutomata.getId());
            if (con_AutomataTheory_DFA == null) {
                con_AutomataTheory_DFA = createConcept("DFA", ch_AutomataTheory_FiniteAutomata);
                con_AutomataTheory_DFA = conceptRepository.save(con_AutomataTheory_DFA);
            }
            conceptMap.put("DFA", con_AutomataTheory_DFA);
            if (learningResourceRepository.findByConceptId(con_AutomataTheory_DFA.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_AutomataTheory_DFA, "Automata Theory"));
            }
            if (questionRepository.countByConceptId(con_AutomataTheory_DFA.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_AutomataTheory_DFA, "Automata Theory");
            }
            Concept con_AutomataTheory_NFA = conceptRepository.findByNameAndChapterId("NFA", ch_AutomataTheory_FiniteAutomata.getId());
            if (con_AutomataTheory_NFA == null) {
                con_AutomataTheory_NFA = createConcept("NFA", ch_AutomataTheory_FiniteAutomata);
                con_AutomataTheory_NFA = conceptRepository.save(con_AutomataTheory_NFA);
            }
            conceptMap.put("NFA", con_AutomataTheory_NFA);
            if (learningResourceRepository.findByConceptId(con_AutomataTheory_NFA.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_AutomataTheory_NFA, "Automata Theory"));
            }
            if (questionRepository.countByConceptId(con_AutomataTheory_NFA.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_AutomataTheory_NFA, "Automata Theory");
            }
            Chapter ch_AutomataTheory_RegularLanguages = chapterRepository.findByNameAndSubjectId("Regular Languages", s_AutomataTheory.getId());
            if (ch_AutomataTheory_RegularLanguages == null) {
                ch_AutomataTheory_RegularLanguages = createChapter("Regular Languages", s_AutomataTheory);
                ch_AutomataTheory_RegularLanguages = chapterRepository.save(ch_AutomataTheory_RegularLanguages);
            }
            Concept con_AutomataTheory_RegularExpressions = conceptRepository.findByNameAndChapterId("Regular Expressions", ch_AutomataTheory_RegularLanguages.getId());
            if (con_AutomataTheory_RegularExpressions == null) {
                con_AutomataTheory_RegularExpressions = createConcept("Regular Expressions", ch_AutomataTheory_RegularLanguages);
                con_AutomataTheory_RegularExpressions = conceptRepository.save(con_AutomataTheory_RegularExpressions);
            }
            conceptMap.put("Regular Expressions", con_AutomataTheory_RegularExpressions);
            if (learningResourceRepository.findByConceptId(con_AutomataTheory_RegularExpressions.getId()).isEmpty()) {
                learningResourceRepository.save(createSpecificResource(con_AutomataTheory_RegularExpressions, "Automata Theory"));
            }
            if (questionRepository.countByConceptId(con_AutomataTheory_RegularExpressions.getId()) < 24) {
                generateSpecificQuestions(questionRepository, con_AutomataTheory_RegularExpressions, "Automata Theory");
            }

            // Set Prerequisites
            if (conceptMap.get("Data Models") != null) {
                conceptMap.get("Data Models").setPrerequisites(Arrays.asList(conceptMap.get("Database vs File System")));
                conceptRepository.save(conceptMap.get("Data Models"));
            }
            if (conceptMap.get("Data Independence") != null) {
                conceptMap.get("Data Independence").setPrerequisites(Arrays.asList(conceptMap.get("Data Models")));
                conceptRepository.save(conceptMap.get("Data Independence"));
            }
            if (conceptMap.get("INSERT") != null) {
                conceptMap.get("INSERT").setPrerequisites(Arrays.asList(conceptMap.get("CREATE TABLE")));
                conceptRepository.save(conceptMap.get("INSERT"));
            }
            if (conceptMap.get("SELECT") != null) {
                conceptMap.get("SELECT").setPrerequisites(Arrays.asList(conceptMap.get("INSERT")));
                conceptRepository.save(conceptMap.get("SELECT"));
            }
            if (conceptMap.get("JOIN") != null) {
                conceptMap.get("JOIN").setPrerequisites(Arrays.asList(conceptMap.get("SELECT")));
                conceptRepository.save(conceptMap.get("JOIN"));
            }
            if (conceptMap.get("GROUP BY") != null) {
                conceptMap.get("GROUP BY").setPrerequisites(Arrays.asList(conceptMap.get("SELECT")));
                conceptRepository.save(conceptMap.get("GROUP BY"));
            }
            if (conceptMap.get("1NF") != null) {
                conceptMap.get("1NF").setPrerequisites(Arrays.asList(conceptMap.get("Functional Dependency")));
                conceptRepository.save(conceptMap.get("1NF"));
            }
            if (conceptMap.get("2NF") != null) {
                conceptMap.get("2NF").setPrerequisites(Arrays.asList(conceptMap.get("1NF")));
                conceptRepository.save(conceptMap.get("2NF"));
            }
            if (conceptMap.get("3NF") != null) {
                conceptMap.get("3NF").setPrerequisites(Arrays.asList(conceptMap.get("2NF")));
                conceptRepository.save(conceptMap.get("3NF"));
            }
            if (conceptMap.get("Concurrency") != null) {
                conceptMap.get("Concurrency").setPrerequisites(Arrays.asList(conceptMap.get("ACID Properties")));
                conceptRepository.save(conceptMap.get("Concurrency"));
            }
            if (conceptMap.get("Insertion") != null) {
                conceptMap.get("Insertion").setPrerequisites(Arrays.asList(conceptMap.get("Traversal")));
                conceptRepository.save(conceptMap.get("Insertion"));
            }
            if (conceptMap.get("Deletion") != null) {
                conceptMap.get("Deletion").setPrerequisites(Arrays.asList(conceptMap.get("Traversal")));
                conceptRepository.save(conceptMap.get("Deletion"));
            }
            if (conceptMap.get("BST") != null) {
                conceptMap.get("BST").setPrerequisites(Arrays.asList(conceptMap.get("Binary Tree")));
                conceptRepository.save(conceptMap.get("BST"));
            }
            if (conceptMap.get("Merge Sort") != null) {
                conceptMap.get("Merge Sort").setPrerequisites(Arrays.asList(conceptMap.get("Bubble Sort")));
                conceptRepository.save(conceptMap.get("Merge Sort"));
            }
            if (conceptMap.get("Inheritance") != null) {
                conceptMap.get("Inheritance").setPrerequisites(Arrays.asList(conceptMap.get("Class and Object")));
                conceptRepository.save(conceptMap.get("Inheritance"));
            }
            if (conceptMap.get("Polymorphism") != null) {
                conceptMap.get("Polymorphism").setPrerequisites(Arrays.asList(conceptMap.get("Inheritance")));
                conceptRepository.save(conceptMap.get("Polymorphism"));
            }
            if (conceptMap.get("HashMap") != null) {
                conceptMap.get("HashMap").setPrerequisites(Arrays.asList(conceptMap.get("ArrayList")));
                conceptRepository.save(conceptMap.get("HashMap"));
            }
            if (conceptMap.get("Dictionaries") != null) {
                conceptMap.get("Dictionaries").setPrerequisites(Arrays.asList(conceptMap.get("Lists")));
                conceptRepository.save(conceptMap.get("Dictionaries"));
            }
            if (conceptMap.get("JSX") != null) {
                conceptMap.get("JSX").setPrerequisites(Arrays.asList(conceptMap.get("Components")));
                conceptRepository.save(conceptMap.get("JSX"));
            }
            if (conceptMap.get("Props") != null) {
                conceptMap.get("Props").setPrerequisites(Arrays.asList(conceptMap.get("JSX")));
                conceptRepository.save(conceptMap.get("Props"));
            }
            if (conceptMap.get("State") != null) {
                conceptMap.get("State").setPrerequisites(Arrays.asList(conceptMap.get("Props")));
                conceptRepository.save(conceptMap.get("State"));
            }
            if (conceptMap.get("useState") != null) {
                conceptMap.get("useState").setPrerequisites(Arrays.asList(conceptMap.get("State")));
                conceptRepository.save(conceptMap.get("useState"));
            }
            if (conceptMap.get("useEffect") != null) {
                conceptMap.get("useEffect").setPrerequisites(Arrays.asList(conceptMap.get("useState")));
                conceptRepository.save(conceptMap.get("useEffect"));
            }
            if (conceptMap.get("NFA") != null) {
                conceptMap.get("NFA").setPrerequisites(Arrays.asList(conceptMap.get("DFA")));
                conceptRepository.save(conceptMap.get("NFA"));
            }

        };
    }
    
    private void generateSpecificQuestions(QuestionRepository qr, Concept c, String subject) {
        String[] diffs = {"EASY", "MEDIUM", "HARD"};
        String cName = c.getName();
        
        for(String diff : diffs) {
            for(int i=1; i<=8; i++) {
                Question q = new Question();
                q.setConcept(c);
                q.setDifficultyLevel(diff);
                
                String qText = "";
                String opA = "", opB = "", opC = "", opD = "";
                String ans = "";
                
                int seed = (cName.hashCode() + diff.hashCode() + i) % 4;
                if (seed < 0) seed = -seed; // Fix for negative hash code
                
                if (subject.equals("Java") || subject.equals("Python") || subject.equals("React.js")) {
                    qText = "Analyze this " + subject + " scenario for " + cName + " (" + diff + "): What is the expected behavior when executing standard operations?";
                    if(diff.equals("HARD")) qText = "Debug this edge-case in " + cName + ": A system throws an error at runtime. What is the most likely architectural cause?";
                    if(diff.equals("EASY")) qText = "What is the primary syntax/definition used to declare or utilize " + cName + " in " + subject + "?";
                } else if (subject.equals("Database Management")) {
                    qText = "Consider a relational database schema involving " + cName + ". If a query executes at " + diff + " difficulty, which principle applies?";
                    if(diff.equals("HARD")) qText = "Evaluate the performance and locking implications of " + cName + " in a highly concurrent transaction environment.";
                } else if (subject.equals("Data Structures")) {
                    qText = "What is the worst-case time complexity or structural property of " + cName + " during standard operations?";
                } else {
                    qText = "In the context of Automata Theory, how does a finite state machine handle " + cName + " transitions?";
                }
                
                // Distribute answers safely
                if (seed == 0) {
                    opA = "It correctly implements the " + cName + " standard.";
                    opB = "It causes an infinite loop or deadlock.";
                    opC = "It throws a compilation or syntax error.";
                    opD = "It violates the foundational axioms.";
                    ans = "A";
                } else if (seed == 1) {
                    opA = "O(N) linear scan.";
                    opB = "The standard valid behavior for " + cName + " executes successfully.";
                    opC = "A memory leak occurs.";
                    opD = "Returns null or undefined.";
                    ans = "B";
                } else if (seed == 2) {
                    opA = "Only works in single-threaded environments.";
                    opB = "Requires a primary key definition.";
                    opC = "The definition uniquely matches the core constraints of " + cName + ".";
                    opD = "Fails at compile-time.";
                    ans = "C";
                } else {
                    opA = "Throws a NullPointerException.";
                    opB = "Defaults to a Cartesian product.";
                    opC = "Halts the Turing machine.";
                    opD = "This describes the precise algorithmic mechanism of " + cName + ".";
                    ans = "D";
                }
                
                q.setText(qText);
                q.setOptionA(opA);
                q.setOptionB(opB);
                q.setOptionC(opC);
                q.setOptionD(opD);
                q.setCorrectOption(ans);
                qr.save(q);
            }
        }
    }

    private LearningResource createSpecificResource(Concept c, String subject) {
        LearningResource lr = new LearningResource();
        lr.setConcept(c);
        lr.setTitle("Mastering " + c.getName());
        lr.setShortExplanation(c.getName() + " is an essential engineering paradigm in " + subject + ".");
        lr.setDetailedExplanation("A thorough architectural breakdown of " + c.getName() + ". In " + subject + ", this concept is implemented by defining specific data schemas or code structures. It is widely used to optimize memory, scale databases, or build declarative UI components.");
        lr.setKeyPoints("1. Core logic relies on standard definitions.\n2. Efficiency is determined by implementation.\n3. Avoid typical anti-patterns associated with " + c.getName());
        lr.setSyntaxOrStructure("Example Structure:\n// Implementation of " + c.getName() + "\ninvoke(" + c.getName() + ");");
        lr.setRealWorldExample("Enterprise applications utilize " + c.getName() + " to handle millions of requests concurrently without data corruption.");
        lr.setWorkedExample("Step 1: Initialize " + c.getName() + "\nStep 2: Process input data\nStep 3: Return output.");
        lr.setPracticeHint("Always check edge cases like null values, empty sets, and concurrency limits when implementing " + c.getName() + ".");
        lr.setCommonMistakes("- Forgetting to initialize or cleanup resources.\n- O(N^2) complexity due to nested loops.\n- Syntax errors in configuration.");
        lr.setExamPoints("Understand the difference between " + c.getName() + " and related concepts. Be prepared to analyze time complexity and architectural trade-offs.");
        return lr;
    }

    private Subject createSubject(String name, String desc) {
        Subject s = new Subject(); s.setName(name); s.setDescription(desc); return s;
    }
    private Chapter createChapter(String name, Subject subject) {
        Chapter c = new Chapter(); c.setName(name); c.setSubject(subject); return c;
    }
    private Concept createConcept(String name, Chapter chapter) {
        Concept c = new Concept(); c.setName(name); c.setChapter(chapter); return c;
    }
}
