package com.scorpix.music_player.controller;

import com.scorpix.music_player.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        return fileStorageService.serveImage(filename);
    }
}
