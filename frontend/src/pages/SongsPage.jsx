import React, { useState, useEffect } from 'react';
import { songApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Add/Edit Song Modal ──────────────────────────────────────────────────────
function SongModal({ mode, initialData, artists, albums, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', artistId: '', albumId: '', genre: '', filePath: '',
    ...(initialData || {}),
  });
  const [file, setFile] = useState(null);
  const [useFile, setUseFile] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const dto = {
        title: form.title,
        artistId: form.artistId ? Number(form.artistId) : null,
        albumId: form.albumId ? Number(form.albumId) : null,
        genre: form.genre || null,
        filePath: form.filePath || null,
      };
      if (useFile && file) {
        await songApi.createWithFile(dto, file);
      } else {
        await songApi.create(dto);
      }
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
            <span>🎵</span> {mode === 'add' ? 'Add New Song' : 'Edit Song'}
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

          {/* Toggle: JSON vs File upload */}
          <div className="form-group">
            <div className="tabs" style={{ marginBottom: 12 }}>
              <button type="button" className={`tab-btn ${!useFile ? 'active' : ''}`} onClick={() => setUseFile(false)} id="tab-filepath">
                File Path
              </button>
              <button type="button" className={`tab-btn ${useFile ? 'active' : ''}`} onClick={() => setUseFile(true)} id="tab-upload">
                Upload File
              </button>
            </div>

            {!useFile ? (
              <>
                <label className="form-label" htmlFor="song-filepath">File Path</label>
                <input
                  id="song-filepath"
                  name="filePath"
                  className="form-input"
                  placeholder="e.g. storage/songs/track.mp3"
                  value={form.filePath}
                  onChange={handleChange}
                />
              </>
            ) : (
              <label className="file-upload-area" htmlFor="song-file-input">
                <div className="file-upload-icon">🎧</div>
                <div className="file-upload-text">
                  <strong>Click to browse</strong> or drag & drop
                </div>
                <div className="file-upload-text" style={{ fontSize: 11, marginTop: 4 }}>
                  MP3, WAV, FLAC, OGG (max 50 MB)
                </div>
                {file && <div className="file-selected">✓ {file.name}</div>}
                <input
                  id="song-file-input"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="song-modal-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="song-modal-save">
              {loading ? <span className="spinner" /> : '🎵'}
              {mode === 'add' ? 'Add Song' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Songs Page ───────────────────────────────────────────────────────────────
export default function SongsPage({ songs, artists, albums, loading, onRefresh, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = songs.filter((s) =>
    [s.title, s.artistName, s.albumName, s.genre]
      .some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaved = () => {
    setShowAdd(false);
    showToast('Song added successfully!', 'success');
    onRefresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await songApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Song deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

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

      <div className="page-body">
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
                  filtered.map((song, idx) => (
                    <tr key={song.id} id={`song-row-${song.id}`}>
                      <td style={{ color: 'var(--text-muted)', width: 48 }}>{idx + 1}</td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar avatar-purple" aria-hidden="true">
                            {song.title?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{song.title}</div>
                            {song.filePath && (
                              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                📁 {song.filePath.split('/').pop()}
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
                          <button
                            id={`delete-song-${song.id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(song)}
                            title={`Delete "${song.title}"`}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <SongModal
          mode="add"
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
