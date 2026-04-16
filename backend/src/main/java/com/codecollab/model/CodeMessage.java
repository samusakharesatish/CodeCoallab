package com.codecollab.model;

import lombok.Data;

@Data
public class CodeMessage {

    private String roomId;
    private String code;

    // ⚠️ VERY IMPORTANT (object, not int)
    private Object cursorPosition;
}