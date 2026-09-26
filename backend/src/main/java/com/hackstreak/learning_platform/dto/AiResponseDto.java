package com.hackstreak.learning_platform.dto;

public class AiResponseDto {
    private boolean available;
    private String response;

    public AiResponseDto() {}
    public AiResponseDto(boolean available, String response) {
        this.available = available;
        this.response = response;
    }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
