package com.codecollab.controller;

import com.codecollab.model.JoinRequest;
import com.codecollab.model.Room;
import com.codecollab.repository.JoinRequestRepository;
import com.codecollab.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/join")
public class JoinRequestController {

    private final JoinRequestRepository repo;
    private final RoomRepository roomRepo;

    public JoinRequestController(JoinRequestRepository repo, RoomRepository roomRepo) {
        this.repo = repo;
        this.roomRepo = roomRepo;
    }

    // 👉 User requests to join
    @PostMapping("/request")
    public ResponseEntity<?> requestJoin(@RequestBody JoinRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        if (req == null || req.getRoomId() == null || req.getRoomId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Room ID is required");
        }

        // Bind user ID to authenticated token identity
        req.setUserId(auth.getName());

        JoinRequest existing = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());
        if (existing != null) {
            return ResponseEntity.ok(Map.of("message", "Already requested", "status", existing.getStatus()));
        }

        req.setStatus("PENDING");
        repo.save(req);

        return ResponseEntity.ok(Map.of("message", "Request sent", "status", "PENDING"));
    }

    // 👉 User checks their own status (or Host checks user status)
    @GetMapping("/status/{roomId}/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable String roomId,
                                       @PathVariable String userId,
                                       Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);
        boolean isHost = roomOpt.isPresent() && auth.getName().equals(roomOpt.get().getHostId());
        boolean isSelf = auth.getName().equals(userId);

        if (!isHost && !isSelf) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized: cannot view other users' request status");
        }

        JoinRequest jr = repo.findByRoomIdAndUserId(roomId, userId);
        if (jr == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(Map.of("status", jr.getStatus()));
    }

    // 👉 Host sees pending requests
    @GetMapping("/pending/{roomId}")
    public ResponseEntity<?> getPending(@PathVariable String roomId, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        Optional<Room> roomOpt = roomRepo.findByRoomId(roomId);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }

        Room room = roomOpt.get();
        if (room.getHostId() == null || !room.getHostId().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized: only the room host can view pending requests");
        }

        List<JoinRequest> pending = repo.findByRoomIdAndStatus(roomId, "PENDING");
        return ResponseEntity.ok(pending);
    }

    // 👉 Host approves user
    @PostMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody JoinRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        if (req == null || req.getRoomId() == null || req.getUserId() == null) {
            return ResponseEntity.badRequest().body("Room ID and User ID are required");
        }

        Optional<Room> roomOpt = roomRepo.findByRoomId(req.getRoomId());
        if (roomOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }

        Room room = roomOpt.get();
        if (room.getHostId() == null || !room.getHostId().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized: only the host can approve requests");
        }

        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());
        if (jr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }

        jr.setStatus("APPROVED");
        repo.save(jr);

        return ResponseEntity.ok("Approved");
    }

    // 👉 Host rejects user
    @PostMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody JoinRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }

        if (req == null || req.getRoomId() == null || req.getUserId() == null) {
            return ResponseEntity.badRequest().body("Room ID and User ID are required");
        }

        Optional<Room> roomOpt = roomRepo.findByRoomId(req.getRoomId());
        if (roomOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }

        Room room = roomOpt.get();
        if (room.getHostId() == null || !room.getHostId().equals(auth.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Unauthorized: only the host can reject requests");
        }

        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());
        if (jr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Request not found");
        }

        jr.setStatus("REJECTED");
        repo.save(jr);

        return ResponseEntity.ok("Rejected");
    }
}
