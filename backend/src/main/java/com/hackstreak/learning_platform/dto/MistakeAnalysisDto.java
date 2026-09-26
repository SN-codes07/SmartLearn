package com.hackstreak.learning_platform.dto;

public class MistakeAnalysisDto {
    private Long questionId;
    private String questionText;
    private String selectedOption;
    private String selectedOptionText;
    private String correctOption;
    private String correctOptionText;
    private boolean isCorrect;
    private Long conceptId;
    private String conceptName;
    private String subjectName;
    private String difficultyLevel;
    private String possibleMisconception;
    private String simpleExplanation;
    private String technicalExplanation;
    private String aiPrompt;
    private Long similarQuestionId;
    private String similarQuestionText;

    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getSelectedOption() { return selectedOption; }
    public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }

    public String getSelectedOptionText() { return selectedOptionText; }
    public void setSelectedOptionText(String selectedOptionText) { this.selectedOptionText = selectedOptionText; }

    public String getCorrectOption() { return correctOption; }
    public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

    public String getCorrectOptionText() { return correctOptionText; }
    public void setCorrectOptionText(String correctOptionText) { this.correctOptionText = correctOptionText; }

    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }

    public Long getConceptId() { return conceptId; }
    public void setConceptId(Long conceptId) { this.conceptId = conceptId; }

    public String getConceptName() { return conceptName; }
    public void setConceptName(String conceptName) { this.conceptName = conceptName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(String difficultyLevel) { this.difficultyLevel = difficultyLevel; }

    public String getPossibleMisconception() { return possibleMisconception; }
    public void setPossibleMisconception(String possibleMisconception) { this.possibleMisconception = possibleMisconception; }

    public String getSimpleExplanation() { return simpleExplanation; }
    public void setSimpleExplanation(String simpleExplanation) { this.simpleExplanation = simpleExplanation; }

    public String getTechnicalExplanation() { return technicalExplanation; }
    public void setTechnicalExplanation(String technicalExplanation) { this.technicalExplanation = technicalExplanation; }

    public String getAiPrompt() { return aiPrompt; }
    public void setAiPrompt(String aiPrompt) { this.aiPrompt = aiPrompt; }

    public Long getSimilarQuestionId() { return similarQuestionId; }
    public void setSimilarQuestionId(Long similarQuestionId) { this.similarQuestionId = similarQuestionId; }

    public String getSimilarQuestionText() { return similarQuestionText; }
    public void setSimilarQuestionText(String similarQuestionText) { this.similarQuestionText = similarQuestionText; }
}
