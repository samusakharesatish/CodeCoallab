package com.codecollab.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.codecollab.model.TypingMessage;
import com.codecollab.service.RedisService;

@Controller
public class TypingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisService redisService;

    public TypingController(SimpMessagingTemplate messagingTemplate, RedisService redisService) {
        this.messagingTemplate = messagingTemplate;
        this.redisService = redisService;
    }

    @MessageMapping("/typing")
    public void handleTyping(TypingMessage message) {
        if (message == null || message.getRoomId() == null) return;

        // 💾 Track active typing in Redis (room:{roomId}:typing)
        redisService.setUserTyping(message.getRoomId(), message.getUserId(), message.isTyping());

        // 📡 Send typing event ONLY to that room
        messagingTemplate.convertAndSend(
            "/topic/typing/" + message.getRoomId(),
            message
        );
    }
}