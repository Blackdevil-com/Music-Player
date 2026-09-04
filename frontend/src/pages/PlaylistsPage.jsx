import React, { useState, useMemo, useRef } from 'react';
import { playlistApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { getPlaylistCover, getSongCover, getSongDuration, SAMPLE_PLAYLIST_COVERS } from '../utils/mediaUtils';

// ── Create Playlist Modal ─────────────────────────────────────────────────────
function CreatePlaylistModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', createdBy: '', isPublic: true, coverUrl: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(SAMPLE_PLAYLIST_COVERS[0].url);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setForm((f) => ({ ...f, coverUrl: '' }));
    }
  };

  const handleSelectSampleCover = (sampleUrl) => {
    setCoverFile(null);
    setCoverPreview(sampleUrl);
    setForm((f) => ({ ...f, coverUrl: sampleUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await playlistApi.create(
        {
          name: form.name.trim(),
          description: form.description.trim() || null,
          createdBy: form.createdBy.trim() || 'Spotify User',
          isPublic: form.isPublic,
          coverUrl: form.coverUrl || null,
        },
        coverFile
      );
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="create-pl-title">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="create-pl-title">
            Create New Playlist
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Cover Art Preview & Upload */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'center' }}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 8,
                background: 'var(--spotify-elevated)',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
              }}
            >
              <img
                src={coverPreview}
                alt="Playlist cover preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" style={{ marginBottom: 4 }}>
                Playlist Artwork
              </label>
              <p style={{ fontSize: 11.5, color: 'var(--text-subdued)', marginBottom: 8 }}>
                Upload custom artwork or pick a sample cover below.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Choose Image File
              </button>
            </div>
          </div>

          {/* Quick Sample Covers Picker */}
          <div style={{ marginBottom: 16 }}>
            <label className="form-label" style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Or choose sample aesthetic cover
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, marginTop: 6 }}>
              {SAMPLE_PLAYLIST_COVERS.map((sample, sIdx) => (
                <div
                  key={sIdx}
                  onClick={() => handleSelectSampleCover(sample.url)}
                  title={sample.name}
                  style={{
                    height: 48,
                    borderRadius: 6,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: coverPreview === sample.url && !coverFile ? '2px solid #1ed760' : '1px solid rgba(255,255,255,0.1)',
                    transform: coverPreview === sample.url && !coverFile ? 'scale(1.05)' : 'none',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  <img
                    src={sample.url}
                    alt={sample.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pl-name">
              Playlist Name <span>*</span>
            </label>
            <input
              id="pl-name"
              name="name"
              className="form-input"
              placeholder="e.g. My Lossless Mix, Night Drives"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pl-desc">
              Description
            </label>
            <input
              id="pl-desc"
              name="description"
              className="form-input"
              placeholder="Add an optional description"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add Song to Playlist Modal ────────────────────────────────────────────────
function AddSongModal({ playlist, allSongs, onClose, onSave, showToast }) {
  const [adding, setAdding] = useState(null);
  const [search, setSearch] = useState('');

  const existingIds = new Set((playlist.songs || []).map((s) => s.id));
  const availableSongs = allSongs.filter(
    (s) =>
      !existingIds.has(s.id) &&
      (s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.artistName?.toLowerCase().includes(search.toLowerCase()) ||
        s.genre?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (song) => {
    setAdding(song.id);
    try {
      await playlistApi.addSong(playlist.id, song.id);
      showToast(`Added "${song.title}" to ${playlist.name}!`, 'success');
      onSave();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-song-pl-title">
      <div className="modal" style={{ maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-song-pl-title">
            Add to "{playlist.name}"
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="topbar-search-capsule" style={{ marginBottom: 16, width: '100%' }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="search"
            className="topbar-search-input"
            placeholder="Search songs in your library…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1, maxHeight: 320, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {availableSongs.length === 0 ? (
            <div className="table-empty" style={{ padding: '32px 0' }}>
              <div className="table-empty-icon">🎵</div>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>
                {search ? 'No matching tracks found.' : 'All library tracks are already in this playlist!'}
              </div>
            </div>
          ) : (
            availableSongs.map((song) => (
              <div
                key={song.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--spotify-elevated)',
                }}
              >
                <div className="track-cover-sm" style={{ overflow: 'hidden' }}>
                  <img
                    src={getSongCover(song)}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {song.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-subdued)' }}>
                    {song.artistName || 'Various Artists'}
                  </div>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAdd(song)}
                  disabled={adding === song.id}
                >
                  {adding === song.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '+ Add'}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Spotify Playlists Page (Main Export) ──────────────────────────────────────
export default function PlaylistsPage({
  playlists = [],
  allSongs = [],
  loading,
  onRefresh,
  showToast,
  nowPlayingId,
  onPlay,
  selectedPlaylistId,
  onSelectPlaylist,
}) {
  const { isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [showAddSong, setShowAddSong] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removeSongTarget, setRemoveSongTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const selectedPlaylist = useMemo(() => {
    if (!selectedPlaylistId) return null;
    return playlists.find((p) => p.id === selectedPlaylistId) || null;
  }, [playlists, selectedPlaylistId]);

  const handleDeletePlaylist = async () => {
    if (!deleteTarget) return;
    if (!isAdmin) {
      showToast('Permission denied: Regular users do not have authority to delete playlists.', 'error');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await playlistApi.delete(deleteTarget.id);
      showToast(`Deleted playlist "${deleteTarget.name}".`, 'info');
      setDeleteTarget(null);
      if (selectedPlaylistId === deleteTarget.id) {
        onSelectPlaylist(null);
      }
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveSong = async () => {
    if (!removeSongTarget || !selectedPlaylist) return;
    setRemoving(true);
    try {
      await playlistApi.removeSong(selectedPlaylist.id, removeSongTarget.id);
      showToast(`Removed "${removeSongTarget.title}" from playlist.`, 'info');
      setRemoveSongTarget(null);
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setRemoving(false);
    }
  };

  const handlePlayPlaylist = (shuffle = false) => {
    if (!selectedPlaylist || (selectedPlaylist.songs || []).length === 0) return;
    let list = [...selectedPlaylist.songs];
    if (shuffle) list.sort(() => Math.random() - 0.5);
    onPlay(list[0], list, `playlist-${selectedPlaylist.id}`);
  };

  return (
    <>
      {selectedPlaylist ? (
        /* ── 1. Spotify Grand Playlist Hero View ── */
        <div>
          {/* Back Button */}
          <div style={{ padding: '8px 0 16px 0' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onSelectPlaylist(null)}
              style={{ color: '#ffffff' }}
            >
              ‹ Back to Playlists
            </button>
          </div>

          {/* Grand Hero Banner */}
          <div className="hero-banner-grand" style={{ background: 'linear-gradient(180deg, #1e2126 0%, var(--spotify-panel) 100%)' }}>
            <div className="hero-banner-cover" style={{ background: '#1e2126', overflow: 'hidden' }}>
              <img
                src={getPlaylistCover(selectedPlaylist)}
                alt={selectedPlaylist.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="hero-banner-content">
              <span className="hero-type-label">Playlist</span>
              <h1 className="hero-grand-title" title={selectedPlaylist.name}>
                {selectedPlaylist.name}
              </h1>
              {selectedPlaylist.description && (
                <p className="hero-grand-desc">{selectedPlaylist.description}</p>
              )}
              <div className="hero-grand-meta">
                <span style={{ fontWeight: 800, color: 'var(--spotify-green)' }}>
                  {selectedPlaylist.createdBy || 'Spotify User'}
                </span>
                <span className="bullet">•</span>
                <span>{(selectedPlaylist.songs || []).length} songs</span>
                <span className="bullet">•</span>
                <span style={{ color: 'var(--text-muted)' }}>about 45 min</span>
              </div>
            </div>
          </div>

          {/* Spotify Action Bar */}
          <div className="hero-action-bar">
            <button
              className="giant-play-btn"
              onClick={() => handlePlayPlaylist(false)}
              disabled={(selectedPlaylist.songs || []).length === 0}
              title="Play playlist"
            >
              ▶
            </button>
            <button
              className="hero-icon-action"
              onClick={() => handlePlayPlaylist(true)}
              title="Shuffle playlist"
            >
              🔀
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAddSong(true)}
            >
              + Add Tracks
            </button>
            {isAdmin && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDeleteTarget(selectedPlaylist)}
                style={{ marginLeft: 'auto', color: '#f87171' }}
                title="Delete Playlist (Admin Only)"
              >
                🗑️ Delete Playlist
              </button>
            )}
          </div>

          {/* Tracklist Table */}
          <div className="tracklist-container">
            {(selectedPlaylist.songs || []).length === 0 ? (
              <div className="table-empty">
                <div className="table-empty-icon">📋</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                  Let's find something for your playlist
                </div>
                <p style={{ color: 'var(--text-subdued)', fontSize: 13, marginBottom: 16 }}>
                  Add tracks from your library to start listening.
                </p>
                <button className="btn btn-primary" onClick={() => setShowAddSong(true)}>
                  + Add Tracks
                </button>
              </div>
            ) : (
              <table className="spotify-table">
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>#</th>
                    <th>Title</th>
                    <th style={{ width: '25%' }}>Album</th>
                    <th style={{ width: '18%' }}>Genre</th>
                    <th style={{ width: 100, textAlign: 'right' }}>⏱️</th>
                    <th style={{ width: 60, textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPlaylist.songs || []).map((song, idx) => {
                    const isPlaying = song.id === nowPlayingId;
                    return (
                      <tr
                        key={song.id}
                        className={isPlaying ? 'active-playing' : ''}
                        onClick={() => onPlay(song, selectedPlaylist.songs, `playlist-${selectedPlaylist.id}`)}
                      >
                        <td className="track-num-col">
                          {isPlaying ? (
                            <span style={{ color: 'var(--spotify-green)' }}>🔊</span>
                          ) : (
                            <>
                              <span className="track-num-span">{idx + 1}</span>
                              <button
                                className="track-play-hover-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPlay(song, selectedPlaylist.songs, `playlist-${selectedPlaylist.id}`);
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
                                alt={song.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                              />
                            </div>
                            <div className="track-meta-wrap">
                              <span className="track-name-bold">{song.title}</span>
                              <span className="track-artist-sub">{song.artistName || 'Various Artists'}</span>
                            </div>
                          </div>
                        </td>

                        <td>{song.albumName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{song.genre ? <span className="pill-tag">{song.genre}</span> : '—'}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getSongDuration(song)}</td>

                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--text-muted)', padding: '4px 8px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveSongTarget(song);
                            }}
                            title="Remove from playlist"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ── 2. Spotify Playlists Hub Cards Grid View ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>Your Playlists</h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {playlists.length} custom playlist{playlists.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              + Create Playlist
            </button>
          </div>

          <div className="recent-cards-grid">
            {/* "+ Create Playlist" Card */}
            <div
              className="recent-square-card"
              style={{
                border: '2px dashed rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                minHeight: 190,
              }}
              onClick={() => setShowCreate(true)}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  color: 'var(--spotify-green)',
                  marginBottom: 10,
                }}
              >
                +
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>Create Playlist</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Add songs &amp; mix</div>
            </div>

            {/* Playlist Cards */}
            {playlists.map((pl) => {
              const songCount = pl.songs ? (Array.isArray(pl.songs) ? pl.songs.length : Object.keys(pl.songs).length) : 0;
              return (
                <div
                  key={pl.id}
                  className="recent-square-card"
                  onClick={() => onSelectPlaylist(pl.id)}
                >
                  <div className="recent-card-artwork" style={{ background: '#1e2126', overflow: 'hidden' }}>
                    <img
                      src={getPlaylistCover(pl)}
                      alt={pl.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      className="recent-card-play-hover"
                      onClick={(e) => {
                        e.stopPropagation();
                        if ((pl.songs || []).length > 0) {
                          onPlay(pl.songs[0], pl.songs, `playlist-${pl.id}`);
                        } else {
                          onSelectPlaylist(pl.id);
                        }
                      }}
                      title={`Play ${pl.name}`}
                    >
                      ▶
                    </button>
                  </div>
                  <div className="recent-card-title" title={pl.name}>
                    {pl.name}
                  </div>
                  <div className="recent-card-sub">
                    By {pl.createdBy || 'User'} • {songCount} song{songCount !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCreate && (
        <CreatePlaylistModal
          onClose={() => setShowCreate(false)}
          onSave={() => {
            setShowCreate(false);
            showToast('Playlist created!', 'success');
            onRefresh();
          }}
        />
      )}

      {showAddSong && selectedPlaylist && (
        <AddSongModal
          playlist={selectedPlaylist}
          allSongs={allSongs}
          onClose={() => setShowAddSong(false)}
          onSave={() => {
            setShowAddSong(false);
            onRefresh();
          }}
          showToast={showToast}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Playlist"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={handleDeletePlaylist}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {removeSongTarget && (
        <ConfirmDialog
          title="Remove from Playlist"
          message={`Remove "${removeSongTarget.title}" from this playlist?`}
          onConfirm={handleRemoveSong}
          onCancel={() => setRemoveSongTarget(null)}
          loading={removing}
        />
      )}
    </>
  );
}
