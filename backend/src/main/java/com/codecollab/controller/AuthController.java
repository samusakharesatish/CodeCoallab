package com.codecollab.controller;

import com.codecollab.auth.JwtUtil;
import com.codecollab.auth.UserRepository;
import com.codecollab.auth.dto.LoginRequest;
import com.codecollab.auth.dto.RegisterRequest;
import com.codecollab.model.User;
import com.codecollab.service.EmailService;
import com.codecollab.service.RedisService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository repo;
    private final JwtUtil jwtUtil;
    private final RedisService redisService;
    private final EmailService emailService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(UserRepository repo, JwtUtil jwtUtil, RedisService redisService, EmailService emailService) {
        this.repo = repo;
        this.jwtUtil = jwtUtil;
        this.redisService = redisService;
        this.emailService = emailService;
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

            // ✅ Generate JWT Access and Refresh Tokens
            String accessToken = jwtUtil.generateAccessToken(
                    user.getEmail(),
                    user.getUsername()
            );
            String refreshToken = jwtUtil.generateRefreshToken(
                    user.getEmail(),
                    user.getUsername()
            );

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("token", accessToken); // Backwards compatibility

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Login failed");
        }
    }

    // ✅ REFRESH TOKEN
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody(required = false) Map<String, String> req) {
        try {
            if (req == null || !req.containsKey("refreshToken") || req.get("refreshToken") == null || req.get("refreshToken").isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Refresh token is required"));
            }

            String refreshToken = req.get("refreshToken").trim();

            if (!jwtUtil.validateRefreshToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired refresh token"));
            }

            String email = jwtUtil.extractEmail(refreshToken);
            String username = jwtUtil.extractUsername(refreshToken);

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid token claims"));
            }

            Optional<User> optionalUser = repo.findByEmail(email);
            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }

            User user = optionalUser.get();
            String resolvedUsername = user.getUsername() != null ? user.getUsername() : username;

            // Generate fresh pair
            String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), resolvedUsername);
            String newRefreshToken = jwtUtil.generateRefreshToken(user.getEmail(), resolvedUsername);

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", newRefreshToken);
            response.put("token", newAccessToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Token refresh failed"));
        }
    }

    // ==========================================
    // ✉️ SEND EMAIL OTP
    // ==========================================
    @PostMapping("/email/send-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody(required = false) Map<String, String> req) {
        try {
            if (req == null || !req.containsKey("email") || req.get("email") == null || req.get("email").isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            String email = req.get("email").trim().toLowerCase();
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            // Check 60-second cooldown in Redis
            if (redisService.isOtpCooldownActive(email)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(Map.of("error", "Please wait 60 seconds before requesting another code"));
            }

            // Generate cryptographically secure 6-digit OTP
            String otp = String.format("%06d", secureRandom.nextInt(1000000));

            // Save in Redis (5-min TTL) and set 60s cooldown
            redisService.saveOtp(email, otp);
            redisService.setOtpCooldown(email);

            // Send Email / Print to terminal
            emailService.sendOtpEmail(email, otp);

            return ResponseEntity.ok(Map.of("message", "Verification code sent successfully"));
        } catch (Exception e) {
            System.err.println("⚠️ Error sending OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification code"));
        }
    }

    // ==========================================
    // 🔑 VERIFY EMAIL OTP
    // ==========================================
    @PostMapping("/email/verify-otp")
    public ResponseEntity<?> verifyEmailOtp(@RequestBody(required = false) Map<String, String> req) {
        try {
            if (req == null || !req.containsKey("email") || !req.containsKey("otp")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and verification code are required"));
            }

            String email = req.get("email").trim().toLowerCase();
            String submittedOtp = req.get("otp").trim();

            if (email.isBlank() || submittedOtp.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and code cannot be empty"));
            }

            // Fetch OTP from Redis
            String cachedOtp = redisService.getOtp(email);

            if (cachedOtp == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Code has expired or was not requested. Please request a new one."));
            }

            if (!cachedOtp.equals(submittedOtp)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid verification code. Please check and try again."));
            }

            // Valid! Delete from Redis immediately to prevent replay
            redisService.deleteOtp(email);

            // Find or Auto-Create User in MongoDB
            Optional<User> userOpt = repo.findByEmail(email);
            User user;
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setUsername(email.split("@")[0]);
                user.setPassword(encoder.encode(UUID.randomUUID().toString()));
                repo.save(user);
                System.out.println("✨ [New User] Auto-registered account for " + email);
            }

            String username = user.getUsername() != null ? user.getUsername() : email.split("@")[0];

            // Generate JWT Token Pair
            String accessToken = jwtUtil.generateAccessToken(user.getEmail(), username);
            String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), username);

            Map<String, String> response = new HashMap<>();
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("token", accessToken);
            response.put("username", username);
            response.put("email", user.getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("⚠️ Error verifying OTP: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Verification failed"));
        }
    }
}
