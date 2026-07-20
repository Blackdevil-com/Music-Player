package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.request.PlaylistRequest;
import com.scorpix.music_player.dto.response.PlaylistResponse;
import com.scorpix.music_player.dto.response.PlaylistSummaryResponse;
import com.scorpix.music_player.service.PlaylistService;
import jakarta.servlet.ServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping("/playlists")
    public ResponseEntity<PlaylistSummaryResponse> addPlaylist(@RequestBody PlaylistRequest PlaylistRequest) {
        return new ResponseEntity<>(playlistService.addPlaylist(PlaylistRequest), HttpStatus.CREATED);
    }

    @GetMapping("/playlists")
    public ResponseEntity<List<PlaylistResponse>> getAllPlaylists() {
        return new ResponseEntity<>(playlistService.getAllPlaylists(), HttpStatus.OK);
    }

    @GetMapping("/playlists/{id}")
    public ResponseEntity<PlaylistSummaryResponse> getPlaylistById(@PathVariable Long id) {
        return new ResponseEntity<>(playlistService.getPlaylistById(id), HttpStatus.OK);
    }

    @PutMapping("/playlists/{id}/song/{songId}")
    public ResponseEntity<PlaylistResponse> addSongToPlaylist(@PathVariable Long id, @PathVariable Long songId) {
        return new ResponseEntity<>(playlistService.addSongToPlaylist(id, songId), HttpStatus.CREATED);
    }

    @DeleteMapping("/playlists/{id}")
    public ResponseEntity<HttpStatus> deletePlaylistById(@PathVariable Long id) {
        playlistService.deletePlaylistById(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
