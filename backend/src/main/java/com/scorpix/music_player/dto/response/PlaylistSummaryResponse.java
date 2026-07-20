package com.scorpix.music_player.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    private String createdAt;
}
