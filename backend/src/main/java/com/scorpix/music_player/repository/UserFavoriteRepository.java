package com.scorpix.music_player.repository;

import com.scorpix.music_player.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<UserFavorite> findByUserIdAndSongId(Long userId, Long songId);
    boolean existsByUserIdAndSongId(Long userId, Long songId);
    void deleteByUserIdAndSongId(Long userId, Long songId);
}
