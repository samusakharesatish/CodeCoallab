package com.codecollab.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "join_requests")
public class JoinRequest {

    @Id
    private String id;

    private String roomId;
    private String userId;
    private String username;
    private String status; // PENDING, APPROVED, REJECTED

    // ✅ Getters & Setters

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}