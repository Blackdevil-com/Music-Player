package com.scorpix.music_player.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Song {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @ManyToOne
    private Album album;

    @ManyToOne
    private Artist artist;

    private Integer durationSeconds;
    private String filePath;
    private Long fileSizeBytes;
    private String mimeType;
    private String genre;
    private Long playCount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    @PrePersist
    public void onCreate() {
        this.createAt = LocalDateTime.now();
    }
}
