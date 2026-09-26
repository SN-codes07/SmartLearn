import json

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
            
            // 1. Create or get Demo Student
            if (userRepository.findByEmail("student@example.com").isEmpty()) {
                User student = new User();
                student.setName("Demo Student");
                student.setEmail("student@example.com");
                student.setPassword("hackathon123");
                userRepository.save(student);
            }

            // Map to store concepts for prerequisite linking
            Map<String, Concept> conceptMap = new HashMap<>();

            // Data Definition
"""

subjects_data = [
    {
        "name": "Database Management", "desc": "Database Management Systems",
        "chapters": [
            {
                "name": "SQL",
                "concepts": [
                    {
                        "name": "JOIN",
                        "prereqs": [],
                        "res": ["SQL JOIN", "Combines rows from two or more tables.", "SELECT * FROM A JOIN B ON A.id = B.a_id;", "Understand INNER vs OUTER join."],
                        "detailed": "JOIN is one of the most fundamental concepts in relational databases. It allows you to query data spanning multiple tables. An INNER JOIN returns records that have matching values in both tables. A LEFT JOIN returns all records from the left table, and matched records from the right table.",
                        "keyPoints": "1. INNER JOIN matches both tables.\\n2. LEFT JOIN keeps all left rows.\\n3. Performance can degrade if joining large tables without indexes.",
                        "syntax": "SELECT columns\\nFROM table1\\n[INNER | LEFT | RIGHT] JOIN table2\\nON table1.column = table2.column;",
                        "realWorld": "An e-commerce platform uses JOINs to combine the 'Orders' table with the 'Users' table.",
                        "workedExample": "Query:\\nSELECT e.name, d.department_name\\nFROM employees e\\nJOIN departments d ON e.dept_id = d.id;",
                        "commonMistakes": "- Using WHERE instead of ON.\\n- Creating a Cartesian product (CROSS JOIN) accidentally.",
                        "examPoints": "Difference between INNER JOIN and LEFT JOIN.\\nWhat happens if the ON clause is missing?",
                        "questions": [
                            {"diff": "EASY", "text": "Which SQL clause is used to combine rows from two or more tables?", "a": "JOIN", "b": "MERGE", "c": "COMBINE", "d": "UNION"},
                            {"diff": "EASY", "text": "Which type of JOIN returns only the rows that have matching values in both tables?", "a": "INNER JOIN", "b": "LEFT JOIN", "c": "RIGHT JOIN", "d": "FULL OUTER JOIN"},
                            {"diff": "EASY", "text": "In a JOIN operation, which keyword specifies the condition for matching rows?", "a": "ON", "b": "WHERE", "c": "MATCH", "d": "LINK"},
                            {"diff": "MEDIUM", "text": "What happens if you omit the ON clause when joining two tables?", "a": "Cross Join (Cartesian Product)", "b": "Syntax Error", "c": "Inner Join by default", "d": "Zero rows returned"},
                            {"diff": "MEDIUM", "text": "Which JOIN returns all records from the left table?", "a": "LEFT JOIN", "b": "RIGHT JOIN", "c": "INNER JOIN", "d": "OUTER JOIN"},
                            {"diff": "MEDIUM", "text": "If there is no match in the right table for a left join, what value is returned?", "a": "NULL", "b": "0", "c": "Empty String", "d": "Error"},
                            {"diff": "MEDIUM", "text": "What is the purpose of a Self Join?", "a": "To join a table to itself", "b": "To join a table with a view", "c": "To combine databases", "d": "To join without foreign keys"},
                            {"diff": "HARD", "text": "Identify customers who have NEVER placed an order (Customers left joins Orders)", "a": "SELECT * FROM Customers c LEFT JOIN Orders o ON c.id = o.c_id WHERE o.id IS NULL", "b": "SELECT * FROM Customers c INNER JOIN Orders o WHERE o.id = 0", "c": "SELECT * FROM Customers c RIGHT JOIN Orders", "d": "SELECT * FROM Customers c JOIN Orders o WHERE o.amount = 0"},
                            {"diff": "HARD", "text": "What is the key difference between UNION and JOIN?", "a": "UNION combines vertically, JOIN combines horizontally", "b": "JOIN combines vertically, UNION combines horizontally", "c": "UNION works on a single table", "d": "No difference"},
                            {"diff": "HARD", "text": "Which JOIN is equivalent to performing a LEFT JOIN and a RIGHT JOIN combined?", "a": "FULL OUTER JOIN", "b": "CROSS JOIN", "c": "COMPLETE JOIN", "d": "NATURAL JOIN"}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "name": "Java", "desc": "Java Programming Language",
        "chapters": [
            {
                "name": "OOP",
                "concepts": [
                    {
                        "name": "Inheritance",
                        "prereqs": [],
                        "res": ["Java Inheritance", "Derives properties from an existing class.", "class Dog extends Animal {}", "Use 'extends' keyword."],
                        "detailed": "Inheritance promotes code reusability and establishes an IS-A relationship. The 'super' keyword accesses the parent's methods and constructors.",
                        "keyPoints": "1. Promotes code reuse.\\n2. Subclasses inherit non-private members.\\n3. Object is the root class of all classes in Java.",
                        "syntax": "class ChildClass extends ParentClass {\\n    // Inherits fields\\n}",
                        "realWorld": "In a UI framework, 'Button' inherits from a generic 'Widget' class.",
                        "workedExample": "class Animal { void eat() {} }\\nclass Dog extends Animal { void bark() {} }",
                        "commonMistakes": "- Extending multiple classes.\\n- Forgetting to call super() if parent has no default constructor.",
                        "examPoints": "Why doesn't Java support multiple inheritance? (Diamond Problem).\\nDifference between 'extends' and 'implements'.",
                        "questions": [
                            {"diff": "EASY", "text": "Which keyword is used in Java to inherit a class?", "a": "extends", "b": "implements", "c": "inherits", "d": "super"},
                            {"diff": "EASY", "text": "What type of relationship does inheritance represent?", "a": "IS-A relationship", "b": "HAS-A relationship", "c": "USES-A relationship", "d": "PART-OF relationship"},
                            {"diff": "EASY", "text": "Which of these classes is the superclass of all classes in Java?", "a": "Object", "b": "Class", "c": "String", "d": "System"},
                            {"diff": "MEDIUM", "text": "Does Java support multiple inheritance for classes?", "a": "No, it causes the diamond problem", "b": "Yes, always", "c": "Yes, but only abstract classes", "d": "Yes, using the implements keyword"},
                            {"diff": "MEDIUM", "text": "Which keyword is used to call a parent class constructor?", "a": "super()", "b": "parent()", "c": "this()", "d": "base()"},
                            {"diff": "MEDIUM", "text": "If a class is marked as 'final', what does it mean?", "a": "It cannot be subclassed", "b": "It must be subclassed", "c": "It cannot have variables", "d": "It can extend multiple classes"},
                            {"diff": "MEDIUM", "text": "Are private members of a superclass accessible in the subclass?", "a": "No, not directly", "b": "Yes, always", "c": "Yes, if in same package", "d": "Only through super keyword"},
                            {"diff": "HARD", "text": "If parent A has A(int x) and no default constructor, what must child B do?", "a": "Explicitly call super(x)", "b": "B cannot have a constructor", "c": "B inherits automatically", "d": "B must be abstract"},
                            {"diff": "HARD", "text": "What is the output: class A { A(){print(A);} } class B extends A { B(){print(B);} } new B();", "a": "AB", "b": "BA", "c": "B", "d": "A"},
                            {"diff": "HARD", "text": "Which statement is true about method overriding?", "a": "Same signature as parent", "b": "More restrictive access", "c": "Happens at compile-time", "d": "Static methods can be overridden"}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "name": "Python", "desc": "Python Programming",
        "chapters": [
            {
                "name": "Data Structures",
                "concepts": [
                    {
                        "name": "Python Lists",
                        "prereqs": [],
                        "res": ["Python Lists", "Mutable sequence of elements.", "my_list = [1, 2, 'hello']", "Can hold mixed types."],
                        "detailed": "Lists are versatile arrays in Python. They are dynamically sized, mutable, and can store objects of mixed data types. They are indexed starting at 0 and support slicing.",
                        "keyPoints": "1. Ordered and mutable.\\n2. Zero-indexed.\\n3. Slicing uses list[start:stop:step].",
                        "syntax": "list_name = [item1, item2]\\nlist_name.append(item3)",
                        "realWorld": "Storing a sequence of incoming sensor readings or a queue of messages.",
                        "workedExample": "nums = [10, 20, 30]\\nnums.append(40)\\nprint(nums[1:3]) # [20, 30]",
                        "commonMistakes": "- IndexError from accessing out of bounds.\\n- Modifying a list while iterating over it.",
                        "examPoints": "Difference between append() and extend().\\nHow does slicing work?",
                        "questions": [
                            {"diff": "EASY", "text": "How do you create a list in Python?", "a": "[]", "b": "()", "c": "{}", "d": "<>"},
                            {"diff": "EASY", "text": "Are lists in Python mutable?", "a": "Yes", "b": "No", "c": "Only integer lists", "d": "Only string lists"},
                            {"diff": "EASY", "text": "What is the index of the first element in a Python list?", "a": "0", "b": "1", "c": "-1", "d": "None"},
                            {"diff": "MEDIUM", "text": "Which method adds a single element to the end of a list?", "a": "append()", "b": "extend()", "c": "insert()", "d": "add()"},
                            {"diff": "MEDIUM", "text": "What is the output of [1, 2] + [3, 4]?", "a": "[1, 2, 3, 4]", "b": "[4, 6]", "c": "Error", "d": "[[1,2], [3,4]]"},
                            {"diff": "MEDIUM", "text": "How do you get the last element of a list?", "a": "list[-1]", "b": "list.last()", "c": "list[0]", "d": "list[-0]"},
                            {"diff": "MEDIUM", "text": "What does list.insert(0, 'x') do?", "a": "Inserts 'x' at the beginning", "b": "Replaces the first element", "c": "Appends 'x'", "d": "Error"},
                            {"diff": "HARD", "text": "What is the output of list[1:4] if list = [0,1,2,3,4,5]?", "a": "[1, 2, 3]", "b": "[1, 2, 3, 4]", "c": "[2, 3, 4]", "d": "Error"},
                            {"diff": "HARD", "text": "What is the difference between append() and extend()?", "a": "append adds an object, extend adds elements of an iterable", "b": "extend adds an object, append adds elements", "c": "No difference", "d": "append is faster"},
                            {"diff": "HARD", "text": "What is the time complexity of popping the first element (list.pop(0))?", "a": "O(N)", "b": "O(1)", "c": "O(log N)", "d": "O(N^2)"}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "name": "React.js", "desc": "React Frontend Library",
        "chapters": [
            {
                "name": "Hooks",
                "concepts": [
                    {
                        "name": "useEffect",
                        "prereqs": [],
                        "res": ["useEffect Hook", "Perform side effects in components.", "useEffect(() => {}, []);", "Dependency array matters."],
                        "detailed": "useEffect lets you synchronize a component with an external system. It replaces lifecycle methods like componentDidMount and componentWillUnmount.",
                        "keyPoints": "1. Runs after render.\\n2. Empty array [] runs once.\\n3. Returns a cleanup function.",
                        "syntax": "useEffect(() => {\\n  // effect\\n  return () => { // cleanup };\\n}, [dependencies]);",
                        "realWorld": "Fetching data from an API when the page loads, or setting up a WebSocket connection.",
                        "workedExample": "useEffect(() => {\\n  fetch('/api/data')\\n}, []);",
                        "commonMistakes": "- Forgetting the dependency array (causes infinite loops).\\n- Mutating state directly inside without dependencies.",
                        "examPoints": "What happens if you omit the dependency array?\\nHow do you run an effect only once?",
                        "questions": [
                            {"diff": "EASY", "text": "What is the primary purpose of useEffect?", "a": "Performing side effects", "b": "Styling components", "c": "Managing routing", "d": "Creating HTML"},
                            {"diff": "EASY", "text": "When does useEffect run by default if no dependency array is provided?", "a": "After every render", "b": "Only once", "c": "Before rendering", "d": "Never"},
                            {"diff": "EASY", "text": "Which of these is a valid side effect?", "a": "Fetching API data", "b": "Returning JSX", "c": "Defining a variable", "d": "Importing CSS"},
                            {"diff": "MEDIUM", "text": "How do you make useEffect run ONLY once when the component mounts?", "a": "Pass an empty array []", "b": "Pass no array", "c": "Pass [once]", "d": "Return false"},
                            {"diff": "MEDIUM", "text": "What does returning a function from useEffect do?", "a": "Acts as a cleanup function", "b": "Triggers a re-render", "c": "Updates the DOM", "d": "Throws an error"},
                            {"diff": "MEDIUM", "text": "If `count` is in the dependency array, when does the effect run?", "a": "When `count` changes", "b": "Every second", "c": "Only once", "d": "When component unmounts"},
                            {"diff": "MEDIUM", "text": "Can useEffect be used in class components?", "a": "No", "b": "Yes", "c": "Only with Higher Order Components", "d": "Yes, if imported specially"},
                            {"diff": "HARD", "text": "What happens if a state variable used inside useEffect is omitted from the dependency array?", "a": "Stale closure bug (reads old value)", "b": "Compile error", "c": "Infinite loop", "d": "React auto-adds it"},
                            {"diff": "HARD", "text": "Why should you NOT make the useEffect callback function `async` directly?", "a": "It returns a Promise, violating the cleanup function return signature", "b": "React blocks async effects", "c": "It causes memory leaks", "d": "It blocks rendering"},
                            {"diff": "HARD", "text": "When exactly does the cleanup function run?", "a": "Before the component unmounts and before the next effect execution", "b": "After the next render", "c": "Synchronously during render", "d": "Only when the tab closes"}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "name": "Automata Theory", "desc": "Theory of Computation",
        "chapters": [
            {
                "name": "Finite Automata",
                "concepts": [
                    {
                        "name": "DFA",
                        "prereqs": [],
                        "res": ["DFA", "Deterministic Finite Automaton.", "Q, Σ, δ, q0, F", "Exactly one transition per symbol."],
                        "detailed": "A DFA is a finite state machine that accepts or rejects strings of symbols. For each state and input symbol, there is exactly one transition to a next state.",
                        "keyPoints": "1. 5-tuple (Q, Σ, δ, q0, F).\\n2. No epsilon transitions.\\n3. Deterministic.",
                        "syntax": "Transition function: δ(q, a) = p",
                        "realWorld": "Lexical analyzers in compilers use DFAs to recognize keywords and tokens.",
                        "workedExample": "DFA for strings ending in '0':\\nState A ->(0)-> B, A->(1)-> A\\nB is accepting.",
                        "commonMistakes": "- Creating missing transitions (DFA must have one for every symbol).\\n- Confusing it with NFA.",
                        "examPoints": "Formal definition of a DFA.\\nDifference between DFA and NFA.",
                        "questions": [
                            {"diff": "EASY", "text": "What does DFA stand for?", "a": "Deterministic Finite Automaton", "b": "Discrete Finite Automaton", "c": "Dynamic Finite Automaton", "d": "Data Flow Automaton"},
                            {"diff": "EASY", "text": "Does a DFA allow epsilon (empty string) transitions?", "a": "No", "b": "Yes", "c": "Only in the start state", "d": "Only in final states"},
                            {"diff": "EASY", "text": "How many transitions must exist for a specific state and input symbol in a DFA?", "a": "Exactly one", "b": "Zero or one", "c": "Multiple", "d": "At least one"},
                            {"diff": "MEDIUM", "text": "What are the components of a DFA's 5-tuple?", "a": "Q, Σ, δ, q0, F", "b": "S, V, P, R, E", "c": "N, E, T, S, F", "d": "Q, E, P, q0, A"},
                            {"diff": "MEDIUM", "text": "In a DFA, what is 'F'?", "a": "Set of accept/final states", "b": "Transition function", "c": "Start state", "d": "Alphabet"},
                            {"diff": "MEDIUM", "text": "If a string finishes processing and the DFA is NOT in a state belonging to F, the string is:", "a": "Rejected", "b": "Accepted", "c": "Looped", "d": "Crashed"},
                            {"diff": "MEDIUM", "text": "Are DFA and NFA equivalent in power (i.e. can recognize the same set of languages)?", "a": "Yes", "b": "No", "c": "Only for finite languages", "d": "Only for context-free languages"},
                            {"diff": "HARD", "text": "Which of the following is true regarding the transition function δ in a DFA?", "a": "δ: Q x Σ -> Q", "b": "δ: Q x Σ -> P(Q)", "c": "δ: Q x (Σ U ε) -> Q", "d": "δ: P(Q) x Σ -> Q"},
                            {"diff": "HARD", "text": "What is the maximum number of states in the minimal DFA equivalent to an NFA with N states?", "a": "2^N", "b": "N^2", "c": "N!", "d": "2N"},
                            {"diff": "HARD", "text": "Which property is NOT closed under regular languages (and thus DFAs)?", "a": "Infinite union", "b": "Complement", "c": "Intersection", "d": "Concatenation"}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "name": "Data Structures", "desc": "Data Structures and Algorithms",
        "chapters": [
            {
                "name": "Trees",
                "concepts": [
                    {
                        "name": "Binary Tree",
                        "prereqs": [],
                        "res": ["Binary Tree", "Tree where each node has at most two children.", "node.left, node.right", "Understand height and depth."],
                        "detailed": "A tree data structure in which each node has at most two children, referred to as the left child and the right child. It forms the basis of BSTs and heaps.",
                        "keyPoints": "1. At most two children.\\n2. Height is max depth.\\n3. Traversals: Preorder, Inorder, Postorder.",
                        "syntax": "class Node {\\n  int val;\\n  Node left, right;\\n}",
                        "realWorld": "Expression parsing and evaluation in compilers.",
                        "workedExample": "Root(1) -> Left(2), Right(3)",
                        "commonMistakes": "- Null pointer exceptions when traversing leaves.",
                        "examPoints": "Maximum number of nodes at level L is 2^L.",
                        "questions": [
                            {"diff": "EASY", "text": "What is the maximum number of children a binary tree node can have?", "a": "2", "b": "1", "c": "3", "d": "Unlimited"},
                            {"diff": "EASY", "text": "What is the top node of a binary tree called?", "a": "Root", "b": "Leaf", "c": "Head", "d": "Parent"},
                            {"diff": "EASY", "text": "A node with no children is called a:", "a": "Leaf", "b": "Branch", "c": "Root", "d": "Stem"},
                            {"diff": "MEDIUM", "text": "What is the depth of the root node?", "a": "0", "b": "1", "c": "-1", "d": "Depends on the tree"},
                            {"diff": "MEDIUM", "text": "Which traversal visits Root, Left, Right?", "a": "Preorder", "b": "Inorder", "c": "Postorder", "d": "Level-order"},
                            {"diff": "MEDIUM", "text": "Which traversal visits Left, Root, Right?", "a": "Inorder", "b": "Preorder", "c": "Postorder", "d": "Reverse"},
                            {"diff": "MEDIUM", "text": "What is a strictly binary tree?", "a": "Every node has 0 or 2 children", "b": "Every node has 2 children", "c": "All leaves are at same level", "d": "Left < Root < Right"},
                            {"diff": "HARD", "text": "Maximum nodes in a binary tree of height h (where root is height 0) is:", "a": "2^(h+1) - 1", "b": "2^h", "c": "2^h - 1", "d": "2^(h-1)"},
                            {"diff": "HARD", "text": "If a complete binary tree has N nodes, what is its height?", "a": "O(log N)", "b": "O(N)", "c": "O(N log N)", "d": "O(1)"},
                            {"diff": "HARD", "text": "Which array representation formula finds the left child of node at index i (0-indexed)?", "a": "2i + 1", "b": "2i", "c": "2i + 2", "d": "i/2"}
                        ]
                    }
                ]
            }
        ]
    }
]

def clean_var(name):
    return name.replace(" ", "").replace(".", "").replace(",", "").replace("/", "").replace("-", "")

def escape_str(s):
    return s.replace('"', '\\"')

for s in subjects_data:
    s_var = clean_var(s["name"])
    out += f'            Subject s_{s_var} = subjectRepository.findByName("{s["name"]}");\n'
    out += f'            if (s_{s_var} == null) {{\n'
    out += f'                s_{s_var} = createSubject("{s["name"]}", "{s["desc"]}");\n'
    out += f'                s_{s_var} = subjectRepository.save(s_{s_var});\n'
    out += f'            }}\n'
    
    for c in s['chapters']:
        c_var = "ch_" + clean_var(c["name"])
        out += f'            Chapter {c_var} = chapterRepository.findByNameAndSubjectId("{c["name"]}", s_{s_var}.getId());\n'
        out += f'            if ({c_var} == null) {{\n'
        out += f'                {c_var} = createChapter("{c["name"]}", s_{s_var});\n'
        out += f'                {c_var} = chapterRepository.save({c_var});\n'
        out += f'            }}\n'
        
        for con in c['concepts']:
            con_var = "con_" + clean_var(con["name"])
            out += f'            Concept {con_var} = conceptRepository.findByNameAndChapterId("{con["name"]}", {c_var}.getId());\n'
            out += f'            if ({con_var} == null) {{\n'
            out += f'                {con_var} = createConcept("{con["name"]}", {c_var});\n'
            out += f'                {con_var} = conceptRepository.save({con_var});\n'
            out += f'            }}\n'
            out += f'            conceptMap.put("{con["name"]}", {con_var});\n'

out += """
            // Set dependencies if prerequisites were loaded properly
