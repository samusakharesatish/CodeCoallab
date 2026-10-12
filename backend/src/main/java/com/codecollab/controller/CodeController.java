package com.codecollab.controller;

import com.codecollab.model.CodeMessage;
import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CodeController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepo;

    public CodeController(SimpMessagingTemplate messagingTemplate, RoomRepository roomRepo) {
        this.messagingTemplate = messagingTemplate;
        this.roomRepo = roomRepo;
    }

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