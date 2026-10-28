package com.codecollab.auth;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class AuthChannelInterceptor implements ChannelInterceptor {

    private final JwtUtil jwtUtil;

    public AuthChannelInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                String authHeader = accessor.getFirstNativeHeader("Authorization");

                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    throw new AccessDeniedException("Unauthorized WebSocket connection: Missing token");
                }

                String token = authHeader.substring(7);

                if (!jwtUtil.validateToken(token)) {
                    throw new AccessDeniedException("Unauthorized WebSocket connection: Invalid or expired token");
                }

                String email = jwtUtil.extractEmail(token);
                String username = jwtUtil.extractUsername(token);
                Principal user = () -> email;
                accessor.setUser(user);
                if (accessor.getSessionAttributes() != null) {
                    accessor.getSessionAttributes().put("email", email);
                    accessor.getSessionAttributes().put("username", username != null ? username : email);
                }
            } else if (StompCommand.SEND.equals(accessor.getCommand())) {
                if (accessor.getUser() == null) {
                    throw new AccessDeniedException("Unauthorized: unauthenticated session");
                }
            }
        }

        return message;
    }
}
