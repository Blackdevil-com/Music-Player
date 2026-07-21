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

    Playlist toEntity(PlaylistRequest playlistRequest);

//    @Mapping(target = "songCount", source = "playlist.getSongs().size()")
    PlaylistSummaryResponse toDto(Playlist playlist);

    @Mapping(source = "songCount", target = "songCount")
    PlaylistResponse toDetailDto(Playlist playlist);
}
