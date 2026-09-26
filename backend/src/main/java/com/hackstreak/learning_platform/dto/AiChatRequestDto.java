package com.hackstreak.learning_platform.dto;

public class AiChatRequestDto {
    private Long studentId;
    private String message;
    private Long currentConceptId;

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getCurrentConceptId() { return currentConceptId; }
    public void setCurrentConceptId(Long currentConceptId) { this.currentConceptId = currentConceptId; }
}
