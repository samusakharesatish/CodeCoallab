package com.codecollab.controller;

import com.codecollab.model.CodeMessage;
import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;
import com.codecollab.service.RedisService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Date;

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
    public void sendCode(CodeMessage message) {
        if (message == null || message.getRoomId() == null) return;

        String roomId = message.getRoomId();
        String code = message.getCode();

        // 💾 1. Instant Cache to Redis (room:{roomId}:code)
        redisService.cacheRoomCode(roomId, code);

        // 💾 2. Persist to MongoDB
        Room room = roomRepo.findByRoomId(roomId).orElseGet(() -> {
            Room r = new Room();
            r.setRoomId(roomId);
            r.setCreatedAt(new Date());
            return r;
        });
        room.setCode(code);
        room.setUpdatedAt(new Date());
        roomRepo.save(room);

        // 📡 3. Broadcast to all users in room
        messagingTemplate.convertAndSend(
                "/topic/code/" + roomId,
                message
        );
    }
}