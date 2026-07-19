import React, { useState } from 'react';
import { songApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';
import AudioPlayer from '../components/AudioPlayer';

// ── Add Song Modal ────────────────────────────────────────────────────────────
function SongModal({ artists, albums, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', artistId: '', albumId: '', genre: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!file) { alert('Please select an audio file to upload.'); return; }
    setLoading(true);
    try {
      const dto = {
        title: form.title,
        artistId: form.artistId ? Number(form.artistId) : null,
        albumId: form.albumId ? Number(form.albumId) : null,
        genre: form.genre || null,
      };
      await songApi.createWithFile(dto, file);
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="song-modal-title">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title" id="song-modal-title">
            <span>🎵</span> Add New Song
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="song-title">Song Title <span>*</span></label>
            <input
              id="song-title"
              name="title"
              className="form-input"
              placeholder="e.g. Bohemian Rhapsody"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="song-artist">Artist</label>
              <select id="song-artist" name="artistId" className="form-select" value={form.artistId} onChange={handleChange}>
                <option value="">— None —</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>{a.artistName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="song-album">Album</label>
              <select id="song-album" name="albumId" className="form-select" value={form.albumId} onChange={handleChange}>
                <option value="">— None —</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>{a.albumName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="song-genre">Genre</label>
            <input
              id="song-genre"
              name="genre"
              className="form-input"
              placeholder="e.g. Pop, Rock, Jazz…"
              value={form.genre}
              onChange={handleChange}
            />
          </div>

          {/* File upload — required by backend POST /api/v1/songs (multipart) */}
          <div className="form-group">
            <label className="form-label">Audio File <span>*</span></label>
            <label className="file-upload-area" htmlFor="song-file-input">
              <div className="file-upload-icon">🎧</div>
              <div className="file-upload-text">
                <strong>Click to browse</strong> or drag &amp; drop
              </div>
              <div className="file-upload-text" style={{ fontSize: 11, marginTop: 4 }}>
                MP3, WAV, FLAC (max 50 MB)
              </div>
              {file && <div className="file-selected">✓ {file.name}</div>}
              <input
                id="song-file-input"
                type="file"
                accept=".mp3,.wav,.flac,audio/*"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="song-modal-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="song-modal-save">
              {loading ? <span className="spinner" /> : '🎵'}
              Add Song
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Songs Page ────────────────────────────────────────────────────────────────
export default function SongsPage({ songs, artists, albums, loading, onRefresh, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  // ── Streaming / playback state ────────────────────────────────────────────
  const [nowPlaying, setNowPlaying] = useState(null); // song object currently loaded
  const [playingId, setPlayingId]   = useState(null); // id of song in player

  const filtered = songs.filter((s) =>
    [s.title, s.artistName, s.albumName, s.genre]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaved = () => {
    setShowAdd(false);
    showToast('Song added successfully!', 'success');
    onRefresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await songApi.delete(deleteTarget.id);
      // if deleted song was playing, close player
      if (playingId === deleteTarget.id) {
        setNowPlaying(null);
        setPlayingId(null);
      }
      setDeleteTarget(null);
      showToast('Song deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handlePlay = (song) => {
    setNowPlaying(song);
    setPlayingId(song.id);
  };

  const handlePlayerClose = () => {
    setNowPlaying(null);
    setPlayingId(null);
  };

  // Navigate prev/next within the filtered list
  const currentIdx = filtered.findIndex((s) => s.id === playingId);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < filtered.length - 1;

  const handlePrev = () => {
    if (hasPrev) handlePlay(filtered[currentIdx - 1]);
  };
  const handleNext = () => {
    if (hasNext) handlePlay(filtered[currentIdx + 1]);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const genreBadgeClass = (genre) => {
    const map = { Pop: 'cyan', Rock: 'pink', Jazz: 'orange', Classical: 'purple', 'Hip-Hop': 'green' };
    return `badge badge-${map[genre] || 'purple'}`;
  };

  const formatDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">🎵 Songs</h1>
            <p className="page-subtitle">{songs.length} song{songs.length !== 1 ? 's' : ''} in library</p>
          </div>
          <button id="add-song-btn" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Add Song
          </button>
        </div>
      </div>

      {/* Add bottom padding when player is visible */}
      <div className="page-body" style={{ paddingBottom: nowPlaying ? 100 : undefined }}>
        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="songs-search"
                type="search"
                className="search-input"
                placeholder="Search songs, artists, genres…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" style={{ width: 36, height: 36 }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading songs…</span>
            </div>
          ) : (
            <table aria-label="Songs table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th>Genre</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="table-empty">
                        <div className="table-empty-icon">🎵</div>
                        <div className="table-empty-text">
                          {search ? 'No songs match your search.' : 'No songs yet. Add your first song!'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((song, idx) => {
                    const isThisPlaying = song.id === playingId;
                    return (
                      <tr key={song.id} id={`song-row-${song.id}`} className={isThisPlaying ? 'is-playing' : ''}>
                        <td style={{ color: 'var(--text-muted)', width: 48 }}>
                          {isThisPlaying
                            ? <span style={{ color: 'var(--accent-purple-light)' }}>♪</span>
                            : idx + 1
                          }
                        </td>
                        <td>
                          <div className="entity-cell">
                            <div className="avatar avatar-purple" aria-hidden="true">
                              {song.title?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{song.title}</div>
                              {song.filePath && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  📁 {song.filePath.split(/[\\/]/).pop()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{song.artistName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>{song.albumName  || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>
                          {song.genre
                            ? <span className={genreBadgeClass(song.genre)}>{song.genre}</span>
                            : <span style={{ color: 'var(--text-muted)' }}>—</span>
                          }
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{formatDate(song.createAt)}</td>
                        <td>
                          <div className="actions-cell">
                            {/* ▶ Stream button — only shows if song has a file */}
                            <button
                              id={`play-song-${song.id}`}
                              className={`btn btn-play btn-sm ${isThisPlaying ? 'is-playing' : ''}`}
                              onClick={() => handlePlay(song)}
                              title={isThisPlaying ? `Now playing: ${song.title}` : `Stream "${song.title}"`}
                            >
                              {isThisPlaying ? '♪ Playing' : '▶ Play'}
                            </button>
                            <button
                              id={`delete-song-${song.id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteTarget(song)}
                              title={`Delete "${song.title}"`}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Audio Player bar ──────────────────────────────────────────────── */}
      {nowPlaying && (
        <AudioPlayer
          song={nowPlaying}
          streamUrl={songApi.getStreamUrl(nowPlaying.id)}
          onClose={handlePlayerClose}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}

      {showAdd && (
        <SongModal
          artists={artists}
          albums={albums}
          onClose={() => setShowAdd(false)}
          onSave={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Song"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
