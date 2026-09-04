import React, { useState } from 'react';
import { artistApi } from '../api/musicApi';
import { getArtistImage, getSongCover, getSongDuration } from '../utils/mediaUtils';

// ── Add Artist Modal with Picture Upload ─────────────────────────────────────
function AddArtistModal({ onClose, onSave }) {
  const [artistName, setArtistName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setImagePreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistName.trim()) return;
    setLoading(true);
    try {
      await artistApi.create({ artistName: artistName.trim() }, imageFile);
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-ar-title">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-ar-title">
            Add Artist
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="artist-name-in">
              Artist Name <span>*</span>
            </label>
            <input
              id="artist-name-in"
              className="form-input"
              placeholder="e.g. Anirudh, Dhanush, The Weeknd"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Artist Profile Photo (Optional)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--spotify-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#121418',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--text-subdued)">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {imageFile ? imageFile.name : 'Upload portrait / avatar'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-subdued)', marginTop: 2 }}>
                  PNG, JPG, WEBP • Circular avatar
                </div>
              </div>
              <label
                className="btn btn-secondary btn-sm"
                htmlFor="artist-image-input"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                {imageFile ? 'Change' : 'Browse'}
              </label>
              <input
                id="artist-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Artist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Spotify Artists Page (Main Export) ────────────────────────────────────────
export default function ArtistsPage({
  artists = [],
  songs = [],
  loading,
  onRefresh,
  showToast,
  nowPlayingId,
  onPlay,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  const artistTracks = selectedArtist
    ? songs.filter((s) => s.artistName?.toLowerCase() === selectedArtist.artistName?.toLowerCase())
    : [];

  return (
    <>
      {selectedArtist ? (
        /* ── 1. Spotify Verified Artist Hero Detail View ── */
        <div>
          <div style={{ padding: '8px 0 16px 0' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedArtist(null)}
              style={{ color: '#ffffff' }}
            >
              ‹ Back to Artists
            </button>
          </div>

          <div className="hero-banner-grand" style={{ background: 'linear-gradient(180deg, #1e2126 0%, var(--spotify-panel) 100%)' }}>
            <div className="hero-banner-cover circle" style={{ background: 'var(--spotify-elevated)', border: '2px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <img
                src={getArtistImage(selectedArtist)}
                alt={selectedArtist.artistName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </div>
            <div className="hero-banner-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16, color: '#1ed760' }}>✓</span>
                <span className="hero-type-label">Verified Artist</span>
              </div>
              <h1 className="hero-grand-title">{selectedArtist.artistName}</h1>
              <div className="hero-grand-meta">
                <span>1,492,028 monthly listeners</span>
              </div>
            </div>
          </div>

          <div className="hero-action-bar">
            <button
              className="giant-play-btn"
              onClick={() => {
                if (artistTracks.length > 0) onPlay(artistTracks[0], artistTracks);
              }}
              disabled={artistTracks.length === 0}
              title="Play Artist"
            >
              ▶
            </button>
            <button className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-pill)' }}>
              Follow
            </button>
          </div>

          <div className="tracklist-container">
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 16 }}>
              Popular Tracks
            </h2>

            {artistTracks.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">🎤</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>
                  No tracks linked to this artist yet.
                </div>
              </div>
            ) : (
              <table className="spotify-table">
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>#</th>
                    <th>Title</th>
                    <th style={{ width: '25%' }}>Album</th>
                    <th style={{ width: '20%' }}>Genre</th>
                    <th style={{ width: 100, textAlign: 'right' }}>⏱️</th>
                  </tr>
                </thead>
                <tbody>
                  {artistTracks.map((song, idx) => {
                    const isPlaying = song.id === nowPlayingId;
                    return (
                      <tr
                        key={song.id}
                        className={isPlaying ? 'active-playing' : ''}
                        onClick={() => onPlay(song, artistTracks)}
                      >
                        <td className="track-num-col">
                          {isPlaying ? (
                            <span style={{ color: 'var(--spotify-green)' }}>▶</span>
                          ) : (
                            <>
                              <span className="track-num-span">{idx + 1}</span>
                              <button
                                className="track-play-hover-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPlay(song, artistTracks);
                                }}
                              >
                                ▶
                              </button>
                            </>
                          )}
                        </td>
                        <td>
                          <div className="track-title-cell">
                            <div className="track-cover-sm" style={{ overflow: 'hidden' }}>
                              <img
                                src={getSongCover(song)}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                              />
                            </div>
                            <span className="track-name-bold">{song.title}</span>
                          </div>
                        </td>
                        <td>{song.albumName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{song.genre ? <span className="pill-tag">{song.genre}</span> : '—'}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getSongDuration(song)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ── 2. Spotify Artists Hub Cards Grid ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Artists</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {artists.length} artist{artists.length !== 1 ? 's' : ''} in your library
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + Add Artist
            </button>
          </div>

          <div className="recent-cards-grid">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="recent-square-card"
                onClick={() => setSelectedArtist(artist)}
              >
                <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
                  <div className="recent-card-artwork" style={{ borderRadius: '50%', background: '#1e2126', overflow: 'hidden', margin: 0 }}>
                    <img
                      src={getArtistImage(artist)}
                      alt={artist.artistName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <button
                    className="recent-card-play-hover"
                    onClick={(e) => {
                      e.stopPropagation();
                      const tracks = songs.filter((s) => s.artistName === artist.artistName);
                      if (tracks.length > 0) onPlay(tracks[0], tracks);
                      else setSelectedArtist(artist);
                    }}
                    title={`Play ${artist.artistName}`}
                  >
                    ▶
                  </button>
                </div>
                <div className="recent-card-title" title={artist.artistName} style={{ textAlign: 'center' }}>
                  {artist.artistName}
                </div>
                <div className="recent-card-sub" style={{ textAlign: 'center' }}>
                  Artist • Verified
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddArtistModal
          onClose={() => setShowAdd(false)}
          onSave={() => {
            setShowAdd(false);
            showToast('Artist saved!', 'success');
            onRefresh();
          }}
        />
      )}
    </>
  );
}
