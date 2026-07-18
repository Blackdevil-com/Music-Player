package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.FileMetaData;
import jakarta.annotation.PostConstruct;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.storage.location}")
    private String storageLocation;

    private final Tika tika = new Tika();

    @PostConstruct
    public void init() {
        try {
            if(!Files.exists(Path.of(storageLocation)))
                Files.createDirectories(Path.of(storageLocation));
            }catch (IOException e) {
                throw new RuntimeException("Could not create directory at location : " + e);
        }
    }

    public FileMetaData storeAudioFile(MultipartFile file) {
        if(file.isEmpty()) throw new RuntimeException("File is empty");

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if(dotIndex >= 0) {
            extension = originalFileName.substring(dotIndex + 1).toLowerCase();
        }

        List<String> formatAllowed = Arrays.asList("mp3", "wav", "flac");

        if(!formatAllowed.contains(extension)) throw new RuntimeException("Invalid format" + extension);

        String actualMimeFormat;
        InputStream streamData;
        try {
            streamData = file.getInputStream();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        try {
            actualMimeFormat = tika.detect(streamData);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        List<String> allowedMimeType = Arrays.asList("audio/mpeg", "audio/wav", "audio/flac", "audio/x-flac");

        if(!allowedMimeType.contains(actualMimeFormat)) throw new RuntimeException("Malicious file content detected");

        String uniqueFileName = UUID.randomUUID().toString() + "." + extension;
        try {
            Path destinationFile = Path.of(storageLocation).resolve(uniqueFileName);
            if(!destinationFile.getParent().equals(Path.of(storageLocation))){
                throw new RuntimeException("Could not store file outside current destination");
            }

            try {
                Files.copy(streamData, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                return new FileMetaData(destinationFile.toAbsolutePath().toString(), file.getSize(), file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to store file" + originalFileName);
        }


    }
}
