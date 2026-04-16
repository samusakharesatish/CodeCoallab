package com.codecollab.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.codecollab.model.TypingMessage;

@Controller
public class TypingController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/typing")
    public void handleTyping(TypingMessage message) {
        // ✅ send typing event ONLY to that room
        messagingTemplate.convertAndSend(
            "/topic/typing/" + message.getRoomId(),
            message
        );
    }
}