"""

# Prereq setting logic - keeping it minimal to avoid crashes if prereqs don't exist in map
for s in subjects_data:
    for c in s['chapters']:
        for con in c['concepts']:
            if len(con['prereqs']) > 0:
                con_var = "con_" + clean_var(con["name"])
                prereq_str = ", ".join([f'conceptMap.get("{p}")' for p in con['prereqs']])
                out += f'            if (conceptMap.get("{con["name"]}") != null) {{\n'
                out += f'                conceptMap.get("{con["name"]}").setPrerequisites(Arrays.asList({prereq_str}));\n'
                out += f'                conceptRepository.save(conceptMap.get("{con["name"]}"));\n'
                out += f'            }}\n'

out += """
            // Insert specific Questions and Resources
"""

for s in subjects_data:
    for c in s['chapters']:
        for con in c['concepts']:
            # Handle Resource
            res = con['res']
            title = escape_str(res[0])
            exp = escape_str(res[1])
            ex = escape_str(res[2])
            hint = escape_str(res[3])
            detailed = escape_str(con['detailed'])
            keyPoints = escape_str(con['keyPoints'])
            syntax = escape_str(con['syntax'])
            realWorld = escape_str(con['realWorld'])
            workedExample = escape_str(con['workedExample'])
            commonMistakes = escape_str(con['commonMistakes'])
            examPoints = escape_str(con['examPoints'])
            
            con_var = f'conceptMap.get("{con["name"]}")'
            
            out += f'            if (learningResourceRepository.findByConceptId({con_var}.getId()).isEmpty()) {{\n'
            out += f'                learningResourceRepository.save(createResource({con_var}, "{title}", "{exp}", "{ex}", "{hint}", "{detailed}", "{keyPoints}", "{syntax}", "{realWorld}", "{workedExample}", "{commonMistakes}", "{examPoints}"));\n'
            out += f'            }}\n'
            
            # Handle Questions
            out += f'            if (questionRepository.countByConceptId({con_var}.getId()) == 0) {{\n'
            for q in con['questions']:
                out += f'                questionRepository.save(createSpecificQuestion({con_var}, "{escape_str(q["text"])}", "{escape_str(q["a"])}", "{escape_str(q["b"])}", "{escape_str(q["c"])}", "{escape_str(q["d"])}", "A", "{q["diff"]}"));\n'
            out += f'            }}\n'

out += """
        };
    }

    private Question createSpecificQuestion(Concept c, String text, String a, String b, String cOpt, String d, String correct, String diff) {
        Question q = new Question();
        q.setConcept(c);
        q.setText(text);
        q.setOptionA(a);
        q.setOptionB(b);
        q.setOptionC(cOpt);
        q.setOptionD(d);
        q.setCorrectOption(correct);
        q.setDifficultyLevel(diff);
        return q;
    }

    private LearningResource createResource(Concept c, String title, String exp, String ex, String hint, String detailed, String keyPoints, String syntax, String realWorld, String worked, String mistakes, String exam) {
        LearningResource lr = new LearningResource();
        lr.setConcept(c);
        lr.setTitle(title);
        lr.setShortExplanation(exp);
        lr.setExample(ex);
        lr.setPracticeHint(hint);
        lr.setDetailedExplanation(detailed);
        lr.setKeyPoints(keyPoints);
        lr.setSyntaxOrStructure(syntax);
        lr.setRealWorldExample(realWorld);
        lr.setWorkedExample(worked);
        lr.setCommonMistakes(mistakes);
        lr.setExamPoints(exam);
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
