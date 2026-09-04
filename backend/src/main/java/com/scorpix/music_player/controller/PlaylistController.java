package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.request.PlaylistRequest;
import com.scorpix.music_player.dto.response.PlaylistResponse;
import com.scorpix.music_player.dto.response.PlaylistSummaryResponse;
import com.scorpix.music_player.entity.Role;
import com.scorpix.music_player.entity.User;
import com.scorpix.music_player.service.PlaylistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PlaylistController {

    private final PlaylistService playlistService;

    public PlaylistController(PlaylistService playlistService) {
        this.playlistService = playlistService;
    }

    @PostMapping(value = "/playlists", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PlaylistSummaryResponse> addPlaylist(@RequestBody PlaylistRequest playlistRequest) {
        return new ResponseEntity<>(playlistService.addPlaylist(playlistRequest), HttpStatus.CREATED);
    }

    @PostMapping(value = "/playlists", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PlaylistSummaryResponse> addPlaylistWithCover(
            @RequestPart("playlistRequest") PlaylistRequest playlistRequest,
            @RequestPart(value = "cover", required = false) org.springframework.web.multipart.MultipartFile cover) {
        return new ResponseEntity<>(playlistService.addPlaylistWithCover(playlistRequest, cover), HttpStatus.CREATED);
    }

    @GetMapping("/playlists")
    public ResponseEntity<List<PlaylistResponse>> getAllPlaylists() {
        return new ResponseEntity<>(playlistService.getAllPlaylists(), HttpStatus.OK);
    }

    @GetMapping("/playlists/{id}")
    public ResponseEntity<PlaylistResponse> getPlaylistById(@PathVariable Long id) {
        return new ResponseEntity<>(playlistService.getPlaylistById(id), HttpStatus.OK);
    }

    @PostMapping("/playlists/{id}/songs/{songId}")
    public ResponseEntity<PlaylistResponse> addSongToPlaylist(@PathVariable Long id, @PathVariable Long songId) {
        return new ResponseEntity<>(playlistService.addSongToPlaylist(id, songId), HttpStatus.CREATED);
    }

    @DeleteMapping("/playlists/{id}")
    public ResponseEntity<?> deletePlaylistById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators have authority to delete playlists.");
        }
        playlistService.deletePlaylistById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/playlists/{playlistId}/songs/{songId}")
    public ResponseEntity<HttpStatus> deleteSongFromPlaylist(@PathVariable Long playlistId, @PathVariable Long songId) {
        playlistService.deleteSongFromPlaylist(playlistId, songId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
