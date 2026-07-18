package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.service.ArtistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class ArtistController {

    private final ArtistService artistService;

    public ArtistController(ArtistService artistService) {
        this.artistService = artistService;
    }

    @PostMapping("/artists")
    public ResponseEntity<ArtistDto> addArtist(@RequestBody ArtistDto artistDto) {
        return ResponseEntity.ok(artistService.addArtist(artistDto));
    }

    @GetMapping("/artists")
    public ResponseEntity<List<ArtistDto>> getAllArtist() {
        return ResponseEntity.ok(artistService.getAllArtist());
    }

    @DeleteMapping("/artists/{id}")
    public ResponseEntity<ArtistDto> deleteArtist(@PathVariable Long id) {
        return ResponseEntity.ok(artistService.deleteArtist(id));
    }

}
