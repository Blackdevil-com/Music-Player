package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.response.AuthResponse;
import com.scorpix.music_player.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        AuthResponse response = AuthResponse.builder()
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .build();
        return ResponseEntity.ok(response);
    }
}