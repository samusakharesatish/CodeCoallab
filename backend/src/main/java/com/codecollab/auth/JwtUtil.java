package com.codecollab.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:3600000}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ✅ Generate Access Token
    public String generateAccessToken(String email, String username) {
        return Jwts.builder()
                .setSubject(email)
                .claim("username", username)
                .claim("type", "access")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Generate Refresh Token
    public String generateRefreshToken(String email, String username) {
        return Jwts.builder()
                .setSubject(email)
                .claim("username", username)
                .claim("type", "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Legacy / Default token generation
    public String generateToken(String email, String username) {
        return generateAccessToken(email, username);
    }

    // ✅ Validate token signature and expiration
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ✅ Validate Refresh Token specifically
    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return "refresh".equals(claims.get("type", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ✅ Extract all claims safely
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Extract token type ("access" or "refresh")
    public String extractTokenType(String token) {
        try {
            return extractClaims(token).get("type", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    // ✅ Extract email (subject)
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // ✅ Extract username
    public String extractUsername(String token) {
        return extractClaims(token).get("username", String.class);
    }
}