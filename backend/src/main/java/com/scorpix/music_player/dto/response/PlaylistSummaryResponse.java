package com.scorpix.music_player.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistSummaryResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private String createdBy;
    private LocalDateTime createdAt;
}
