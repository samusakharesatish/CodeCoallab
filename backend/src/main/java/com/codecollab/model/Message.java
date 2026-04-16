package com.codecollab.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    private String roomId;
    private String userId;
    private String username;
    private String message;
    private String timestamp;
}