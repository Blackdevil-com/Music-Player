package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.AlbumDto;
import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.entity.Album;
import com.scorpix.music_player.mapper.AlbumMapper;
import com.scorpix.music_player.repository.AlbumRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumService {

    private final AlbumMapper albumMapper;
    private final AlbumRepository albumRepository;

    public AlbumService(AlbumMapper albumMapper, AlbumRepository albumRepository) {
        this.albumMapper = albumMapper;
        this.albumRepository = albumRepository;
    }

    public AlbumDto addAlbum(AlbumDto albumDto) {
        Album album = albumMapper.toEntity(albumDto);
        albumRepository.save(album);
        return albumMapper.toDto(album);
    }

    public List<AlbumDto> getAllAlbum() {

        List<Album> albums = albumRepository.findAll();
        return albums.stream().map(album -> new AlbumDto(album.getId(), album.getAlbumName())).toList();
    }

    public AlbumDto updateAlbum(Long id, AlbumDto albumDto) {

        Album album = albumMapper.toEntity(albumDto);
        album.setId(id);
        return albumMapper.toDto(albumRepository.save(album));
    }
}
