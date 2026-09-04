package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.service.SpotifyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/spotify")
public class SpotifyController {

    private final SpotifyService spotifyService;

    public SpotifyController(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    private String extractEmail(Principal principal) {
        if (principal == null) return null;
        return principal.getName();
    }

    @PostMapping("/songs/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(spotifyService.toggleLike(id, extractEmail(principal)));
    }

    @GetMapping("/songs/liked")
    public ResponseEntity<List<SongDto>> getLikedSongs(Principal principal) {
        return ResponseEntity.ok(spotifyService.getLikedSongs(extractEmail(principal)));
    }

    @GetMapping("/songs/liked/ids")
    public ResponseEntity<List<Long>> getLikedSongIds(Principal principal) {
        return ResponseEntity.ok(spotifyService.getLikedSongIds(extractEmail(principal)));
    }

    @PostMapping("/history/{songId}")
    public ResponseEntity<Map<String, String>> recordPlay(
            @PathVariable Long songId,
            Principal principal
    ) {
        spotifyService.recordPlay(songId, extractEmail(principal));
        return ResponseEntity.ok(Map.of("status", "recorded"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<SongDto>> getRecentlyPlayed(Principal principal) {
        return ResponseEntity.ok(spotifyService.getRecentlyPlayed(extractEmail(principal)));
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam(value = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(spotifyService.globalSearch(query));
    }
}
