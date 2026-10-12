package com.codecollab.controller;

import com.codecollab.model.ChatMessage;
import com.codecollab.model.Message;
import com.codecollab.repository.MessageRepository;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepo;

    public ChatController(SimpMessagingTemplate messagingTemplate, MessageRepository messageRepo) {
        this.messagingTemplate = messagingTemplate;
        this.messageRepo = messageRepo;
    }

    @MessageMapping("/chat")
    public void sendChat(ChatMessage chatMessage) {

        Message msg = new Message();
        msg.setRoomId(chatMessage.getRoomId());
        msg.setUserId(chatMessage.getUserId());
        msg.setUsername(chatMessage.getUsername());
        msg.setMessage(chatMessage.getMessage());
        msg.setTimestamp(chatMessage.getTimestamp());

        messageRepo.save(msg);

        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessage.getRoomId(),
                chatMessage
        );
    }
}