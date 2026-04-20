package com.codecollab.controller;

import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// 🔥 WebSocket imports
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/room")
@CrossOrigin("*")
public class RoomController {

    @Autowired
    private RoomRepository roomRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 🔥 Track users per room
    private final Map<String, Set<String>> roomUsers = new ConcurrentHashMap<>();

    // 🔥 NEW: mapping for disconnect handling
    private final Map<String, String> wsSessionToCustomSession = new ConcurrentHashMap<>();
    private final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();


    // =========================
    // ✅ CREATE ROOM
    // =========================
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody(required = false) Room req) {

        String roomId;

        if (req != null && req.getRoomId() != null && !req.getRoomId().isEmpty()) {
            roomId = req.getRoomId();

            if (roomRepo.findByRoomId(roomId).isPresent()) {
                return ResponseEntity.badRequest().body("Room already exists");
            }
        } else {
            roomId = UUID.randomUUID().toString().substring(0, 6);
        }

        Room room = new Room();
        room.setRoomId(roomId);
        room.setCode("");
        room.setMessages(null);

        roomRepo.save(room);

        return ResponseEntity.ok(room);
    }

    // =========================
    // ✅ CHECK ROOM EXISTS
    // =========================
    @GetMapping("/exists/{roomId}")
    public ResponseEntity<?> roomExists(@PathVariable String roomId) {
        boolean exists = roomRepo.findByRoomId(roomId).isPresent();
        return ResponseEntity.ok(exists);
    }

    // =========================
    // ✅ GET ROOM DATA
    // =========================
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {

        Optional<Room> room = roomRepo.findByRoomId(roomId);

        if (room.isPresent()) {
            return ResponseEntity.ok(room.get());
        } else {
            return ResponseEntity.ok("EMPTY");
        }
    }

    // =========================
    // 🔥 USER JOIN (UPDATED)
    // =========================
    @MessageMapping("/join")
    public void joinRoom(Map<String, String> payload,
                         SimpMessageHeaderAccessor headerAccessor) {

        String roomId = payload.get("roomId");
        String sessionId = payload.get("sessionId");

        String wsSessionId = headerAccessor.getSessionId();

        if (roomId == null || sessionId == null) return;

        // 🔥 store mappings
        wsSessionToCustomSession.put(wsSessionId, sessionId);
        sessionToRoom.put(sessionId, roomId);

        roomUsers.putIfAbsent(roomId, new HashSet<>());

        Set<String> users = roomUsers.get(roomId);

        // 🔥 prevent duplicate
        users.add(sessionId);

        messagingTemplate.convertAndSend(
                "/topic/users/" + roomId,
                users
        );
    }

    // =========================
    // 🔥 DISCONNECT HANDLER
    // =========================
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        String wsSessionId = event.getSessionId();

        String sessionId = wsSessionToCustomSession.get(wsSessionId);

        if (sessionId == null) return;

        String roomId = sessionToRoom.get(sessionId);

        if (roomId != null && roomUsers.containsKey(roomId)) {

            Set<String> users = roomUsers.get(roomId);
            users.remove(sessionId);

            messagingTemplate.convertAndSend(
                    "/topic/users/" + roomId,
                    users
            );
        }

        // 🔥 cleanup
        wsSessionToCustomSession.remove(wsSessionId);
        sessionToRoom.remove(sessionId);
    }
}