package com.codecollab.controller;

import com.codecollab.auth.JwtUtil;
import com.codecollab.auth.UserRepository;
import com.codecollab.auth.dto.LoginRequest;
import com.codecollab.auth.dto.RegisterRequest;
import com.codecollab.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@RestController
@RequestMapping("/auth") // ✅ KEEP THIS
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {

        if (repo.findByEmail(req.email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = new User();
        user.setUsername(req.username);
        user.setEmail(req.email);
        user.setPassword(encoder.encode(req.password));

        repo.save(user);

        return ResponseEntity.ok("User registered");
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {

        try {
            System.out.println("👉 LOGIN START");

            if (req.getEmail() == null || req.getPassword() == null) {
                return ResponseEntity.badRequest().body("Email or password missing");
            }

            Optional<User> optionalUser = repo.findByEmail(req.getEmail());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User user = optionalUser.get();

            if (!encoder.matches(req.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body("Invalid credentials");
            }

            // ✅ Generate JWT
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getUsername()
            );

            System.out.println("✅ LOGIN SUCCESS");

            return ResponseEntity.ok(token);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Login failed: " + e.getMessage());
        }
    }
}