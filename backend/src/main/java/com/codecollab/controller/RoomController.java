package com.codecollab.controller;

import com.codecollab.auth.UserRepository;
import com.codecollab.model.Room;
import com.codecollab.model.RoomMeta;
import com.codecollab.model.RoomUser;
import com.codecollab.repository.RoomRepository;
import com.codecollab.service.RedisService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/room")
public class RoomController {

    private final RoomRepository roomRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisService redisService;

    public RoomController(RoomRepository roomRepo,
                          UserRepository userRepo,
                          SimpMessagingTemplate messagingTemplate,
                          RedisService redisService) {
        this.roomRepo = roomRepo;
        this.userRepo = userRepo;
        this.messagingTemplate = messagingTemplate;
        this.redisService = redisService;
    }

    private String generateMeetStyleId() {
        String chars = "abcdefghijklmnopqrstuvwxyz";
        java.security.SecureRandom random = new java.security.SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        sb.append("-");
        for (int i = 0; i < 3; i++) sb.append(chars.charAt(random.nextInt(chars.length())));
        return sb.toString();
    }

    // =========================
    // ✅ CREATE ROOM
    // =========================
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody(required = false) Room req, Authentication auth) {

        String roomId;

        if (req != null && req.getRoomId() != null && !req.getRoomId().isEmpty()) {
            roomId = req.getRoomId();

            if (roomRepo.findByRoomId(roomId).isPresent()) {
                return ResponseEntity.badRequest().body("Room already exists");
            }
        } else {
            roomId = generateMeetStyleId();
        }

        Room room = new Room();
        room.setRoomId(roomId);
        room.setCode(req != null && req.getCode() != null ? req.getCode() : "// Welcome to CodeCollab\nconsole.log(\"Hello, World!\");\n");
        room.setLanguage(req != null && req.getLanguage() != null ? req.getLanguage() : "javascript");
        room.setCreatedAt(new Date());
        room.setUpdatedAt(new Date());

        String hostId = null;
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            hostId = auth.getName();
        } else if (req != null && req.getHostId() != null) {
            hostId = req.getHostId();
        }

        if (hostId != null) {
            room.setHostId(hostId);
            if (req != null && req.getHostUsername() != null && !req.getHostUsername().isBlank()) {
                room.setHostUsername(req.getHostUsername());
            } else {
                userRepo.findByEmail(hostId).ifPresent(u -> room.setHostUsername(u.getUsername()));
            }
        }

        roomRepo.save(room);

        // Pre-warm room:{roomId}:meta & room:{roomId}:code in Redis
        RoomMeta meta = new RoomMeta(
                roomId,
                room.getHostId() != null ? room.getHostId() : "",
                room.getHostUsername() != null ? room.getHostUsername() : (room.getHostId() != null ? room.getHostId() : ""),
                room.getLanguage(),
                Instant.now().toString(),
                Instant.now().toString()
        );
        redisService.saveRoomMeta(meta);
        redisService.cacheRoomCode(roomId, room.getCode());

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

        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);

        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();

            // Auto-heal missing hostUsername from user collection if needed
            if ((room.getHostUsername() == null || room.getHostUsername().isBlank()) && room.getHostId() != null) {
                userRepo.findByEmail(room.getHostId()).ifPresent(u -> {
                    room.setHostUsername(u.getUsername());
                    roomRepo.save(room);
                });
            }

            // Ensure room:{roomId}:meta is backfilled in Redis if missing
            RoomMeta meta = redisService.getRoomMeta(roomId);
            if (meta == null) {
                meta = new RoomMeta(
                        roomId,
                        room.getHostId() != null ? room.getHostId() : "",
                        room.getHostUsername() != null ? room.getHostUsername() : (room.getHostId() != null ? room.getHostId() : ""),
                        room.getLanguage() != null ? room.getLanguage() : "javascript",
                        room.getCreatedAt() != null ? room.getCreatedAt().toString() : Instant.now().toString(),
                        room.getUpdatedAt() != null ? room.getUpdatedAt().toString() : Instant.now().toString()
                );
                redisService.saveRoomMeta(meta);
            } else if (meta.getLanguage() != null && !meta.getLanguage().isEmpty()) {
                room.setLanguage(meta.getLanguage());
            }

            // Check Redis for newer code draft
            String cachedCode = redisService.getCachedRoomCode(roomId);
            if (cachedCode != null && !cachedCode.isEmpty()) {
                room.setCode(cachedCode);
            }

            return ResponseEntity.ok(room);
        } else {
            return ResponseEntity.ok("EMPTY");
        }
    }

    // =========================
    // 🔥 USER JOIN (REDIS BACKED)
    // =========================
    @MessageMapping("/join")
    public void joinRoom(Map<String, String> payload,
                         SimpMessageHeaderAccessor headerAccessor) {

        String roomId = payload.get("roomId");
        String wsSessionId = headerAccessor.getSessionId();
        String userId = payload.get("userId");
        String username = payload.get("username");

        if (roomId == null || wsSessionId == null) return;

        // Check if user is host & backfill Redis meta if needed
        boolean isHost = false;
        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            if (userId != null && userId.equals(room.getHostId())) {
                isHost = true;
            }
            if (redisService.getRoomMeta(roomId) == null) {
                redisService.saveRoomMeta(new RoomMeta(
                        roomId,
                        room.getHostId() != null ? room.getHostId() : "",
                        room.getHostUsername() != null ? room.getHostUsername() : (room.getHostId() != null ? room.getHostId() : ""),
                        room.getLanguage() != null ? room.getLanguage() : "javascript",
                        room.getCreatedAt() != null ? room.getCreatedAt().toString() : Instant.now().toString(),
                        Instant.now().toString()
                ));
            }
        }

        // Register user and socket in Redis
        redisService.addUserToRoom(roomId, wsSessionId, userId, username, isHost);

        List<RoomUser> users = redisService.getRoomUsers(roomId);

        messagingTemplate.convertAndSend(
                "/topic/users/" + roomId,
                users
        );
    }

    // =========================
    // 🔥 DISCONNECT HANDLER (REDIS BACKED)
    // =========================
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        String wsSessionId = event.getSessionId();

        String roomId = redisService.removeSocket(wsSessionId);

        if (roomId != null) {
            List<RoomUser> users = redisService.getRoomUsers(roomId);

            messagingTemplate.convertAndSend(
                    "/topic/users/" + roomId,
                    users
            );
        }
    }
}
