package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.AlbumDto;
import com.scorpix.music_player.entity.Album;
import com.scorpix.music_player.mapper.AlbumMapper;
import com.scorpix.music_player.repository.AlbumRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlbumService {

    private final AlbumMapper albumMapper;
    private final AlbumRepository albumRepository;
    private final FileStorageService fileStorageService;

    public AlbumService(AlbumMapper albumMapper, AlbumRepository albumRepository, FileStorageService fileStorageService) {
        this.albumMapper = albumMapper;
        this.albumRepository = albumRepository;
        this.fileStorageService = fileStorageService;
    }

    public AlbumDto addAlbum(AlbumDto albumDto, org.springframework.web.multipart.MultipartFile cover) {
        Album album = albumMapper.toEntity(albumDto);
        if (cover != null && !cover.isEmpty()) {
            album.setCoverUrl(fileStorageService.storeImageFile(cover));
        }
        albumRepository.save(album);
        return albumMapper.toDto(album);
    }

    public List<AlbumDto> getAllAlbum() {
        List<Album> albums = albumRepository.findAll();
        return albums.stream().map(albumMapper::toDto).toList();
    }

    public AlbumDto updateAlbum(Long id, AlbumDto albumDto) {
        Album album = albumMapper.toEntity(albumDto);
        album.setId(id);
        return albumMapper.toDto(albumRepository.save(album));
    }
}
