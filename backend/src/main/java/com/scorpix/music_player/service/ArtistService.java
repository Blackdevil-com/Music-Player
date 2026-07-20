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

    public ArtistService(ArtistRepository artistRepository, ArtistMapper artistMapper) {
        this.artistRepository = artistRepository;
        this.artistMapper = artistMapper;
    }

    public ArtistDto addArtist(ArtistDto artistDto) {

       Artist artist = artistMapper.toEntity(artistDto);
       artistRepository.save(artist);
       return artistMapper.toDto(artist);
    }

    public List<ArtistDto> getAllArtist() {
        List<Artist> artists = artistRepository.findAll();
        return artists.stream().map(artist ->
                new ArtistDto(artist.getId(), artist.getArtistName())).toList();
    }

    public ArtistDto deleteArtist(Long id) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found"));
        artistRepository.delete(artist);
        return artistMapper.toDto(artist);
    }
}
