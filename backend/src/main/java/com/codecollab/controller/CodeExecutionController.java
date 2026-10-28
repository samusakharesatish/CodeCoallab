package com.codecollab.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.codecollab.model.ChatMessage;
import com.codecollab.model.RunResponse;
import com.codecollab.service.RedisService;

import jakarta.servlet.http.HttpServletRequest;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    @Value("${judge0.api.url}")
    private String apiUrl;
    private static final int MAX_CODE_LENGTH = 100_000;

    private final SimpMessagingTemplate messagingTemplate;
    private final RedisService redisService;

    public CodeExecutionController(SimpMessagingTemplate messagingTemplate, RedisService redisService) {
        this.messagingTemplate = messagingTemplate;
        this.redisService = redisService;
    }

    // ✅ REST API RUN (WITH REDIS RATE LIMITING)
    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> request,
                                     Authentication auth,
                                     HttpServletRequest httpRequest) {

        // Use authenticated identity or client IP to prevent rate limit evasion
        String identifier;
        if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().equals("anonymousUser")) {
            identifier = auth.getName();
        } else {
            String clientIp = httpRequest.getHeader("X-Forwarded-For");
            if (clientIp != null && !clientIp.isEmpty()) {
                identifier = clientIp.split(",")[0].trim();
            } else {
                identifier = httpRequest.getRemoteAddr();
            }
        }

        // 🛡️ Redis Rate Limiting: Max 5 runs per 60 seconds
        if (redisService.isRateLimited("coderun:" + identifier, 5, 60)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Rate limit exceeded. Max 5 runs per minute."));
        }

        Object codeObj = request.get("code");
        if (codeObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code is required"));
        }
        String sourceCode = codeObj.toString();
        if (sourceCode.length() > MAX_CODE_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "Code exceeds maximum allowed size (100KB)"));
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        body.put("language_id", request.get("language_id"));
        body.put("source_code", sourceCode);

        RequestEntity<Map<String, Object>> requestEntity =
                RequestEntity
                        .post(apiUrl)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .body(body);

        ResponseEntity<String> response =
                restTemplate.exchange(requestEntity, String.class);

        return ResponseEntity.ok(response.getBody());
    }

    // 🔥 WebSocket RUN (REAL-TIME WITH REDIS RATE LIMITING)
    @MessageMapping("/run")
    public void runCodeWS(ChatMessage message, Principal principal) {

        try {
            // Use verified principal from token rather than arbitrary client-supplied userId
            String identifier = (principal != null && principal.getName() != null)
                    ? principal.getName()
                    : message.getRoomId();

            // 🛡️ Redis Rate Limiting: Max 5 runs per 60 seconds
            if (redisService.isRateLimited("coderun:" + identifier, 5, 60)) {
                messagingTemplate.convertAndSend(
                        "/topic/run/" + message.getRoomId(),
                        new RunResponse("⏳ Rate limit exceeded: Maximum 5 runs per minute. Please wait.")
                );
                return;
            }

            if (message.getCode() != null && message.getCode().length() > MAX_CODE_LENGTH) {
                messagingTemplate.convertAndSend(
                        "/topic/run/" + message.getRoomId(),
                        new RunResponse("❌ Code exceeds maximum allowed size (100KB)")
                );
                return;
            }

            RestTemplate restTemplate = new RestTemplate();

            Map<String, Object> body = new HashMap<>();
            body.put("language_id", getLanguageId(message.getLanguage()));
            body.put("source_code", message.getCode());

            RequestEntity<Map<String, Object>> requestEntity =
                    RequestEntity
                            .post(apiUrl)
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

        switch (language.toLowerCase()) {
            case "java":
                return 62;
            case "python":
                return 71;
            default:
                return 63; // javascript
        }
    }
}
