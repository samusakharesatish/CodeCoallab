package com.codecollab.service;

import com.codecollab.model.RoomMeta;
import com.codecollab.model.RoomUser;
import com.codecollab.model.SocketSession;
import com.codecollab.model.UserProfile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.connection.DataType;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class RedisService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    // ==========================================
    // 🛠️ TYPE-HEALING HELPER (PREVENTS WRONGTYPE)
    // ==========================================

    private void ensureSetType(String key) {
        try {
            DataType type = redisTemplate.type(key);
            if (type != null && type != DataType.NONE && type != DataType.SET) {
                redisTemplate.delete(key);
            }
        } catch (Exception ignored) {}
    }

    private void ensureStringType(String key) {
        try {
            DataType type = redisTemplate.type(key);
            if (type != null && type != DataType.NONE && type != DataType.STRING) {
                redisTemplate.delete(key);
            }
        } catch (Exception ignored) {}
    }

    // ==========================================
    // 🏷️ 1. ROOM METADATA (room:{roomId}:meta)
    // ==========================================

    public void saveRoomMeta(RoomMeta meta) {
        try {
            if (meta == null || meta.getRoomId() == null) return;
            String metaKey = "room:" + meta.getRoomId() + ":meta";
            ensureStringType(metaKey);

            String json = objectMapper.writeValueAsString(meta);
            redisTemplate.opsForValue().set(
                    metaKey,
                    Objects.requireNonNull(json),
                    Objects.requireNonNull(Duration.ofDays(7))
            );

            ensureSetType("rooms:active");
            redisTemplate.opsForSet().add("rooms:active", meta.getRoomId());
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error saving room meta: " + e.getMessage() + cause);
        }
    }

    public RoomMeta getRoomMeta(String roomId) {
        try {
            if (roomId == null) return null;
            String metaKey = "room:" + roomId + ":meta";
            ensureStringType(metaKey);

            String json = redisTemplate.opsForValue().get(metaKey);
            if (json != null && !json.isBlank()) {
                return objectMapper.readValue(json, RoomMeta.class);
            }
            return null;
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error reading room meta: " + e.getMessage() + cause);
            return null;
        }
    }

    public void updateRoomLanguage(String roomId, String language) {
        try {
            if (roomId == null) return;
            RoomMeta meta = getRoomMeta(roomId);
            if (meta == null) {
                meta = new RoomMeta(roomId, "", "", language, Instant.now().toString(), Instant.now().toString());
            } else {
                meta.setLanguage(language);
                meta.setUpdatedAt(Instant.now().toString());
            }
            saveRoomMeta(meta);
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error updating room language: " + e.getMessage() + cause);
        }
    }

    // ==========================================
    // 💾 2. LIVE CODE BUFFER (room:{roomId}:code)
    // ==========================================

    public void cacheRoomCode(String roomId, String code) {
        try {
            if (roomId == null || code == null) return;
            String codeKey = "room:" + roomId + ":code";
            ensureStringType(codeKey);

            redisTemplate.opsForValue().set(
                    codeKey,
                    Objects.requireNonNull(code),
                    Objects.requireNonNull(Duration.ofDays(7))
            );

            // Touch room meta updatedAt
            RoomMeta meta = getRoomMeta(roomId);
            if (meta != null) {
                meta.setUpdatedAt(Instant.now().toString());
                saveRoomMeta(meta);
            }
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error caching room code: " + e.getMessage() + cause);
        }
    }

    public String getCachedRoomCode(String roomId) {
        try {
            if (roomId == null) return null;
            String codeKey = "room:" + roomId + ":code";
            ensureStringType(codeKey);
            return redisTemplate.opsForValue().get(codeKey);
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error getting cached room code: " + e.getMessage() + cause);
            return null;
        }
    }

    // ==========================================
    // ✍️ 3. LIVE TYPING (room:{roomId}:typing)
    // ==========================================

    public void setUserTyping(String roomId, String userId, boolean isTyping) {
        try {
            if (roomId == null || userId == null) return;
            String key = "room:" + roomId + ":typing";
            ensureSetType(key);

            if (isTyping) {
                redisTemplate.opsForSet().add(key, userId);
                redisTemplate.expire(key, Objects.requireNonNull(Duration.ofSeconds(10)));
            } else {
                redisTemplate.opsForSet().remove(key, userId);
            }
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error setting user typing: " + e.getMessage() + cause);
        }
    }

    public Set<String> getTypingUsers(String roomId) {
        try {
            if (roomId == null) return Collections.emptySet();
            String key = "room:" + roomId + ":typing";
            ensureSetType(key);

            Set<String> members = redisTemplate.opsForSet().members(key);
            return members != null ? members : Collections.emptySet();
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error getting typing users: " + e.getMessage() + cause);
            return Collections.emptySet();
        }
    }

    // ==========================================
    // 👥 4. PRESENCE, USERS & SOCKETS
    // ==========================================

    public void addUserToRoom(String roomId, String socketId, String userId, String username, boolean isHost) {
        try {
            if (roomId == null || socketId == null) return;

            String resolvedUserId = (userId != null && !userId.isBlank()) ? userId : "user-" + socketId.substring(0, Math.min(6, socketId.length()));
            String resolvedUsername = (username != null && !username.isBlank()) ? username : resolvedUserId;
            String role = isHost ? "HOST" : "MEMBER";
            String now = Instant.now().toString();

            // 1. room:{roomId}:users -> add userId
            String roomUsersKey = "room:" + roomId + ":users";
            ensureSetType(roomUsersKey);
            redisTemplate.opsForSet().add(roomUsersKey, resolvedUserId);

            // 2. room:{roomId}:user:{userId} -> user state
            String roomUserKey = "room:" + roomId + ":user:" + resolvedUserId;
            ensureStringType(roomUserKey);
            RoomUser roomUser = new RoomUser(resolvedUserId, resolvedUsername, role, now);
            redisTemplate.opsForValue().set(
                    roomUserKey,
                    Objects.requireNonNull(objectMapper.writeValueAsString(roomUser)),
                    Objects.requireNonNull(Duration.ofHours(24))
            );

            // 3. user:{userId}:sockets -> add socketId
            String userSocketsKey = "user:" + resolvedUserId + ":sockets";
            ensureSetType(userSocketsKey);
            redisTemplate.opsForSet().add(userSocketsKey, socketId);

            // 4. user:{userId}:rooms -> add roomId
            String userRoomsKey = "user:" + resolvedUserId + ":rooms";
            ensureSetType(userRoomsKey);
            redisTemplate.opsForSet().add(userRoomsKey, roomId);

            // 5. user:{userId}:profile -> user profile
            String userProfileKey = "user:" + resolvedUserId + ":profile";
            ensureStringType(userProfileKey);
            UserProfile profile = new UserProfile(resolvedUserId, resolvedUsername, resolvedUserId);
            redisTemplate.opsForValue().set(
                    userProfileKey,
                    Objects.requireNonNull(objectMapper.writeValueAsString(profile)),
                    Objects.requireNonNull(Duration.ofDays(30))
            );

            // 6. socket:{socketId} -> reverse mapping for instant disconnect cleanup
            String socketKey = "socket:" + socketId;
            ensureStringType(socketKey);
            SocketSession session = new SocketSession(socketId, resolvedUserId, roomId, now);
            redisTemplate.opsForValue().set(
                    socketKey,
                    Objects.requireNonNull(objectMapper.writeValueAsString(session)),
                    Objects.requireNonNull(Duration.ofHours(24))
            );

            // 7. Global discovery sets
            ensureSetType("rooms:active");
            redisTemplate.opsForSet().add("rooms:active", roomId);

            ensureSetType("users:online");
            redisTemplate.opsForSet().add("users:online", resolvedUserId);

        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error adding user to room: " + e.getMessage() + cause);
        }
    }

    public String removeSocket(String socketId) {
        try {
            if (socketId == null) return null;

            String socketKey = "socket:" + socketId;
            ensureStringType(socketKey);
            String sessionJson = redisTemplate.opsForValue().get(socketKey);
            redisTemplate.delete(socketKey);

            if (sessionJson == null || sessionJson.isBlank()) return null;

            SocketSession session = objectMapper.readValue(sessionJson, SocketSession.class);
            String userId = session.getUserId();
            String roomId = session.getRoomId();

            if (userId != null && roomId != null) {
                // Remove socket from user's active sockets
                String userSocketsKey = "user:" + userId + ":sockets";
                ensureSetType(userSocketsKey);
                redisTemplate.opsForSet().remove(userSocketsKey, socketId);
                Long remainingSockets = redisTemplate.opsForSet().size(userSocketsKey);

                // If user has closed all tabs/connections
                if (remainingSockets == null || remainingSockets == 0) {
                    String userRoomsKey = "user:" + userId + ":rooms";
                    ensureSetType(userRoomsKey);
                    redisTemplate.opsForSet().remove(userRoomsKey, roomId);

                    String roomUsersKey = "room:" + roomId + ":users";
                    ensureSetType(roomUsersKey);
                    redisTemplate.opsForSet().remove(roomUsersKey, userId);

                    redisTemplate.delete("room:" + roomId + ":user:" + userId);

                    ensureSetType("users:online");
                    redisTemplate.opsForSet().remove("users:online", userId);
                }

                // If room has no more active participants
                String roomUsersKey = "room:" + roomId + ":users";
                ensureSetType(roomUsersKey);
                Long remainingRoomUsers = redisTemplate.opsForSet().size(roomUsersKey);
                if (remainingRoomUsers == null || remainingRoomUsers == 0) {
                    ensureSetType("rooms:active");
                    redisTemplate.opsForSet().remove("rooms:active", roomId);
                }
            }

            return roomId;
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error removing socket: " + e.getMessage() + cause);
            return null;
        }
    }

    public List<RoomUser> getRoomUsers(String roomId) {
        try {
            if (roomId == null) return Collections.emptyList();
            String roomUsersKey = "room:" + roomId + ":users";
            ensureSetType(roomUsersKey);

            Set<String> userIds = redisTemplate.opsForSet().members(roomUsersKey);
            if (userIds == null || userIds.isEmpty()) return Collections.emptyList();

            List<RoomUser> users = new ArrayList<>();
            for (String uid : userIds) {
                String roomUserKey = "room:" + roomId + ":user:" + uid;
                ensureStringType(roomUserKey);

                String json = redisTemplate.opsForValue().get(roomUserKey);
                if (json != null && !json.isBlank()) {
                    try {
                        users.add(objectMapper.readValue(json, RoomUser.class));
                    } catch (Exception ex) {
                        users.add(new RoomUser(uid, uid, "MEMBER", ""));
                    }
                } else {
                    users.add(new RoomUser(uid, uid, "MEMBER", ""));
                }
            }
            return users;
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error getting room users: " + e.getMessage() + cause);
            return Collections.emptyList();
        }
    }

    // ==========================================
    // 🛡️ 5. RATE LIMITING (SLIDING COUNTER)
    // ==========================================

    public boolean isRateLimited(String key, int maxAllowed, long windowSeconds) {
        try {
            if (key == null) return false;
            String redisKey = "ratelimit:" + key;
            Long count = redisTemplate.opsForValue().increment(redisKey);
            if (count != null && count == 1) {
                redisTemplate.expire(redisKey, Objects.requireNonNull(Duration.ofSeconds(windowSeconds)));
            }
            return count != null && count > maxAllowed;
        } catch (Exception e) {
            String cause = (e.getCause() != null) ? " -> " + e.getCause().getMessage() : "";
            System.err.println("⚠️ Redis error during rate limiting check: " + e.getMessage() + cause);
            return false;
        }
    }
}
