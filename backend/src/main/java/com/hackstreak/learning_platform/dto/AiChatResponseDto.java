package com.hackstreak.learning_platform.dto;

public class AiChatResponseDto {
    private String response;

    public AiChatResponseDto() {}
    public AiChatResponseDto(String response) { this.response = response; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
