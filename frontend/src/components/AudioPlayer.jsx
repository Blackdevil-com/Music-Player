import React, { useRef, useState, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   AudioPlayer
   Streams audio from the backend via HTML5 <audio>.
   The browser natively sends HTTP Range headers → backend replies 206 Partial.

   Props:
     song       — { id, title, artistName, albumName, genre }
     onClose    — close/dismiss callback
     onPrev     — play previous song callback (optional)
     onNext     — play next song callback (optional)
     hasPrev    — boolean
     hasNext    — boolean
   ───────────────────────────────────────────────────────────────────────────── */
export default function AudioPlayer({ song, streamUrl, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const audioRef = useRef(null);

  const [playing,    setPlaying]    = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,   setDuration]   = useState(0);
  const [volume,     setVolume]     = useState(1);
  const [muted,      setMuted]      = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [buffered,   setBuffered]   = useState(0); // percent

  // ── Sync audio element when streamUrl changes ─────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setLoading(true);
    setError(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    audio.src = streamUrl;
    audio.load();
    audio.play().catch(() => {}); // autoplay on song change
  }, [streamUrl]);

  // ── Wire audio events ─────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay        = () => setPlaying(true);
    const onPause       = () => setPlaying(false);
    const onTimeUpdate  = () => setCurrentTime(audio.currentTime);
    const onDuration    = () => setDuration(audio.duration || 0);
    const onCanPlay     = () => setLoading(false);
    const onWaiting     = () => setLoading(true);
    const onPlaying     = () => { setLoading(false); setPlaying(true); };
    const onError       = () => {
      setLoading(false);
      setError('Failed to load stream. Make sure the song file exists on the server.');
    };
    const onProgress    = () => {
      if (audio.buffered.length > 0 && audio.duration) {
        const end = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((end / audio.duration) * 100);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      if (hasNext) onNext?.();
    };

    audio.addEventListener('play',       onPlay);
    audio.addEventListener('pause',      onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('canplay',    onCanPlay);
    audio.addEventListener('waiting',    onWaiting);
    audio.addEventListener('playing',    onPlaying);
    audio.addEventListener('error',      onError);
    audio.addEventListener('progress',   onProgress);
    audio.addEventListener('ended',      onEnded);

    return () => {
      audio.removeEventListener('play',       onPlay);
      audio.removeEventListener('pause',      onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('canplay',    onCanPlay);
      audio.removeEventListener('waiting',    onWaiting);
      audio.removeEventListener('playing',    onPlaying);
      audio.removeEventListener('error',      onError);
      audio.removeEventListener('progress',   onProgress);
      audio.removeEventListener('ended',      onEnded);
    };
  }, [hasNext, onNext]);

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
  }, [playing]);

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }, [duration]);

  const handleVolume = useCallback((e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    setMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const skip = useCallback((secs) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + secs));
  }, [duration]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      if (e.key === 'ArrowLeft')  skip(-10);
      if (e.key === 'ArrowRight') skip(10);
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skip, onClose]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const volumeIcon  = muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊';

  return (
    <div className="audio-player" role="region" aria-label="Audio player">
      {/* Hidden native audio element — the browser sends Range requests to the stream URL */}
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* Song info */}
      <div className="ap-info">
        <div className="ap-disc" aria-hidden="true">
          <span className="ap-disc-icon" style={{ animationPlayState: playing ? 'running' : 'paused' }}>🎵</span>
        </div>
        <div className="ap-meta">
          <div className="ap-title" title={song.title}>{song.title}</div>
          <div className="ap-sub">
            {[song.artistName, song.albumName].filter(Boolean).join(' · ') || 'Unknown'}
            {song.genre && <span className="ap-genre">{song.genre}</span>}
          </div>
        </div>
      </div>

      {/* Center controls */}
      <div className="ap-center">
        {/* Transport buttons */}
        <div className="ap-transport">
          <button id="ap-skip-back-10"  className="ap-btn ap-btn-sm" onClick={() => skip(-10)}  title="Back 10s">⏮ 10</button>
          <button id="ap-prev"          className="ap-btn ap-btn-sm" onClick={onPrev}  disabled={!hasPrev} title="Previous">⏪</button>
          <button id="ap-play-pause"    className="ap-btn ap-btn-play" onClick={togglePlay} title={playing ? 'Pause (Space)' : 'Play (Space)'} aria-label={playing ? 'Pause' : 'Play'}>
            {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : playing ? '⏸' : '▶'}
          </button>
          <button id="ap-next"          className="ap-btn ap-btn-sm" onClick={onNext}  disabled={!hasNext} title="Next">⏩</button>
          <button id="ap-skip-fwd-10"   className="ap-btn ap-btn-sm" onClick={() => skip(10)}   title="Forward 10s">10 ⏭</button>
        </div>

        {/* Progress bar */}
        <div className="ap-progress-wrap">
          <span className="ap-time">{fmt(currentTime)}</span>
          <div
            className="ap-progress"
            id="ap-seek-bar"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration || 0}
            aria-valuenow={currentTime}
            aria-label="Seek"
            tabIndex={0}
            onClick={handleSeek}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft')  skip(-5);
              if (e.key === 'ArrowRight') skip(5);
            }}
          >
            {/* Buffered */}
            <div className="ap-buffered"  style={{ width: `${buffered}%` }} />
            {/* Played */}
            <div className="ap-played"    style={{ width: `${progressPct}%` }}>
              <div className="ap-thumb" />
            </div>
          </div>
          <span className="ap-time">{fmt(duration)}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="ap-error" role="alert">⚠️ {error}</div>
        )}
      </div>

      {/* Volume + close */}
      <div className="ap-right">
        <button id="ap-mute" className="ap-btn ap-btn-sm" onClick={toggleMute} title="Toggle mute" style={{ fontSize: 18 }}>
          {volumeIcon}
        </button>
        <input
          id="ap-volume"
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={handleVolume}
          className="ap-volume-slider"
          aria-label="Volume"
          title={`Volume: ${Math.round((muted ? 0 : volume) * 100)}%`}
        />
        <button id="ap-close" className="ap-btn ap-btn-sm" onClick={onClose} title="Close player (Esc)" style={{ marginLeft: 8 }}>
          ✕
        </button>
      </div>
    </div>
  );
}
