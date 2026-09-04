package com.scorpix.music_player.dto.response;

import com.scorpix.music_player.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private String profilePicture;
    private Role role;
}
