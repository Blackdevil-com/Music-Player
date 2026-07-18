package com.scorpix.music_player.controller;

import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.service.SongService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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


    @PostMapping(value = "/songs")
    public ResponseEntity<SongDto> addSong(@RequestPart SongDto songDto , @RequestPart MultipartFile file) {
        return new ResponseEntity<>(
                songService.addSong(songDto, file), HttpStatus.CREATED);
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
    public ResponseEntity<HttpStatus> deleteSongById(@PathVariable Long id){
        songService.deleteSongById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
