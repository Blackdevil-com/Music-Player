package com.scorpix.music_player.repository;

import com.scorpix.music_player.entity.PlayHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayHistoryRepository extends JpaRepository<PlayHistory, Long> {
    List<PlayHistory> findTop20ByUserIdOrderByPlayedAtDesc(Long userId);
    List<PlayHistory> findTop20ByOrderByPlayedAtDesc();
}
