package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.entity.Artist;
import com.scorpix.music_player.exception.ResourceNotFoundException;
import com.scorpix.music_player.mapper.ArtistMapper;
import com.scorpix.music_player.repository.ArtistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ArtistService {

    private final ArtistRepository artistRepository;
    private final ArtistMapper artistMapper;
    private final FileStorageService fileStorageService;

    public ArtistService(ArtistRepository artistRepository, ArtistMapper artistMapper, FileStorageService fileStorageService) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
        this.fileStorageService = fileStorageService;
    }

    public ArtistDto addArtist(ArtistDto artistDto, org.springframework.web.multipart.MultipartFile image) {
        Artist artist = artistMapper.toEntity(artistDto);
        if (image != null && !image.isEmpty()) {
            artist.setImageUrl(fileStorageService.storeImageFile(image));
        }
        artistRepository.save(artist);
        return artistMapper.toDto(artist);
    }

    public List<ArtistDto> getAllArtist() {
        List<Artist> artists = artistRepository.findAll();
        return artists.stream().map(artistMapper::toDto).toList();
    }

    public void deleteArtist(Long id) {
        try {
            artistRepository.deleteById(id);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Artist not found");
        }
    }
}
