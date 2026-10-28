package com.codecollab.controller;

import com.codecollab.model.CodeMessage;
import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;
import com.codecollab.service.RedisService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Date;
import java.util.Optional;

@Controller
public class CodeController {

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepo;
    private final RedisService redisService;

    public CodeController(SimpMessagingTemplate messagingTemplate, RoomRepository roomRepo, RedisService redisService) {
        this.messagingTemplate = messagingTemplate;
        this.roomRepo = roomRepo;
        this.redisService = redisService;
    }

    @MessageMapping("/code")
    public void sendCode(CodeMessage message, Principal principal) {
        if (message == null || message.getRoomId() == null) return;

        String roomId = message.getRoomId();
        String code = message.getCode();

        // Ensure room exists before persisting or broadcasting
        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);
        if (roomOpt.isEmpty()) {
            return;
        }

        // 💾 1. Instant Cache to Redis (room:{roomId}:code)
        redisService.cacheRoomCode(roomId, code);

        // 💾 2. Persist to MongoDB
        Room room = roomOpt.get();
        room.setCode(code);
        room.setUpdatedAt(new Date());
        roomRepo.save(room);

        // Verify sender
        if (principal != null) {
            message.setUserId(principal.getName());
        }

        // 📡 3. Broadcast to all users in room
        messagingTemplate.convertAndSend(
                "/topic/code/" + roomId,
                message
        );
    }
}
