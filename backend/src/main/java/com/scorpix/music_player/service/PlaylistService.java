package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.request.PlaylistRequest;
import com.scorpix.music_player.dto.response.PlaylistResponse;
import com.scorpix.music_player.dto.response.PlaylistSummaryResponse;
import com.scorpix.music_player.entity.Playlist;
import com.scorpix.music_player.entity.Song;
import com.scorpix.music_player.exception.ResourceNotFoundException;
import com.scorpix.music_player.mapper.PlaylistMapper;
import com.scorpix.music_player.repository.PlaylistRepository;
import com.scorpix.music_player.repository.SongRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistMapper playlistMapper;
    private final SongRepository songRepository;

    public PlaylistService(PlaylistRepository playlistRepository, PlaylistMapper playlistMapper, SongRepository songRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistMapper = playlistMapper;
        this.songRepository = songRepository;
    }

    public PlaylistSummaryResponse addPlaylist(PlaylistRequest playlistRequest) {
        Playlist playlist = playlistMapper.toEntity(playlistRequest);
        playlistRepository.save(playlist);
        return playlistMapper.toDto(playlist);
    }

    public List<PlaylistResponse> getAllPlaylists() {
        List<Playlist> playlists = playlistRepository.findAll();
        return playlists.stream().map(playlistMapper::toDetailDto).toList();
    }

    public PlaylistResponse getPlaylistById(Long id) {
        Playlist playlist = playlistRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No such playlist"));
        return playlistMapper.toDetailDto(playlist);
    }

    public PlaylistResponse addSongToPlaylist(Long playlistId, Long songId) {
        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new ResourceNotFoundException("No such playlist"));
        Song song = songRepository.findById(songId).orElseThrow( () -> new ResourceNotFoundException("No such song"));

        playlist.getSongs().add(song);

        playlistRepository.save(playlist);
        return playlistMapper.toDetailDto(playlist);
    }

    public void deletePlaylistById(Long id) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No such playlist"));

        playlistRepository.delete(playlist);
    }

    @Transactional
    public void deleteSongFromPlaylist(Long playlistId, Long songId) {

        Playlist playlist = playlistRepository.findById(playlistId).orElseThrow(() -> new ResourceNotFoundException("No such playlist"));
        if(!playlist.getSongs().removeIf(song -> song.getId().equals(songId)))
            throw new ResourceNotFoundException("Song not found in playlist");
    }
}
