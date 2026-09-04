package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.FileMetaData;
import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.entity.Album;
import com.scorpix.music_player.entity.Artist;
import com.scorpix.music_player.entity.Song;
import com.scorpix.music_player.exception.FileStreamingException;
import com.scorpix.music_player.exception.ResourceNotFoundException;
import com.scorpix.music_player.mapper.SongMapper;
import com.scorpix.music_player.repository.AlbumRepository;
import com.scorpix.music_player.repository.ArtistRepository;
import com.scorpix.music_player.repository.SongRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class SongService {

    private final SongRepository songRepository;
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    private final SongMapper songMapper;
    private final FileStorageService fileStorageService;

    public SongService(SongRepository songRepository, SongMapper songMapper, AlbumRepository albumRepository, ArtistRepository artistRepository, FileStorageService fileStorageService) {
        this.songRepository = songRepository;
        this.songMapper = songMapper;
        this.albumRepository = albumRepository;
        this.artistRepository = artistRepository;
        this.fileStorageService = fileStorageService;
    }

    public SongDto addSong(SongDto songDto, MultipartFile file, MultipartFile cover) {
        Song song = songMapper.toEntity(songDto);

        if (songDto.getArtistId() != null) {
            Artist artist = artistRepository.findById(songDto.getArtistId()).orElse(null);
            song.setArtist(artist);
        }
        if (songDto.getAlbumId() != null) {
            Album album = albumRepository.findById(songDto.getAlbumId()).orElse(null);
            song.setAlbum(album);
        }

        FileMetaData fileMetaData = fileStorageService.storeAudioFile(file);
        song.setFilePath(fileMetaData.filePath());
        song.setFileSizeBytes(fileMetaData.fileSizeBytes());
        song.setMimeType(fileMetaData.mimeType());
        if (songDto.getDurationSeconds() != null) {
            song.setDurationSeconds(songDto.getDurationSeconds());
        }

        if (cover != null && !cover.isEmpty()) {
            String coverUrl = fileStorageService.storeImageFile(cover);
            song.setCoverUrl(coverUrl);
        }

        if (songDto.getLyrics() != null && !songDto.getLyrics().isBlank()) {
            song.setLyrics(songDto.getLyrics());
        }

        songRepository.save(song);
        return songMapper.toDto(song);
    }

    public SongDto updateLyrics(Long id, String lyrics) {
        Song song = songRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No such song"));
        song.setLyrics(lyrics);
        songRepository.save(song);
        return songMapper.toDto(song);
    }

    public List<SongDto> getAllSong() {
        List<Song> songs = songRepository.findAll();
        return songs.stream().map(songMapper::toDto).toList();
    }

    public SongDto getSongById(Long id) {
        return songMapper.toDto(songRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No such song")));
    }

    public void deleteSongById(Long id) {
        Song song = songRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No such song"));
        songRepository.delete(song);
    }

    public ResponseEntity<?> streamSong(Long id, String rangeHeader) {

        try {
            Song song = songRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No such song"));
            Path path = Paths.get(song.getFilePath());
            return fileStorageService.streamFile(path, rangeHeader);
        }catch (IOException e) {
            throw new FileStreamingException("Failed to stream audio file");
        }
    }
}
