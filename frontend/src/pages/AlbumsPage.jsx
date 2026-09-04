import React, { useState } from 'react';
import { albumApi } from '../api/musicApi';
import { getAlbumCover, getSongCover, getSongDuration } from '../utils/mediaUtils';

// ── Add Album Modal with Cover Upload ─────────────────────────────────────────
function AddAlbumModal({ onClose, onSave }) {
  const [albumName, setAlbumName] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    setLoading(true);
    try {
      await albumApi.create({ albumName: albumName.trim() }, coverFile);
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-al-title">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-al-title">
            Add Album
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="album-name-in">
              Album Name <span>*</span>
            </label>
            <input
              id="album-name-in"
              className="form-input"
              placeholder="e.g. Starboy, After Hours"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Album Cover Artwork (Optional)
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
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#121418',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--text-subdued)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {coverFile ? coverFile.name : 'Upload album cover art'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-subdued)', marginTop: 2 }}>
                  Square Image Recommended
                </div>
              </div>
              <label
                className="btn btn-secondary btn-sm"
                htmlFor="album-cover-input"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                {coverFile ? 'Change' : 'Browse'}
              </label>
              <input
                id="album-cover-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Save Album'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Spotify Albums Page (Main Export) ─────────────────────────────────────────
export default function AlbumsPage({
  albums = [],
  songs = [],
  loading,
  onRefresh,
  showToast,
  nowPlayingId,
  onPlay,
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const albumTracks = selectedAlbum
    ? songs.filter((s) => s.albumName?.toLowerCase() === selectedAlbum.albumName?.toLowerCase())
    : [];

  return (
    <>
      {selectedAlbum ? (
        /* ── 1. Spotify Album Hero Detail View ── */
        <div>
          <div style={{ padding: '8px 0 16px 0' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedAlbum(null)}
              style={{ color: '#ffffff' }}
            >
              ‹ Back to Albums
            </button>
          </div>

          <div className="hero-banner-grand" style={{ background: 'linear-gradient(180deg, #1e2126 0%, var(--spotify-panel) 100%)' }}>
            <div className="hero-banner-cover" style={{ background: '#1e2126', overflow: 'hidden' }}>
              <img
                src={getAlbumCover(selectedAlbum)}
                alt={selectedAlbum.albumName}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
              />
            </div>
            <div className="hero-banner-content">
              <span className="hero-type-label">Album</span>
              <h1 className="hero-grand-title">{selectedAlbum.albumName}</h1>
              <div className="hero-grand-meta">
                <span style={{ fontWeight: 800, color: 'var(--spotify-green)' }}>
                  Studio Master
                </span>
                <span className="bullet">•</span>
                <span>2024</span>
                <span className="bullet">•</span>
                <span>{albumTracks.length} songs</span>
              </div>
            </div>
          </div>

          <div className="hero-action-bar">
            <button
              className="giant-play-btn"
              onClick={() => {
                if (albumTracks.length > 0) onPlay(albumTracks[0], albumTracks);
              }}
              disabled={albumTracks.length === 0}
              title="Play Album"
            >
              ▶
            </button>
            <button
              className="hero-icon-action"
              onClick={() => {
                if (albumTracks.length > 0) {
                  const shuffled = [...albumTracks].sort(() => Math.random() - 0.5);
                  onPlay(shuffled[0], shuffled);
                }
              }}
              title="Shuffle Album"
            >
              🔀
            </button>
          </div>

          <div className="tracklist-container">
            {albumTracks.length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">💿</div>
                <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                  No tracks assigned to this album yet.
                </div>
              </div>
            ) : (
              <table className="spotify-table">
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>#</th>
                    <th>Title</th>
                    <th style={{ width: '25%' }}>Artist</th>
                    <th style={{ width: '20%' }}>Genre</th>
                    <th style={{ width: 100, textAlign: 'right' }}>⏱️</th>
                  </tr>
                </thead>
                <tbody>
                  {albumTracks.map((song, idx) => {
                    const isPlaying = song.id === nowPlayingId;
                    return (
                      <tr
                        key={song.id}
                        className={isPlaying ? 'active-playing' : ''}
                        onClick={() => onPlay(song, albumTracks)}
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
                                  onPlay(song, albumTracks);
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
                        <td>{song.artistName || 'Various Artists'}</td>
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
        /* ── 2. Spotify Albums Hub Cards Grid ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Albums</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {albums.length} album{albums.length !== 1 ? 's' : ''} in your collection
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              + Add Album
            </button>
          </div>

          <div className="recent-cards-grid">
            {albums.map((album) => (
              <div
                key={album.id}
                className="recent-square-card"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="recent-card-artwork" style={{ background: '#1e2126', overflow: 'hidden' }}>
                  <img
                    src={getAlbumCover(album)}
                    alt={album.albumName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                  />
                  <button
                    className="recent-card-play-hover"
                    onClick={(e) => {
                      e.stopPropagation();
                      const tracks = songs.filter((s) => s.albumName === album.albumName);
                      if (tracks.length > 0) onPlay(tracks[0], tracks);
                      else setSelectedAlbum(album);
                    }}
                    title={`Play ${album.albumName}`}
                  >
                    ▶
                  </button>
                </div>
                <div className="recent-card-title" title={album.albumName}>
                  {album.albumName}
                </div>
                <div className="recent-card-sub">
                  Album • Studio Edition
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAdd && (
        <AddAlbumModal
          onClose={() => setShowAdd(false)}
          onSave={() => {
            setShowAdd(false);
            showToast('Album created!', 'success');
            onRefresh();
          }}
        />
      )}
    </>
  );
}
