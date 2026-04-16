package com.codecollab.controller;

import com.codecollab.model.Room;
import com.codecollab.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/room")
@CrossOrigin("*")
public class RoomController {

    @Autowired
    private RoomRepository roomRepo;

    // ✅ CREATE ROOM
    @PostMapping("/create")
    public ResponseEntity<?> createRoom(@RequestBody(required = false) Room req) {

        String roomId;

        if (req != null && req.getRoomId() != null && !req.getRoomId().isEmpty()) {
            roomId = req.getRoomId();

            // check duplicate
            if (roomRepo.findByRoomId(roomId).isPresent()) {
                return ResponseEntity.badRequest().body("Room already exists");
            }
        } else {
            // auto generate
            roomId = UUID.randomUUID().toString().substring(0, 6);
        }

        Room room = new Room();
        room.setRoomId(roomId);
        room.setCode("");
        room.setMessages(null);

        roomRepo.save(room);

        return ResponseEntity.ok(room);
    }

    // ✅ CHECK ROOM EXISTS
    @GetMapping("/exists/{roomId}")
    public ResponseEntity<?> roomExists(@PathVariable String roomId) {
        boolean exists = roomRepo.findByRoomId(roomId).isPresent();
        return ResponseEntity.ok(exists);
    }

    // ✅ GET ROOM DATA
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {

        Optional<Room> room = roomRepo.findByRoomId(roomId);

        if (room.isPresent()) {
            return ResponseEntity.ok(room.get());
        } else {
            return ResponseEntity.ok("EMPTY");
        }
    }
}