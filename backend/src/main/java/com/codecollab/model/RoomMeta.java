package com.codecollab.model;

import java.io.Serializable;

public class RoomMeta implements Serializable {
    private String roomId;
    private String hostId;
    private String hostUsername;
    private String language = "javascript";
    private String createdAt;
    private String updatedAt;

    public RoomMeta() {}

    public RoomMeta(String roomId, String hostId, String hostUsername, String language, String createdAt, String updatedAt) {
        this.roomId = roomId;
        this.hostId = hostId;
        this.hostUsername = hostUsername;
        this.language = language;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }

    public String getHostUsername() { return hostUsername; }
    public void setHostUsername(String hostUsername) { this.hostUsername = hostUsername; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
