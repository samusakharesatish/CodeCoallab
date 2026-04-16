package com.codecollab.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
@CrossOrigin
public class CodeExecutionController {

    private static final String API_URL =
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestBody Map<String, Object> request) {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("language_id", request.get("language_id"));
        body.put("source_code", request.get("code"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        @SuppressWarnings("null")
        ResponseEntity<String> response = restTemplate.exchange(
        API_URL,
        HttpMethod.POST,
        entity,
        String.class
);
        return ResponseEntity.ok(response.getBody());
    }
}