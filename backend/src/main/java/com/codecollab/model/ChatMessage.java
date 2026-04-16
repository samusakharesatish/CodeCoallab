package com.codecollab.model;

import lombok.Data;

@Data
public class ChatMessage {

    private String roomId;
    private String userId;
    private String username;
    private String message;

    // 🔥 REQUIRED FOR CODE EXECUTION
    private String code;
    private String language;

    private int cursorPosition;
    private String timestamp;
}