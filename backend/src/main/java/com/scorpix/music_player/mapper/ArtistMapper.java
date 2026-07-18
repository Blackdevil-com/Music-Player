package com.scorpix.music_player.mapper;

import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.entity.Artist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ArtistMapper {

    @Mapping(target = "id", ignore = true)
    Artist toEntity(ArtistDto artistDto);

    ArtistDto toDto(Artist artist);
}
