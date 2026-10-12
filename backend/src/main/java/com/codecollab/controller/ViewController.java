package com.codecollab.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ViewController {

    private final SimpMessagingTemplate messagingTemplate;

    public ViewController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/view")
    public void syncView(@Payload Map<String, Object> payload) {
        Object roomId = payload.get("roomId");
        if (roomId != null) {
            messagingTemplate.convertAndSend("/topic/view/" + roomId.toString(), payload);
        }
    }
}