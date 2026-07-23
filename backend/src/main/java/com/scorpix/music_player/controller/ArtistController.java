package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.service.ArtistService;
import org.springframework.http.HttpStatus;
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
    public ResponseEntity<HttpStatus> deleteArtist(@PathVariable Long id) {
        artistService.deleteArtist(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
