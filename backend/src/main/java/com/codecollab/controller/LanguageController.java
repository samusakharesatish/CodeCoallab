package com.codecollab.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.codecollab.model.LanguageMessage;

@Controller
public class LanguageController {

    @MessageMapping("/language")
    @SendTo("/topic/language")
    public LanguageMessage changeLanguage(LanguageMessage msg) {
        return msg;
    }
}