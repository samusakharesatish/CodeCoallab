package com.codecollab.model;

import java.io.Serializable;

public class SocketSession implements Serializable {
    private String socketId;
    private String userId;
    private String roomId;
    private String connectedAt;

    public SocketSession() {}

    public SocketSession(String socketId, String userId, String roomId, String connectedAt) {
        this.socketId = socketId;
        this.userId = userId;
        this.roomId = roomId;
        this.connectedAt = connectedAt;
    }

    public String getSocketId() { return socketId; }
    public void setSocketId(String socketId) { this.socketId = socketId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getConnectedAt() { return connectedAt; }
    public void setConnectedAt(String connectedAt) { this.connectedAt = connectedAt; }
}
