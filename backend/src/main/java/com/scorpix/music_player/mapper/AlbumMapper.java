package com.scorpix.music_player.mapper;

import com.scorpix.music_player.dto.AlbumDto;
import com.scorpix.music_player.entity.Album;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AlbumMapper {

    Album toEntity(AlbumDto albumDto);

    AlbumDto toDto(Album album);
}
