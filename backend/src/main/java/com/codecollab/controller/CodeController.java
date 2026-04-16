package com.codecollab.controller;

import com.codecollab.model.CodeMessage;   // ✅ FIXED (was ChatMessage)
import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CodeController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RoomRepository roomRepo;

    @MessageMapping("/code")
    public void sendCode(CodeMessage message) {

        // ✅ Find or create room
        Room room = roomRepo.findByRoomId(message.getRoomId())
                .orElseGet(() -> {
                    Room r = new Room();
                    r.setRoomId(message.getRoomId());
                    return r;
                });

        // ✅ Save latest code
        room.setCode(message.getCode());
        roomRepo.save(room);

        // ✅ Broadcast to all users in room
        messagingTemplate.convertAndSend(
                "/topic/code/" + message.getRoomId(),
                message
        );
    }
}