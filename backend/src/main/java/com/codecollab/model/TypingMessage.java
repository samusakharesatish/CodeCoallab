package com.codecollab.model;

import lombok.Data;

@Data
public class TypingMessage {
    private String roomId;
    private String userId;
    private boolean isTyping;
}