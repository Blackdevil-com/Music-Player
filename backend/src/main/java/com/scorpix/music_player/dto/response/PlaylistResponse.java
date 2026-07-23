package com.scorpix.music_player.dto.response;


import com.scorpix.music_player.dto.SongDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaylistResponse {

    private Long id;
    private String name;
    private String description;
    private Boolean isPublic;
    private String createdBy;
    private LocalDateTime createdAt;

    private Set<SongDto> songs;
}
