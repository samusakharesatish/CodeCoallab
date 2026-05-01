package com.codecollab.repository;

import com.codecollab.model.JoinRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JoinRequestRepository extends MongoRepository<JoinRequest, String> {

    // 🔍 Find all pending requests for a room
    List<JoinRequest> findByRoomIdAndStatus(String roomId, String status);

    // 🔍 Check if user already requested
    JoinRequest findByRoomIdAndUserId(String roomId, String userId);
}