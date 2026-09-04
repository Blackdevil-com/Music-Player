import React, { useState, useMemo } from 'react';
import { getSongCover, getSongDuration } from '../utils/mediaUtils';
import { useAuth } from '../context/AuthContext';

/**
 * Spotify Official Liked Songs Page
 * 1:1 match to Spotify desktop design:
 * - Grand atmospheric purple/indigo gradient hero
 * - 200px Glowing Heart artwork badge
 * - Play All (Big Green Play) & Shuffle buttons
 * - Spotify Table with Track Art, Title, Artist, Album, Date Added, Duration, and Green Heart Toggle
 * - Empty state with Call-to-Action
 */
export default function LikedSongsPage({
  likedSongs = [],
  loading,
  nowPlayingId,
  onPlay,
  onToggleLike,
}) {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'ianlaragordo';

  const [tableSearch, setTableSearch] = useState('');

  const filteredLiked = likedSongs.filter((s) =>
    [s.title, s.artistName, s.albumName, s.genre].some((v) =>
      v?.toLowerCase().includes(tableSearch.toLowerCase())
    )
  );

  const handlePlayAll = (shuffle = false) => {
    if (likedSongs.length === 0) return;
    let list = [...likedSongs];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    onPlay(list[0], list, 'liked-songs');
  };

  return (
    <div className="liked-songs-page-wrap">
      {/* ── Grand Spotify Liked Songs Hero Banner ── */}
      <div className="liked-hero-banner">
        {/* Heart Artwork Square Badge */}
        <div className="liked-hero-artwork">
          <svg width="84" height="84" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>

        {/* Hero Metadata */}
        <div className="liked-hero-text">
          <span className="liked-sublabel">Playlist</span>
          <h1 className="liked-title">Liked Songs</h1>
          <div className="liked-meta-row">
            <div className="liked-user-badge">
              <div className="liked-user-circle">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
              <span className="liked-user-name">{displayName}</span>
            </div>
            <span className="meta-bullet">•</span>
            <span className="liked-song-count">
              {likedSongs.length} song{likedSongs.length !== 1 ? 's' : ''}
            </span>
            <span className="meta-bullet">•</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              approx. {likedSongs.length * 3} min
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Bar: Big Green Play, Shuffle & Inline Search ── */}
      <div className="liked-action-bar">
        <button
          className="liked-giant-play-btn"
          onClick={() => handlePlayAll(false)}
          disabled={likedSongs.length === 0}
          title="Play Liked Songs"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#000000" style={{ transform: 'translateX(2px)' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <button
          className="liked-shuffle-btn"
          onClick={() => handlePlayAll(true)}
          disabled={likedSongs.length === 0}
          title="Shuffle Liked Songs"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        </button>

        {/* Filter input inside Liked Songs */}
        {likedSongs.length > 0 && (
          <div className="liked-filter-input-wrap">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>🔍</span>
            <input
              type="search"
              className="liked-filter-input"
              placeholder="Filter in Liked Songs"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* ── Tracklist Table / Empty State ── */}
      {likedSongs.length === 0 ? (
        <div className="liked-empty-state">
          <div className="empty-heart-circle">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#1ED760">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h2 className="empty-title">Songs you like will appear here</h2>
          <p className="empty-desc">
            Save tracks by tapping the heart icon on any song across Spotify.
          </p>
        </div>
      ) : filteredLiked.length === 0 ? (
        <div className="table-empty" style={{ padding: '40px 0' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
            No songs matching "{tableSearch}" in Liked Songs.
          </div>
        </div>
      ) : (
        <table className="spotify-table liked-table">
          <thead>
            <tr>
              <th style={{ width: 44, textAlign: 'center' }}>#</th>
              <th>Title</th>
              <th style={{ width: '26%' }}>Album</th>
              <th style={{ width: '18%' }}>Genre</th>
              <th style={{ width: 70, textAlign: 'right' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </th>
              <th style={{ width: 50, textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredLiked.map((song, idx) => {
              const isPlaying = song.id === nowPlayingId;
              return (
                <tr
                  key={song.id}
                  className={isPlaying ? 'active-playing' : ''}
                  onClick={() => onPlay(song, filteredLiked, 'liked-songs')}
                >
                  {/* Number or Hover Play */}
                  <td className="track-num-col">
                    {isPlaying ? (
                      <span style={{ color: 'var(--spotify-green)', fontSize: 13 }}>▶</span>
                    ) : (
                      <>
                        <span className="track-num-span">{idx + 1}</span>
                        <button
                          className="track-play-hover-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlay(song, filteredLiked, 'liked-songs');
                          }}
                        >
                          ▶
                        </button>
                      </>
                    )}
                  </td>

                  {/* Artwork + Title + Artist */}
                  <td>
                    <div className="track-title-cell">
                      <div className="track-cover-sm" style={{ overflow: 'hidden' }}>
                        <img
                          src={getSongCover(song)}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                        />
                      </div>
                      <div className="track-meta-wrap">
                        <span className="track-name-bold">{song.title}</span>
                        <span className="track-artist-sub">{song.artistName || 'Various Artists'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Album */}
                  <td>
                    <span className="table-album-text">{song.albumName || '—'}</span>
                  </td>

                  {/* Genre */}
                  <td>
                    {song.genre ? (
                      <span className="pill-tag">{song.genre}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-subdued)', fontSize: 13 }}>
                    {getSongDuration(song)}
                  </td>

                  {/* Like Button */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="heart-action-btn active"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(song.id);
                      }}
                      title="Remove from Liked Songs"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1ED760">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
