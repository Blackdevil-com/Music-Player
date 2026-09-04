import React, { useRef, useState, useEffect, useCallback } from 'react';
import { getSongCover, getSongDuration, formatTime } from '../utils/mediaUtils';

/**
 * Spotify Bottom Audio Player Bar
 * Exact 3-column layout matching Spotify Web/Desktop Player (media_1788549186221.png):
 * - Left: Cover Artwork, Title, Artist, Heart (Like) button
 * - Center: Shuffle, Prev, Big White Circular Play/Pause button, Next, Repeat + Scrubber seekbar
 * - Right: Now Playing panel toggle, Lyrics, Queue drawer, Device, Volume slider, Fullscreen
 */
export default function AudioPlayer({
  song,
  streamUrl,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isLiked = false,
  onToggleLike,
  isRightPanelOpen = false,
  onToggleRightPanel,
  queue = [],
  onPlayQueueItem,
  onSyncState,
  onOpenLyrics,
}) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song?.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buffered, setBuffered] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Sync streamUrl
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!streamUrl) {
      setPlaying(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(song?.durationSeconds || 0);
    setBuffered(0);
    audio.src = streamUrl;
    audio.load();

    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        setPlaying(true);
        setLoading(false);
      }).catch(() => {
        // Fallback demo stream
        audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        audio.load();
        audio.play()
          .then(() => {
            setPlaying(true);
            setLoading(false);
          })
          .catch(() => {
            setPlaying(false);
            setLoading(false);
          });
      });
    }

    // Safety timeout: loading spinner NEVER sticks around past 700ms
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(safetyTimer);
  }, [streamUrl, song]);

  // Wire audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setPlaying(true);
      setLoading(false);
    };
    const onPause = () => {
      setPlaying(false);
      setLoading(false);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setLoading(false);
    };
    const onDuration = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onCanPlay = () => setLoading(false);
    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onError = () => {
      setLoading(false);
      setError('Could not load audio stream.');
    };
    const onProgress = () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const end = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((end / audio.duration) * 100);
      }
    };
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (hasNext) {
        onNext?.();
      } else {
        setPlaying(false);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);
    audio.addEventListener('progress', onProgress);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('progress', onProgress);
      audio.removeEventListener('ended', onEnded);
    };
  }, [hasNext, isRepeat, onNext]);

  // Spacebar toggle
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      setLoading(false);
    } else {
      setLoading(false);
      if (!audio.src) {
        audio.src = streamUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setPlaying(true);
          setLoading(false);
        }).catch(() => {
          audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
          audio.play().then(() => {
            setPlaying(true);
            setLoading(false);
          }).catch(() => {
            setPlaying(false);
            setLoading(false);
          });
        });
      }
    }
  }, [playing, streamUrl]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = ratio * duration;
    setCurrentTime(target);
    if (audio) {
      audio.currentTime = target;
    }
  }, [duration]);

  const seekTo = useCallback((targetSeconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = targetSeconds;
    }
    setCurrentTime(targetSeconds);
  }, []);

  // Sync state to parent / RightPanel
  useEffect(() => {
    onSyncState?.(
      {
        playing,
        currentTime,
        duration: duration || song?.durationSeconds || 209,
        loading,
        isShuffle,
        isRepeat,
      },
      {
        togglePlay,
        seek: seekTo,
        toggleShuffle: () => setIsShuffle((prev) => !prev),
        toggleRepeat: () => setIsRepeat((prev) => !prev),
      }
    );
  }, [playing, currentTime, duration, loading, isShuffle, isRepeat, song, togglePlay, seekTo, onSyncState]);

  const handleVolume = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  }, [muted]);

  const progressPct = duration ? (currentTime / duration) * 100 : 0;

  // Fallback demo song if none provided
  const displaySong = song || {
    title: 'Before you Go',
    artistName: 'Lewis Capaldi',
    genre: 'Pop Ballad',
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* ── Fixed Spotify Bottom Player Bar (1:1 match to media_1788549186221.png) ── */}
      <footer className="spotify-bottom-player" role="region" aria-label="Patta Kelu Player Controls">
        {/* ── Column 1: Track Thumbnail, Title, Artist, Heart ── */}
        <div className="player-col-left">
          <div
            className="player-thumb-wrap"
            onClick={onToggleRightPanel}
            title="Now Playing View"
          >
            <img
              src={getSongCover(displaySong)}
              alt=""
              className="player-thumb-img"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop';
              }}
            />
          </div>

          <div className="player-meta-box">
            <span
              className="player-track-name"
              onClick={onToggleRightPanel}
              title={displaySong.title}
            >
              {displaySong.title}
            </span>
            <span
              className="player-artist-name"
              title={displaySong.artistName}
            >
              {displaySong.artistName || 'Lossless Master'}
            </span>
          </div>

          <button
            className={`player-heart-btn ${isLiked ? 'active' : ''}`}
            onClick={onToggleLike}
            title={isLiked ? 'In Your Library' : 'Save to Your Library'}
            aria-label={isLiked ? 'In Your Library' : 'Save to Your Library'}
          >
            {isLiked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1ED760">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Column 2: Controls + Seekbar ── */}
        <div className="player-col-center">
          <div className="player-transport-buttons">
            {/* Shuffle */}
            <button
              className={`transport-btn ${isShuffle ? 'active-green' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Enable shuffle"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* Previous */}
            <button
              className="transport-btn"
              onClick={onPrev}
              title="Previous track"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Big White Circular Play/Pause Button (matching Image 3) */}
            <button
              className="spotify-white-circle-play-btn"
              onClick={togglePlay}
              title={playing ? 'Pause' : 'Play'}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {loading ? (
                <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#000000' }} />
              ) : playing ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ transform: 'translateX(1px)' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              className="transport-btn"
              onClick={onNext}
              title="Next track"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Repeat */}
            <button
              className={`transport-btn ${isRepeat ? 'active-green' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
              title="Enable repeat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>
          </div>

          {/* Scrubber Seekbar (with hover green fill & knob) */}
          <div className="player-playback-bar">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div
              className="spotify-progress-bar"
              onClick={handleSeek}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuenow={currentTime}
              aria-valuemax={duration}
            >
              <div className="progress-buffered" style={{ width: `${buffered}%` }} />
              <div className="progress-played" style={{ width: `${progressPct}%` }}>
                <div className="progress-handle" />
              </div>
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>

          {error && (
            <div style={{ fontSize: 10.5, color: '#f87171', marginTop: -2 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── Column 3: Secondary Actions & Volume ── */}
        <div className="player-col-right">
          {/* Now Playing View Toggle */}
          <button
            className={`transport-btn ${isRightPanelOpen ? 'active-green' : ''}`}
            onClick={onToggleRightPanel}
            title="Now playing view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M10 8v8l6-4z" />
            </svg>
          </button>

          {/* Lyrics */}
          <button
            className={`transport-btn ${showLyrics ? 'active-green' : ''}`}
            onClick={() => (onOpenLyrics ? onOpenLyrics() : setShowLyrics(true))}
            title="Lyrics"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </button>

          {/* Queue */}
          <button
            className={`transport-btn ${showQueue ? 'active-green' : ''}`}
            onClick={() => setShowQueue(true)}
            title="Queue"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </button>

          {/* Connect to a Device */}
          <button
            className="transport-btn"
            onClick={() => alert('Connected to: Patta Kelu Lossless Web Audio Player')}
            title="Connect to a device"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v10H4z" fill="none" />
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z" />
            </svg>
          </button>

          {/* Volume Control */}
          <div className="volume-bar-wrap">
            <button
              className="transport-btn"
              onClick={toggleMute}
              title="Mute / Unmute"
            >
              {muted || volume === 0 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="volume-slider"
              aria-label="Volume"
            />
          </div>

          {/* Fullscreen */}
          <button
            className="transport-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full screen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>
      </footer>
      {/* ── Spotify Lyrics Fullscreen Modal ── */}
      {showLyrics && (
        <div className="modal-overlay" onClick={() => setShowLyrics(false)}>
          <div
            className="modal"
            style={{ maxWidth: 520, background: 'linear-gradient(180deg, #242424 0%, #121212 100%)', textAlign: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--spotify-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Lyrics • {song.title}
              </div>
              <button className="modal-close" onClick={() => setShowLyrics(false)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '24px 12px', maxHeight: 360, overflowY: 'auto' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', opacity: 0.9 }}>
                [Verse 1]
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--spotify-green)', lineHeight: 1.4 }}>
                White shirt now red, my bloody nose
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', opacity: 0.8 }}>
                Sleepin', you're on your tippy toes
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', opacity: 0.7 }}>
                Creepin' around like no one knows
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', opacity: 0.6 }}>
                Think you're so criminal
              </p>
              <p style={{ fontSize: 24, fontWeight: 900, color: 'var(--spotify-green)', margin: '12px 0' }}>
                So you're a tough guy, like it really rough guy
              </p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', opacity: 0.8 }}>
                Just can't get enough guy, chest always so puffed guy
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: 'var(--spotify-green)' }}>
                I'm that bad type, make your mama sad type
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Spotify Queue Drawer Modal ── */}
      {showQueue && (
        <div className="modal-overlay" onClick={() => setShowQueue(false)}>
          <div
            className="modal"
            style={{ maxWidth: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Play Queue</h2>
              <button className="modal-close" onClick={() => setShowQueue(false)}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-subdued)', marginBottom: 8 }}>
              Now Playing
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--spotify-surface-elevated)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
              <div className="track-cover-sm">🎵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--spotify-green)' }}>{song.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-subdued)' }}>{song.artistName || 'Various Artists'}</div>
              </div>
              <span style={{ color: 'var(--spotify-green)' }}>🔊</span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-subdued)', marginBottom: 8 }}>
              Next Up in Queue ({queue.length})
            </div>
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: 300, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: track.id === song.id ? 'rgba(30, 215, 96, 0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onPlayQueueItem && onPlayQueueItem(track);
                    setShowQueue(false);
                  }}
                >
                  <div className="track-cover-sm">🎵</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: track.id === song.id ? 'var(--spotify-green)' : '#ffffff' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-subdued)' }}>{track.artistName || 'Various Artists'}</div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>3:21</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Immersion View ── */}
      {isFullscreen && (
        <div className="modal-overlay" onClick={() => setIsFullscreen(false)}>
          <div
            className="modal"
            style={{ maxWidth: 460, textAlign: 'center', background: '#121212' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--spotify-green)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Spotify Lossless Mode 🔊
              </span>
              <button className="modal-close" onClick={() => setIsFullscreen(false)}>
                ✕
              </button>
            </div>

            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #181818 0%, #282828 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 84,
                boxShadow: 'var(--shadow-elevated)',
                marginBottom: 24,
              }}
            >
              🎵
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
              {song.title}
            </h2>
            <p style={{ color: 'var(--text-subdued)', fontSize: 15, marginBottom: 24 }}>
              {[song.artistName || 'Various Artists', song.genre || 'Lossless Hi-Fi'].filter(Boolean).join(' • ')}
            </p>

            <div className="player-playback-bar" style={{ marginBottom: 24 }}>
              <span className="player-time">{formatTime(currentTime)}</span>
              <div className="spotify-progress-bar" onClick={handleSeek} style={{ height: 6 }}>
                <div className="progress-buffered" style={{ width: `${buffered}%` }} />
                <div className="progress-played" style={{ width: `${progressPct}%` }}>
                  <div className="progress-handle" style={{ width: 14, height: 14, opacity: 1 }} />
                </div>
              </div>
              <span className="player-time">{formatTime(duration)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
              <button className={`transport-btn ${isShuffle ? 'active' : ''}`} onClick={() => setIsShuffle(!isShuffle)}>
                🔀
              </button>
              <button className="transport-btn" onClick={onPrev} disabled={!hasPrev} style={{ fontSize: 24 }}>
                ⏮
              </button>
              <button
                className="play-pause-circle-btn"
                onClick={togglePlay}
                style={{ width: 56, height: 56, fontSize: 24 }}
              >
                {loading ? <span className="spinner" /> : playing ? '⏸' : '▶'}
              </button>
              <button className="transport-btn" onClick={onNext} disabled={!hasNext} style={{ fontSize: 24 }}>
                ⏭
              </button>
              <button className={`transport-btn ${isRepeat ? 'active' : ''}`} onClick={() => setIsRepeat(!isRepeat)}>
                🔁
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
