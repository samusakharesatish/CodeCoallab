package com.codecollab.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class DrawController {

    private final SimpMessagingTemplate messagingTemplate;

    public DrawController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/draw")
    public void handleDraw(@Payload Map<String, Object> payload) {
        Object roomId = payload.get("roomId");
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/draw/" + roomId.toString(), payload);
        }
    }
}