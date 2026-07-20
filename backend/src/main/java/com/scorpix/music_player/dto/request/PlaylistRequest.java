package com.scorpix.music_player.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistRequest {

    private String name;
    private String description;
    private String createdBy;
    private Boolean isPublic;
}
