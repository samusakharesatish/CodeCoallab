package com.codecollab.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/health"})
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "CodeCollab Backend",
                "timestamp", new Date().toString()
        ));
    }
}
