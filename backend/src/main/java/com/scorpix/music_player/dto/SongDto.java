package com.scorpix.music_player.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SongDto {

    private Long id;
    private String title;
    private Long artistId;
    private String artistName;
    private String albumName;
    private Long albumId;
    private String genre;
    private String coverUrl;
    private Integer durationSeconds;
    private String lyrics;
    private LocalDateTime createAt;
}
