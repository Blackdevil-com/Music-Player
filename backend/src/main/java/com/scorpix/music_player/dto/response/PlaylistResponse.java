package com.scorpix.music_player.dto.response;


import com.scorpix.music_player.dto.SongDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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
    private String createdAt;

    private List<SongDto> songs;
}
