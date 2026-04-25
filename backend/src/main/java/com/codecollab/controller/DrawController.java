package com.codecollab.controller;

import org.springframework.stereotype.Controller; // 🔥 ADD THIS
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;

import java.util.Map;

@Controller // 🔥 REQUIRED
public class DrawController {

    @MessageMapping("/draw")
    @SendTo("/topic/draw")
    public Map<String, Object> handleDraw(@Payload Map<String, Object> payload) {
        return payload;
    }
}