package com.scorpix.music_player.service;

import com.scorpix.music_player.dto.AlbumDto;
import com.scorpix.music_player.dto.ArtistDto;
import com.scorpix.music_player.dto.SongDto;
import com.scorpix.music_player.dto.response.PlaylistResponse;
import com.scorpix.music_player.entity.*;
import com.scorpix.music_player.exception.ResourceNotFoundException;
import com.scorpix.music_player.mapper.AlbumMapper;
import com.scorpix.music_player.mapper.ArtistMapper;
import com.scorpix.music_player.mapper.PlaylistMapper;
import com.scorpix.music_player.mapper.SongMapper;
import com.scorpix.music_player.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SpotifyService {

    private final SongRepository songRepository;
    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final PlayHistoryRepository playHistoryRepository;
    private final ArtistRepository artistRepository;
    private final AlbumRepository albumRepository;
    private final PlaylistRepository playlistRepository;
    private final SongMapper songMapper;
    private final ArtistMapper artistMapper;
    private final AlbumMapper albumMapper;
    private final PlaylistMapper playlistMapper;

    public SpotifyService(
            SongRepository songRepository,
            UserRepository userRepository,
            UserFavoriteRepository userFavoriteRepository,
            PlayHistoryRepository playHistoryRepository,
            ArtistRepository artistRepository,
            AlbumRepository albumRepository,
            PlaylistRepository playlistRepository,
            SongMapper songMapper,
            ArtistMapper artistMapper,
            AlbumMapper albumMapper,
            PlaylistMapper playlistMapper
    ) {
        this.songRepository = songRepository;
        this.userRepository = userRepository;
        this.userFavoriteRepository = userFavoriteRepository;
        this.playHistoryRepository = playHistoryRepository;
        this.artistRepository = artistRepository;
        this.albumRepository = albumRepository;
        this.playlistRepository = playlistRepository;
        this.songMapper = songMapper;
        this.artistMapper = artistMapper;
        this.albumMapper = albumMapper;
        this.playlistMapper = playlistMapper;
    }

    private User getOrCreateUser(String email) {
        if (email == null || email.isBlank()) {
            return userRepository.findAll().stream().findFirst().orElse(null);
        }
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setName(email.split("@")[0]);
            user.setRole(Role.USER);
            return userRepository.save(user);
        });
    }

    @Transactional
    public Map<String, Object> toggleLike(Long songId, String userEmail) {
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found"));
        User user = getOrCreateUser(userEmail);

        if (user == null) {
            return Map.of("isLiked", false, "songId", songId);
        }

        Optional<UserFavorite> existing = userFavoriteRepository.findByUserIdAndSongId(user.getId(), songId);
        boolean isLiked;
        if (existing.isPresent()) {
            userFavoriteRepository.delete(existing.get());
            isLiked = false;
        } else {
            UserFavorite fav = new UserFavorite();
            fav.setUser(user);
            fav.setSong(song);
            userFavoriteRepository.save(fav);
            isLiked = true;
        }

        return Map.of("isLiked", isLiked, "songId", songId);
    }

    public List<SongDto> getLikedSongs(String userEmail) {
        User user = getOrCreateUser(userEmail);
        if (user == null) {
            return Collections.emptyList();
        }
        List<UserFavorite> favorites = userFavoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return favorites.stream()
                .map(UserFavorite::getSong)
                .filter(Objects::nonNull)
                .map(songMapper::toDto)
                .toList();
    }

    public List<Long> getLikedSongIds(String userEmail) {
        User user = getOrCreateUser(userEmail);
        if (user == null) {
            return Collections.emptyList();
        }
        return userFavoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(f -> f.getSong().getId())
                .toList();
    }

    @Transactional
    public void recordPlay(Long songId, String userEmail) {
        Song song = songRepository.findById(songId).orElse(null);
        if (song == null) return;

        // Increment play count
        long currentCount = song.getPlayCount() != null ? song.getPlayCount() : 0L;
        song.setPlayCount(currentCount + 1);
        songRepository.save(song);

        User user = getOrCreateUser(userEmail);
        if (user != null) {
            PlayHistory history = new PlayHistory();
            history.setUser(user);
            history.setSong(song);
            playHistoryRepository.save(history);
        }
    }

    public List<SongDto> getRecentlyPlayed(String userEmail) {
        User user = getOrCreateUser(userEmail);
        List<PlayHistory> history;
        if (user != null) {
            history = playHistoryRepository.findTop20ByUserIdOrderByPlayedAtDesc(user.getId());
        } else {
            history = playHistoryRepository.findTop20ByOrderByPlayedAtDesc();
        }

        // De-duplicate retaining recent order
        Set<Long> seen = new HashSet<>();
        List<SongDto> results = new ArrayList<>();
        for (PlayHistory h : history) {
            if (h.getSong() != null && seen.add(h.getSong().getId())) {
                SongDto dto = songMapper.toDto(h.getSong());
                if (dto != null) results.add(dto);
            }
        }
        return results;
    }

    public Map<String, Object> globalSearch(String query) {
        if (query == null || query.isBlank()) {
            return Map.of(
                    "topResult", Map.of(),
                    "songs", Collections.emptyList(),
                    "artists", Collections.emptyList(),
                    "albums", Collections.emptyList(),
                    "playlists", Collections.emptyList()
            );
        }

        String q = query.toLowerCase().trim();

        List<SongDto> allSongs = songRepository.findAll().stream()
                .map(songMapper::toDto)
                .filter(s -> (s.getTitle() != null && s.getTitle().toLowerCase().contains(q)) ||
                             (s.getArtistName() != null && s.getArtistName().toLowerCase().contains(q)) ||
                             (s.getAlbumName() != null && s.getAlbumName().toLowerCase().contains(q)) ||
                             (s.getGenre() != null && s.getGenre().toLowerCase().contains(q)))
                .toList();

        List<ArtistDto> allArtists = artistRepository.findAll().stream()
                .map(artistMapper::toDto)
                .filter(a -> a.getArtistName() != null && a.getArtistName().toLowerCase().contains(q))
                .toList();

        List<AlbumDto> allAlbums = albumRepository.findAll().stream()
                .map(albumMapper::toDto)
                .filter(al -> al.getAlbumName() != null && al.getAlbumName().toLowerCase().contains(q))
                .toList();

        List<PlaylistResponse> allPlaylists = playlistRepository.findAll().stream()
                .map(playlistMapper::toDetailDto)
                .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(q))
                .toList();

        // Determine best Top Result
        Map<String, Object> topResult = new HashMap<>();
        if (!allSongs.isEmpty()) {
            topResult.put("type", "song");
            topResult.put("data", allSongs.get(0));
        } else if (!allArtists.isEmpty()) {
            topResult.put("type", "artist");
            topResult.put("data", allArtists.get(0));
        } else if (!allAlbums.isEmpty()) {
            topResult.put("type", "album");
            topResult.put("data", allAlbums.get(0));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("topResult", topResult);
        response.put("songs", allSongs);
        response.put("artists", allArtists);
        response.put("albums", allAlbums);
        response.put("playlists", allPlaylists);

        return response;
    }
}
