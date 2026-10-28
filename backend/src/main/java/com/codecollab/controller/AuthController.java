package com.codecollab.controller;

import com.codecollab.auth.JwtUtil;
import com.codecollab.auth.UserRepository;
import com.codecollab.auth.dto.LoginRequest;
import com.codecollab.auth.dto.RegisterRequest;
import com.codecollab.model.User;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository repo;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository repo, JwtUtil jwtUtil) {
        this.repo = repo;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (req == null || req.email == null || req.password == null || req.username == null) {
            return ResponseEntity.badRequest().body("Username, email, and password are required");
        }

        String email = req.email.trim().toLowerCase();
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.badRequest().body("Invalid email format");
        }

        if (req.password.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters long");
        }

        if (req.username.trim().length() < 3) {
            return ResponseEntity.badRequest().body("Username must be at least 3 characters long");
        }

        if (repo.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setUsername(req.username.trim());
        user.setEmail(email);
        user.setPassword(encoder.encode(req.password));

        repo.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        try {
            if (req == null || req.getEmail() == null || req.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email and password are required");
            }

            Optional<User> optionalUser = repo.findByEmail(req.getEmail().trim().toLowerCase());

            // Generic message to prevent user enumeration
            if (optionalUser.isEmpty() || !encoder.matches(req.getPassword(), optionalUser.get().getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
            }

            User user = optionalUser.get();

            // ✅ Generate JWT
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getUsername()
            );

            return ResponseEntity.ok(token);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }
}
