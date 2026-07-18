package com.scorpix.music_player.mapper;

import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.entity.Artist;
import com.scorpix.music_player.entity.Song;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SongMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(target = "artist", ignore = true)
    @Mapping(target = "album", ignore = true)
    @Mapping(target = "durationSeconds", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "fileSizeBytes", ignore = true)
    @Mapping(target = "mimeType", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "updateAt", ignore = true)
    Song toEntity(SongDto songDto);

    @Mapping(source = "artist.id" , target = "artistId")
    @Mapping(source = "artist.artistName", target = "artistName")
    @Mapping(source = "album.albumName", target = "albumName")
    @Mapping(source = "album.id" , target = "albumId")
    SongDto toDto(Song song);

}
