package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.FileMetaData;
import com.scorpix.music_player.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
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

        String uniqueFileName = UUID.randomUUID() + "." + extension;
        try {
            Path destinationFile = Path.of(storageLocation).resolve(uniqueFileName);
            if(!destinationFile.getParent().equals(Path.of(storageLocation))){
                throw new RuntimeException("Could not store file outside current destination");
            }

            streamData = file.getInputStream();

            try {
                Files.copy(streamData, destinationFile, StandardCopyOption.REPLACE_EXISTING);
                return new FileMetaData(destinationFile.toAbsolutePath().toString(), file.getSize(), file.getContentType());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to store file" + originalFileName);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


    }

    public ResponseEntity<?> streamFile(Path path, String rangeHeader) throws IOException{
        if(!Files.exists(path)) {
            throw new ResourceNotFoundException("File not found");
        }
        long fileLength = Files.size(path);

        // No Range header
        if(rangeHeader == null || !rangeHeader.startsWith("bytes")) {
            Resource resource = new FileSystemResource(path);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(Files.probeContentType(path)))
                    .contentLength(fileLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(resource);
        }

        // Parse Range header
        String [] ranges = rangeHeader.substring(6).split("-");

        long start = Long.parseLong(ranges[0]);
        long end = (ranges.length > 1 && !ranges[1].isEmpty())
                ? Long.parseLong(ranges[1])
                : fileLength - 1;

        if(end >= fileLength) {
            end = fileLength - 1;
        }

        long maxChunk = 1024 * 1024;
        end = Math.min(end, start + maxChunk - 1);
        long contentLength = end - start + 1;

        // Read range request
        try(RandomAccessFile randomAccessFile = new RandomAccessFile(path.toFile(), "r") ){
            randomAccessFile.seek(start);
            byte [] data = new byte[(int) contentLength];
            randomAccessFile.readFully(data);

            ByteArrayResource resource = new ByteArrayResource(data);

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.parseMediaType(Files.probeContentType(path)))
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(contentLength))
                    .header(HttpHeaders.CONTENT_RANGE,
                            "bytes " + start + "-" + end + "/" + fileLength)
                    .body(resource);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
