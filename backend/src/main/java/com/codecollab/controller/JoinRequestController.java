package com.codecollab.controller;

import com.codecollab.model.JoinRequest;
import com.codecollab.repository.JoinRequestRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/join")
@CrossOrigin
public class JoinRequestController {

    private final JoinRequestRepository repo;

    public JoinRequestController(JoinRequestRepository repo) {
        this.repo = repo;
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

    // 👉 Host sees pending requests
    @GetMapping("/pending/{roomId}")
    public List<JoinRequest> getPending(@PathVariable String roomId) {
        return repo.findByRoomIdAndStatus(roomId, "PENDING");
    }

    // 👉 Host approves user
    @PostMapping("/approve")
    public String approve(@RequestBody JoinRequest req) {
        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());

        if (jr == null) return "Request not found";

        jr.setStatus("APPROVED");
        repo.save(jr);

        return "Approved";
    }

    // 👉 Host rejects user
    @PostMapping("/reject")
    public String reject(@RequestBody JoinRequest req) {
        JoinRequest jr = repo.findByRoomIdAndUserId(req.getRoomId(), req.getUserId());

        if (jr == null) return "Request not found";

        jr.setStatus("REJECTED");
        repo.save(jr);

        return "Rejected";
    }
}