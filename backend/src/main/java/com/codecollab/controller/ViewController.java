package com.codecollab.controller;

import org.springframework.stereotype.Controller; // 🔥 ADD THIS
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;

import java.util.Map;

@Controller // 🔥 REQUIRED
public class ViewController {

    @MessageMapping("/view")
    @SendTo("/topic/view")
    public Map<String, Object> syncView(@Payload Map<String, Object> payload) {
        return payload;
    }
}