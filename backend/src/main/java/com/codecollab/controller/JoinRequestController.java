package com.codecollab.controller;

import com.codecollab.model.JoinRequest;
import com.codecollab.model.Room;
import com.codecollab.repository.JoinRequestRepository;
import com.codecollab.repository.RoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/join")
@CrossOrigin
public class JoinRequestController {

    private final JoinRequestRepository repo;

    private final RoomRepository roomRepo;

    public JoinRequestController(JoinRequestRepository repo, RoomRepository roomRepo) {
        this.repo = repo;
        this.roomRepo = roomRepo;
    }

    // 👉 User requests to join
    @PostMapping("/request")
    public String requestJoin(@RequestBody JoinRequest req) {

        JoinRequest existing = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());

        if (existing != null) {
            return "Already requested";
        }

        req.setStatus("PENDING");
        repo.save(req);

        return "Request sent";
    }

    // 👉 User checks their own status (PENDING / APPROVED / REJECTED / NONE)
    @GetMapping("/status/{roomId}/{userId}")
    public ResponseEntity<?> getStatus(@PathVariable String roomId, @PathVariable String userId) {
        JoinRequest jr = repo.findByRoomIdAndUserId(roomId, userId);
        if (jr == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(Map.of("status", jr.getStatus()));
    }

    // 👉 Host sees pending requests
    @GetMapping("/pending/{roomId}")
    public List<JoinRequest> getPending(@PathVariable String roomId) {
        return repo.findByRoomIdAndStatus(roomId, "PENDING");
    }

    // 👉 Host approves user
    @PostMapping("/approve")
    public String approve(@RequestBody JoinRequest req, Authentication auth) {
        Optional<Room> roomOpt = roomRepo.findByRoomId(req.getRoomId());
        if (roomOpt.isPresent() && auth != null) {
            Room room = roomOpt.get();
            // Verify caller is host
            if (room.getHostId() != null && !room.getHostId().equals(auth.getName())) {
                return "Unauthorized: only the host can approve requests";
            }
        }

        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());

        if (jr == null) return "Request not found";

        jr.setStatus("APPROVED");
        repo.save(jr);

        return "Approved";
    }

    // 👉 Host rejects user
    @PostMapping("/reject")
    public String reject(@RequestBody JoinRequest req, Authentication auth) {
        Optional<Room> roomOpt = roomRepo.findByRoomId(req.getRoomId());
        if (roomOpt.isPresent() && auth != null) {
            Room room = roomOpt.get();
            // Verify caller is host
            if (room.getHostId() != null && !room.getHostId().equals(auth.getName())) {
                return "Unauthorized: only the host can reject requests";
            }
        }

        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());

        if (jr == null) return "Request not found";

        jr.setStatus("REJECTED");
        repo.save(jr);

        return "Rejected";
    }
}