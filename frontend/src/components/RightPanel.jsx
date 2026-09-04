import React, { useState } from 'react';
import { getSongCover, getSongDuration, formatTime } from '../utils/mediaUtils';

/**
 * Spotify Right Console: "Now Playing" Studio Player
 * 1:1 match to media_1788546109465.png & media_1788549186221.png:
 * - Header: ‹ Now playing ⋮
 * - Large curved square artwork with artist aesthetic and green ambient glow
 * - Track Title, Artist, Heart toggle
 * - Seekbar line + timestamps (synced directly to main player)
 * - Transport controls: Shuffle, Prev, Big Green Circular Play/Pause, Next, Repeat
 * - ^ Lyrics trigger (opens Synced Vocal Lyrics)
 * - Autoplay label + green toggle switch
 * - About the artist card with Monthly Listeners & Follow button
 * - Mini queue list with durations & active playing bar
 */
export default function RightPanel({
  song,
  queue = [],
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isLiked = false,
  onToggleLike,
  onPlayQueueItem,
  onClose,
  playing = false,
  currentTime = 0,
  duration = 209,
  loading = false,
  onTogglePlay,
  onSeek,
  isShuffle = false,
  onToggleShuffle,
  isRepeat = false,
  onToggleRepeat,
  onOpenLyrics,
}) {
  const [autoplay, setAutoplay] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fallback defaults
  const displayTitle = song ? song.title : 'Bad Guy';
  const displayArtist = song ? (song.artistName || 'Billie Eilish') : 'Billie Eilish';

  const trackDuration = duration || song?.durationSeconds || 209;
  const progressPct = trackDuration ? (currentTime / trackDuration) * 100 : 0;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = ratio * trackDuration;
    onSeek?.(targetTime);
  };

  // Queue tracks
  const currentIdx = queue.findIndex((s) => s.id === song?.id);
  const remainingQueue = currentIdx >= 0 ? queue.slice(currentIdx + 1, currentIdx + 4) : queue.slice(1, 4);

  const displayQueue = remainingQueue.length > 0 ? remainingQueue : [
    { id: 'mock-1', title: 'HUMBLE.', artistName: 'Kendrick Lamar', duration: '2:57' },
    { id: 'mock-2', title: 'Kill Bill', artistName: 'SZA', duration: '2:33' },
  ];

  return (
    <aside className="spotify-right-console" role="complementary" aria-label="Now Playing Console">
      {/* ── Console Header (Title + Close ✕) ── */}
      <div className="console-header">
        <span className="console-header-title">{displayTitle}</span>
        <button className="console-icon-btn" onClick={onClose} title="Close Now Playing">
          ✕
        </button>
      </div>

      {/* ── Large Square Artwork ── */}
      <div className="console-artwork-container">
        <div className="console-artwork-card">
          <div className="console-artwork-overlay">
            <span className="artwork-icon-large">🎧</span>
          </div>
          <img
            src={getSongCover(song || { title: displayTitle, artistName: displayArtist })}
            alt={displayTitle}
            className="console-artwork-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop';
            }}
          />
        </div>
      </div>

      {/* ── Track Title, Artist & Heart ── */}
      <div className="console-meta-row">
        <div className="console-text-box">
          <h2 className="console-track-title" title={displayTitle}>
            {displayTitle}
          </h2>
          <div className="console-artist-sub" title={displayArtist}>
            {displayArtist}
          </div>
        </div>

        <button
          className={`console-heart-btn ${isLiked ? 'liked' : ''}`}
          onClick={onToggleLike}
          title={isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
        >
          {isLiked ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1ED760">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Scrubber Seekbar with Timestamps (Synced to main player) ── */}
      <div className="console-seekbar-section">
        <div
          className="spotify-scrubber-bar"
          onClick={handleSeek}
          role="slider"
          tabIndex={0}
          aria-label="Seek track position"
        >
          <div className="scrubber-fill" style={{ width: `${progressPct}%` }}>
            <div className="scrubber-knob" />
          </div>
        </div>

        <div className="console-timestamps">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(trackDuration)}</span>
        </div>
      </div>

      {/* ── Transport Controls Row ── */}
      <div className="console-controls-row">
        {/* Shuffle */}
        <button
          className={`console-transport-btn ${isShuffle ? 'active-green' : ''}`}
          onClick={onToggleShuffle}
          title="Shuffle playback"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        </button>

        {/* Previous */}
        <button
          className="console-transport-btn"
          onClick={onPrev}
          disabled={!hasPrev}
          title="Previous song"
          style={{ opacity: hasPrev ? 1 : 0.4 }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Big Spotify Green Play/Pause Button (No stuck spinner!) */}
        <button
          className="console-play-large-circle"
          onClick={onTogglePlay}
          title={playing ? 'Pause' : 'Play'}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {loading ? (
            <span className="spinner" style={{ width: 18, height: 18, borderTopColor: '#000000' }} />
          ) : playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#000000" style={{ transform: 'translateX(1px)' }}>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next */}
        <button
          className="console-transport-btn"
          onClick={onNext}
          disabled={!hasNext}
          title="Next song"
          style={{ opacity: hasNext ? 1 : 0.4 }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        {/* Repeat */}
        <button
          className={`console-transport-btn ${isRepeat ? 'active-green' : ''}`}
          onClick={onToggleRepeat}
          title="Repeat playback"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </button>
      </div>

      {/* ── ^ Lyrics Button ── */}
      <button
        className="console-lyrics-btn"
        onClick={onOpenLyrics}
        title="Open vocal-synced lyrics view"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <span>Lyrics</span>
      </button>

      {/* ── Autoplay Row ── */}
      <div className="console-autoplay-row">
        <span className="autoplay-label">Autoplay</span>
        <div
          className={`spotify-toggle-switch ${autoplay ? 'on' : ''}`}
          onClick={() => setAutoplay(!autoplay)}
          title="Toggle autoplay"
        >
          <div className="switch-circle-knob" />
        </div>
      </div>

      {/* ── About the Artist Card (1:1 match to media_1788549186221.png) ── */}
      <div className="console-about-artist-card">
        <div className="about-artist-hero-wrap">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
            alt={displayArtist}
            className="about-artist-hero-img"
          />
          <div className="about-artist-heading">About the artist</div>
        </div>
        <div className="about-artist-body">
          <h3 className="about-artist-name">{displayArtist}</h3>
          <div className="about-artist-listeners-row">
            <span className="about-artist-listeners">33,611,524 monthly listeners</span>
            <button
              className={`about-artist-follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
          <p className="about-artist-bio">
            Award-winning artist known for profound songwriting, soul-stirring melodies, and record-breaking streaming releases spanning across every corner of the globe.
          </p>
        </div>
      </div>

      {/* ── Mini Queue Section ── */}
      <div className="console-queue-container">
        {/* Current track item in queue */}
        <div className="console-queue-track active-playing-track">
          <div className="playing-accent-bar" />
          <div className="queue-thumb-sm">
            <img
              src={getSongCover(song || { title: displayTitle, artistName: displayArtist })}
              alt=""
              className="queue-thumb-img"
            />
          </div>
          <div className="queue-info-box">
            <div className="queue-song-name">{displayTitle}</div>
            <div className="queue-artist-name">{displayArtist}</div>
          </div>
          <div className="queue-time-span">{song ? getSongDuration(song) : formatTime(trackDuration)}</div>
        </div>

        {/* Subsequent tracks */}
        {displayQueue.map((item, idx) => (
          <div
            key={item.id || idx}
            className="console-queue-track"
            onClick={() => onPlayQueueItem && onPlayQueueItem(item)}
          >
            <div className="queue-thumb-sm">
              <img
                src={getSongCover(item)}
                alt=""
                className="queue-thumb-img"
              />
            </div>
            <div className="queue-info-box">
              <div className="queue-song-name">{item.title}</div>
              <div className="queue-artist-name">{item.artistName || 'Lossless Audio'}</div>
            </div>
            <div className="queue-time-span">{getSongDuration(item)}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
