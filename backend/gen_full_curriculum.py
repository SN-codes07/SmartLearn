import json
import re

subjects = {
    "Database Management": {
        "DBMS Fundamentals": ["Database vs File System", "Data Models", "Data Independence"],
        "SQL": ["CREATE TABLE", "INSERT", "SELECT", "JOIN", "GROUP BY"],
        "Normalization": ["Functional Dependency", "1NF", "2NF", "3NF"],
        "Transactions": ["ACID Properties", "Concurrency"]
    },
    "Data Structures": {
        "Complexity Analysis": ["Big O"],
        "Arrays": ["Traversal", "Insertion", "Deletion"],
        "Linked Lists": ["Singly Linked List"],
        "Trees": ["Binary Tree", "BST"],
        "Sorting": ["Bubble Sort", "Merge Sort"]
    },
    "Java": {
        "Java Fundamentals": ["Variables", "Operators"],
        "OOP": ["Class and Object", "Inheritance", "Polymorphism"],
        "Collections": ["ArrayList", "HashMap"],
        "Exception Handling": ["try/catch"]
    },
    "Python": {
        "Python Fundamentals": ["Variables", "Loops"],
        "Data Structures": ["Lists", "Dictionaries"],
        "OOP": ["Classes", "Inheritance"]
    },
    "React.js": {
        "React Fundamentals": ["Components", "JSX", "Props", "State"],
        "Hooks": ["useState", "useEffect"],
        "React Router": ["Routing"]
    },
    "Automata Theory": {
        "Foundations": ["Alphabet", "Language"],
        "Finite Automata": ["DFA", "NFA"],
        "Regular Languages": ["Regular Expressions"]
    }
}

prereqs = {
    "Data Models": ["Database vs File System"],
    "Data Independence": ["Data Models"],
    "INSERT": ["CREATE TABLE"],
    "SELECT": ["INSERT"],
    "JOIN": ["SELECT"],
    "GROUP BY": ["SELECT"],
    "1NF": ["Functional Dependency"],
    "2NF": ["1NF"],
    "3NF": ["2NF"],
    "Concurrency": ["ACID Properties"],
    "Insertion": ["Traversal"],
    "Deletion": ["Traversal"],
    "BST": ["Binary Tree"],
    "Merge Sort": ["Bubble Sort"],
    "Inheritance": ["Class and Object"],
    "Polymorphism": ["Inheritance"],
    "HashMap": ["ArrayList"],
    "Dictionaries": ["Lists"],
    "JSX": ["Components"],
    "Props": ["JSX"],
    "State": ["Props"],
    "useState": ["State"],
    "useEffect": ["useState"],
    "NFA": ["DFA"]
}

def clean_var(name):
    return re.sub(r'[^a-zA-Z0-9]', '', name)

out = """package com.hackstreak.learning_platform.config;

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
            if (userRepository.findByEmail("student@example.com").isEmpty()) {
                User student = new User();
                student.setName("Demo Student");
                student.setEmail("student@example.com");
                student.setPassword("hackathon123");
                userRepository.save(student);
            }

            Map<String, Concept> conceptMap = new HashMap<>();
"""

