package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.AlbumDto;
import com.scorpix.music_player.service.AlbumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AlbumController {

    private final AlbumService albumService;

    public AlbumController(AlbumService albumService) {
        this.albumService = albumService;
    }

    @PostMapping(value = "/albums", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AlbumDto> addAlbumMultipart(
            @RequestPart("albumDto") AlbumDto albumDto,
            @RequestPart(value = "cover", required = false) org.springframework.web.multipart.MultipartFile cover
    ) {
        return ResponseEntity.ok(albumService.addAlbum(albumDto, cover));
    }

    @PostMapping(value = "/albums", consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AlbumDto> addAlbumJson(@RequestBody AlbumDto albumDto) {
        return ResponseEntity.ok(albumService.addAlbum(albumDto, null));
    }

    @GetMapping("/albums")
    public ResponseEntity<List<AlbumDto>> getAllAlbum() {
        return ResponseEntity.ok(albumService.getAllAlbum());
    }

    @PutMapping("/album/{id}")
    public ResponseEntity<AlbumDto> updateAlbum(@PathVariable Long id, @RequestBody AlbumDto albumDto) {
        return ResponseEntity.ok(albumService.updateAlbum(id, albumDto));
    }
}
