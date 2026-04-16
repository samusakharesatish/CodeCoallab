package com.codecollab.model;

import lombok.Data;

@Data
public class ChatMessage {

    private String roomId;
    private String userId;
    private String username;
    private String message;
    private String code;
    private int cursorPosition;
    private String timestamp;
}