for sub, chapters in subjects.items():
    s_var = "s_" + clean_var(sub)
    out += f'            Subject {s_var} = subjectRepository.findByName("{sub}");\n'
    out += f'            if ({s_var} == null) {{\n'
    out += f'                {s_var} = createSubject("{sub}", "Comprehensive {sub} Curriculum");\n'
    out += f'                {s_var} = subjectRepository.save({s_var});\n'
    out += f'            }}\n'
    
    for ch, concepts in chapters.items():
        c_var = "ch_" + clean_var(ch)
        out += f'            Chapter {c_var} = chapterRepository.findByNameAndSubjectId("{ch}", {s_var}.getId());\n'
        out += f'            if ({c_var} == null) {{\n'
        out += f'                {c_var} = createChapter("{ch}", {s_var});\n'
        out += f'                {c_var} = chapterRepository.save({c_var});\n'
        out += f'            }}\n'
        
        for con in concepts:
            con_var = "con_" + clean_var(con)
            out += f'            Concept {con_var} = conceptRepository.findByNameAndChapterId("{con}", {c_var}.getId());\n'
            out += f'            if ({con_var} == null) {{\n'
            out += f'                {con_var} = createConcept("{con}", {c_var});\n'
            out += f'                {con_var} = conceptRepository.save({con_var});\n'
            out += f'            }}\n'
            out += f'            conceptMap.put("{con}", {con_var});\n'
            
            # Add Learning Resource
            out += f'            if (learningResourceRepository.findByConceptId({con_var}.getId()).isEmpty()) {{\n'
            out += f'                learningResourceRepository.save(createResource({con_var}));\n'
            out += f'            }}\n'
            
            # Add Questions (24 per concept)
            out += f'            if (questionRepository.countByConceptId({con_var}.getId()) < 24) {{\n'
            out += f'                generateQuestionsForConcept(questionRepository, {con_var});\n'
            out += f'            }}\n'

out += """
            // Set Prerequisites
"""
for con, pres in prereqs.items():
    pre_str = ", ".join([f'conceptMap.get("{p}")' for p in pres])
    out += f'            if (conceptMap.get("{con}") != null) {{\n'
    out += f'                conceptMap.get("{con}").setPrerequisites(Arrays.asList({pre_str}));\n'
    out += f'                conceptRepository.save(conceptMap.get("{con}"));\n'
    out += f'            }}\n'

out += """
        };
    }
    
    private void generateQuestionsForConcept(QuestionRepository qr, Concept c) {
        String[] diffs = {"EASY", "MEDIUM", "HARD"};
        int qCount = 0;
        for(String diff : diffs) {
            for(int i=1; i<=8; i++) {
                qCount++;
                Question q = new Question();
                q.setConcept(c);
                q.setDifficultyLevel(diff);
                q.setText("Understanding " + c.getName() + " - Level " + diff + " Q" + i + ": Which of the following is correct?");
                
                int ans = (qCount % 4);
                q.setOptionA(ans == 0 ? "Correct standard definition" : "Incorrect variation A");
                q.setOptionB(ans == 1 ? "Correct standard definition" : "Incorrect variation B");
                q.setOptionC(ans == 2 ? "Correct standard definition" : "Incorrect variation C");
                q.setOptionD(ans == 3 ? "Correct standard definition" : "Incorrect variation D");
                
                if (ans == 0) q.setCorrectOption("A");
                if (ans == 1) q.setCorrectOption("B");
                if (ans == 2) q.setCorrectOption("C");
                if (ans == 3) q.setCorrectOption("D");
                
                qr.save(q);
            }
        }
    }

    private LearningResource createResource(Concept c) {
        LearningResource lr = new LearningResource();
        lr.setConcept(c);
        lr.setTitle("Mastering " + c.getName());
        lr.setShortExplanation(c.getName() + " is a crucial concept in this subject.");
        lr.setExample("Example of " + c.getName() + " in action.");
        lr.setPracticeHint("Remember the key properties of " + c.getName() + ".");
        lr.setDetailedExplanation("A detailed, deep dive into " + c.getName() + " showing how it works under the hood.");
        lr.setKeyPoints("1. Important trait A\\n2. Important trait B");
        lr.setSyntaxOrStructure("Syntax/Structure for " + c.getName());
        lr.setRealWorldExample("Real world application of " + c.getName());
        lr.setWorkedExample("Step by step worked example.");
        lr.setCommonMistakes("- Common mistake 1\\n- Common mistake 2");
        lr.setExamPoints("Exam focus areas for " + c.getName());
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
"""

with open('/Users/siddharthnipane/Hackstreak-3.0/backend/src/main/java/com/hackstreak/learning_platform/config/DataInitializer.java', 'w') as f:
    f.write(out)
