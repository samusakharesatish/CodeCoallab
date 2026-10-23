package com.codecollab.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.codecollab.model.ChatMessage;
import com.codecollab.model.RunResponse;
import com.codecollab.service.RedisService;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/code")
@CrossOrigin
public class CodeExecutionController {

    private static final String API_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisService redisService;

    public CodeExecutionController(SimpMessagingTemplate messagingTemplate, RedisService redisService) {
        this.messagingTemplate = messagingTemplate;
        this.redisService = redisService;
    }

    // ✅ REST API RUN (WITH REDIS RATE LIMITING)
    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> request) {

        String identifier = request.getOrDefault("userId", "anonymous").toString();

        // 🛡️ Redis Rate Limiting: Max 5 runs per 60 seconds
        if (redisService.isRateLimited("coderun:" + identifier, 5, 60)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Max 5 runs per minute."));
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("language_id", request.get("language_id"));
        body.put("source_code", request.get("code"));

        RequestEntity<Map<String, Object>> requestEntity =
                RequestEntity
                        .post(API_URL)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .body(body);

        ResponseEntity<String> response =
                restTemplate.exchange(requestEntity, String.class);

        return ResponseEntity.ok(response.getBody());
    }

    // 🔥 WebSocket RUN (REAL-TIME WITH REDIS RATE LIMITING)
    @MessageMapping("/run")
    public void runCodeWS(ChatMessage message) {

        try {
            String identifier = message.getUserId() != null ? message.getUserId() : message.getRoomId();

            // 🛡️ Redis Rate Limiting: Max 5 runs per 60 seconds
            if (redisService.isRateLimited("coderun:" + identifier, 5, 60)) {
                messagingTemplate.convertAndSend(
                        "/topic/run/" + message.getRoomId(),
                        new RunResponse("⏳ Rate limit exceeded: Maximum 5 runs per minute. Please wait.")
                );
                return;
            }

            RestTemplate restTemplate = new RestTemplate();

            Map<String, Object> body = new HashMap<>();
            body.put("language_id", getLanguageId(message.getLanguage()));
            body.put("source_code", message.getCode());

            RequestEntity<Map<String, Object>> requestEntity =
                    RequestEntity
                            .post(API_URL)
                            .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                            .body(body);

            ResponseEntity<String> response =
                    restTemplate.exchange(requestEntity, String.class);

            // 🔥 broadcast to all users
            messagingTemplate.convertAndSend(
                    "/topic/run/" + message.getRoomId(),
                    new RunResponse(response.getBody())
            );

        } catch (Exception e) {
            messagingTemplate.convertAndSend(
                    "/topic/run/" + message.getRoomId(),
                    new RunResponse("Error running code ❌: " + e.getMessage())
            );
        }
    }

    // ✅ helper
    private int getLanguageId(String language) {
        if (language == null) return 63;

        switch (language) {
            case "java":
                return 62;
            case "python":
                return 71;
            default:
                return 63; // javascript
        }
    }
}