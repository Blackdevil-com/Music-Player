package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.entity.Role;
import com.scorpix.music_player.entity.User;
import com.scorpix.music_player.service.SongService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SongController {

    private final SongService songService;
    public SongController(SongService songService) {
        this.songService = songService;
    }


    @PostMapping(value = "/songs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SongDto> addSong(
            @RequestPart("songDto") SongDto songDto,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "cover", required = false) MultipartFile cover
    ) {
        return new ResponseEntity<>(
                songService.addSong(songDto, file, cover), HttpStatus.CREATED);
    }

    @GetMapping("/songs")
    public ResponseEntity<List<SongDto>> getAllSong() {
        return ResponseEntity.ok(songService.getAllSong());
    }

    @GetMapping("/songs/{id}")
    public ResponseEntity<SongDto> getSongById(@PathVariable Long id) {
        return ResponseEntity.ok(songService.getSongById(id));
    }

    @DeleteMapping("/songs/{id}")
    public ResponseEntity<?> deleteSongById(@PathVariable Long id, @AuthenticationPrincipal User user){
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only administrators have authority to delete songs.");
        }
        songService.deleteSongById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/songs/{id}/lyrics")
    public ResponseEntity<SongDto> updateLyrics(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        return ResponseEntity.ok(songService.updateLyrics(id, payload.get("lyrics")));
    }

    @GetMapping("/songs/{id}/stream")
    public ResponseEntity<?> streamSong(@PathVariable Long id,
                                        @RequestHeader(value = "Range", required = false) String rangeHeader) {
        return songService.streamSong(id, rangeHeader);
    }
}
