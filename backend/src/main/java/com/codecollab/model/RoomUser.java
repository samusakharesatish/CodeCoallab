package com.codecollab.model;

import java.io.Serializable;

public class RoomUser implements Serializable {
    private String userId;
    private String username;
    private String role; // HOST or MEMBER
    private String joinedAt;

    public RoomUser() {}

    public RoomUser(String userId, String username, String role, String joinedAt) {
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getJoinedAt() { return joinedAt; }
    public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
}
