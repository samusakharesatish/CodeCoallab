package com.codecollab.model;

import java.io.Serializable;

public class RoomState implements Serializable {
    private String code;
    private String language;
    private String updatedAt;

    public RoomState() {}

    public RoomState(String code, String language, String updatedAt) {
        this.code = code;
        this.language = language;
        this.updatedAt = updatedAt;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
