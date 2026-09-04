package com.scorpix.music_player.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "play_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "song_id")
    private Song song;

    private LocalDateTime playedAt;

    @PrePersist
    public void onPlay() {
        this.playedAt = LocalDateTime.now();
    }
}
