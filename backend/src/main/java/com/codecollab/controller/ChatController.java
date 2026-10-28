package com.codecollab.controller;

import com.codecollab.auth.UserRepository;
import com.codecollab.model.ChatMessage;
import com.codecollab.model.Message;
import com.codecollab.repository.MessageRepository;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Date;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepo;
    private final UserRepository userRepo;

    public ChatController(SimpMessagingTemplate messagingTemplate,
                          MessageRepository messageRepo,
                          UserRepository userRepo) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
    }

    @MessageMapping("/chat")
    public void sendChat(ChatMessage chatMessage, Principal principal) {
        if (chatMessage == null || chatMessage.getRoomId() == null || chatMessage.getMessage() == null) return;

        // Prevent identity spoofing: bind identity to authenticated session principal
        if (principal != null) {
            String email = principal.getName();
            chatMessage.setUserId(email);
            userRepo.findByEmail(email).ifPresent(u -> chatMessage.setUsername(u.getUsername()));
        }

        // Limit message size to prevent message spam / storage overflow
        if (chatMessage.getMessage().length() > 2000) {
            chatMessage.setMessage(chatMessage.getMessage().substring(0, 2000));
        }

        Message msg = new Message();
        msg.setRoomId(chatMessage.getRoomId());
        msg.setUserId(chatMessage.getUserId());
        msg.setUsername(chatMessage.getUsername());
        msg.setMessage(chatMessage.getMessage());
        msg.setTimestamp(chatMessage.getTimestamp() != null ? chatMessage.getTimestamp() : new Date().toString());

        messageRepo.save(msg);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessage.getRoomId(),
                chatMessage
        );
    }
}
