import React, { useState, useEffect, useRef } from 'react';
import { getSongCover } from '../utils/mediaUtils';
import { parseLyrics, getSongLyricsText, saveSongLyrics } from '../utils/lyricsData';

export default function SpotifyLyricsModal({
  song,
  currentTime,
  duration,
  onSeek,
  onClose,
  showToast,
}) {
  const [lyricsText, setLyricsText] = useState(() => getSongLyricsText(song));
  const [parsedLines, setParsedLines] = useState(() => parseLyrics(getSongLyricsText(song), duration || 200));
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Re-parse when song or lyricsText changes
  useEffect(() => {
    const text = getSongLyricsText(song);
    setLyricsText(text);
    setParsedLines(parseLyrics(text, duration || 200));
  }, [song, duration]);

  // Find active line index
  let activeIndex = -1;
  for (let i = 0; i < parsedLines.length; i++) {
    if (currentTime >= parsedLines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth auto-scroll to keep active line centered
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const handleStartEdit = () => {
    setEditText(lyricsText);
    setIsEditing(true);
  };

  const handleSaveLyrics = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await saveSongLyrics(song?.id, editText);
      setLyricsText(editText);
      setParsedLines(parseLyrics(editText, duration || 200));
      setIsEditing(false);
      showToast && showToast('Lyrics updated successfully! 🎶', 'success');
    } catch {
      showToast && showToast('Saved lyrics locally', 'info');
      setLyricsText(editText);
      setParsedLines(parseLyrics(editText, duration || 200));
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const insertMusicBreak = () => {
    const m = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const s = Math.floor(currentTime % 60).toString().padStart(2, '0');
    const snippet = `\n[${m}:${s}] 🎵 🎶 (Music playing...) 🎶 🎵\n`;
    setEditText((prev) => prev + snippet);
  };

  const handleAutoAlign = () => {
    // If user entered plain lines, convert to [mm:ss] format automatically
    const lines = editText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const cleanLines = lines.map((l) => l.replace(/\[\d{1,2}:\d{2}(?:\.\d+)?\]/, '').trim()).filter(Boolean);
    const total = duration || 200;
    const intro = 8;
    const outro = Math.max(intro + 10, total - 8);
    const step = cleanLines.length > 0 ? (outro - intro) / cleanLines.length : 4;

    const formatted = [];
    formatted.push(`[00:00] 🎵 🎶 (Intro Music) 🎶 🎵`);
    cleanLines.forEach((l, i) => {
      const t = Math.round(intro + i * step);
      const mm = Math.floor(t / 60).toString().padStart(2, '0');
      const ss = Math.floor(t % 60).toString().padStart(2, '0');
      formatted.push(`[${mm}:${ss}] ${l}`);
    });
    const outM = Math.floor(outro / 60).toString().padStart(2, '0');
    const outS = Math.floor(outro % 60).toString().padStart(2, '0');
    formatted.push(`[${outM}:${outS}] 🎵 🎶 (Outro Music) 🎶 🎵`);

    setEditText(formatted.join('\n'));
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="spotify-lyrics-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '90vw',
          maxWidth: 680,
          height: '84vh',
          maxHeight: 740,
          background: 'radial-gradient(ellipse at top, #26292e 0%, #0d0f12 85%)',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={getSongCover(song)}
              alt=""
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>
                {song?.title || 'Unknown Track'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-subdued)' }}>
                {song?.artistName || 'Various Artists'} • Lossless Synced Vocal Lyrics
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {!isEditing && (
              <button
                className="btn btn-ghost btn-sm"
                style={{
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 9999,
                  fontSize: 12.5,
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={handleStartEdit}
                title="Add or Edit lyrics for this song"
              >
                <span>✏️</span>
                <span>Add / Edit Lyrics</span>
              </button>
            )}
            <button
              className="modal-close"
              onClick={onClose}
              style={{ fontSize: 20, color: '#ffffff', padding: 6, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Main Body: Synced Vocal View OR Edit Mode ── */}
        {isEditing ? (
          <div
            style={{
              padding: 24,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#121417',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1ed760' }}>
                ✍️ Edit Lyrics (LRC Format [mm:ss] or Plain Text)
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={insertMusicBreak}
                  style={{
                    background: '#23262b',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#ffffff',
                    borderRadius: 9999,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  title="Insert music emoji break at current song timestamp"
                >
                  + Add Music Break [🎵 🎶]
                </button>
                <button
                  type="button"
                  onClick={handleAutoAlign}
                  style={{
                    background: '#23262b',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#1ed760',
                    borderRadius: 9999,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                  title="Automatically align plain text lines with timestamps"
                >
                  ⚡ Auto-Sync Vocals
                </button>
              </div>
            </div>

            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Paste or write lyrics here... Example:&#10;[00:00] 🎵 🎶 (Intro Music) 🎶 🎵&#10;[00:15] First vocal line&#10;[00:20] Second vocal line"
              rows={16}
              style={{
                width: '100%',
                flex: 1,
                minHeight: 280,
                background: '#090a0c',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 12,
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: 13.5,
                lineHeight: 1.6,
                padding: 16,
                resize: 'none',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setIsEditing(false)}
                style={{ color: 'var(--text-subdued)' }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveLyrics}
                disabled={saving}
                style={{
                  background: '#1ed760',
                  color: '#000000',
                  fontWeight: 800,
                  borderRadius: 9999,
                  padding: '8px 20px',
                }}
              >
                {saving ? 'Saving...' : 'Save Lyrics 💚'}
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '40px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 26,
              alignItems: 'center',
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            {parsedLines.length === 0 ? (
              <div style={{ color: 'var(--text-subdued)', marginTop: 80 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🎵</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>No lyrics found yet</div>
                <p style={{ fontSize: 13, marginTop: 4 }}>Click "Add / Edit Lyrics" above to add time-synced lyrics!</p>
              </div>
            ) : (
              parsedLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                const isPast = idx < activeIndex;
                const isUpcoming = idx > activeIndex;

                return (
                  <div
                    key={`${line.time}-${idx}`}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => onSeek && onSeek(line.time)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.35s cubic-bezier(0.2, 0, 0, 1)',
                      fontSize: isActive ? (line.isMusic ? 28 : 26) : 19,
                      fontWeight: isActive ? 900 : 700,
                      color: isActive ? '#1ed760' : isPast ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.3)',
                      transform: isActive ? 'scale(1.06)' : 'scale(1)',
                      textShadow: isActive ? '0 0 24px rgba(30, 215, 96, 0.45)' : 'none',
                      padding: '4px 12px',
                      borderRadius: 10,
                      maxWidth: '92%',
                      lineHeight: 1.45,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      background: isActive ? 'rgba(30, 215, 96, 0.08)' : 'transparent',
                    }}
                    title={`Click to seek to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}`}
                  >
                    {line.isMusic ? (
                      <span
                        style={{
                          letterSpacing: '0.1em',
                          animation: isActive ? 'pulse 1.5s infinite ease-in-out' : 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        {line.text}
                      </span>
                    ) : (
                      <span>{line.text}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Footer bar info ── */}
        <div
          style={{
            padding: '12px 24px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-subdued)',
          }}
        >
          <span>🎵 Synced to vocal playback timing • Click any line to seek</span>
          <span>Patta Kelu Lossless Audio Engine</span>
        </div>
      </div>
    </div>
  );
}
