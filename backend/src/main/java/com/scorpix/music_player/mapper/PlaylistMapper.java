package com.scorpix.music_player.mapper;

import com.scorpix.music_player.dto.request.PlaylistRequest;
import com.scorpix.music_player.dto.response.PlaylistResponse;
import com.scorpix.music_player.dto.response.PlaylistSummaryResponse;
import com.scorpix.music_player.entity.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",
        uses = SongMapper.class)
public interface PlaylistMapper {

    @Mapping(target = "name", source = "name")
    Playlist toEntity(PlaylistRequest playlistRequest);

    PlaylistSummaryResponse toDto(Playlist playlist);

    PlaylistResponse toDetailDto(Playlist playlist);
}
