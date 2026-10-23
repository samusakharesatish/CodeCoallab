package com.codecollab.controller;

import com.codecollab.model.LanguageMessage;
import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;
import com.codecollab.service.RedisService;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Date;
import java.util.Optional;

@Controller
public class LanguageController {

    private final RoomRepository roomRepo;
    private final RedisService redisService;
    private final SimpMessagingTemplate messagingTemplate;

    public LanguageController(RoomRepository roomRepo, RedisService redisService, SimpMessagingTemplate messagingTemplate) {
        this.roomRepo = roomRepo;
        this.redisService = redisService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/language")
    public void changeLanguage(LanguageMessage msg) {
        if (msg == null || msg.getRoomId() == null || msg.getLanguage() == null) return;

        String roomId = msg.getRoomId();
        String language = msg.getLanguage();

        // 1. Update in Redis Cache (room:{roomId}:meta)
        redisService.updateRoomLanguage(roomId, language);

        // 2. Persist in MongoDB
        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            room.setLanguage(language);
            room.setUpdatedAt(new Date());
            roomRepo.save(room);
        }

        // 3. Broadcast to all users in this specific room
        messagingTemplate.convertAndSend("/topic/language/" + roomId, msg);
    }
}