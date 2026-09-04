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

    @PostMapping(value = "/artists", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArtistDto> addArtistMultipart(
            @RequestPart("artistDto") ArtistDto artistDto,
            @RequestPart(value = "image", required = false) org.springframework.web.multipart.MultipartFile image
    ) {
        return ResponseEntity.ok(artistService.addArtist(artistDto, image));
    }

    @PostMapping(value = "/artists", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ArtistDto> addArtistJson(@RequestBody ArtistDto artistDto) {
        return ResponseEntity.ok(artistService.addArtist(artistDto, null));
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
