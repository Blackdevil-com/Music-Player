import React, { useState } from 'react';
import { albumApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Add Album Modal ──────────────────────────────────────────────────────────
function AddAlbumModal({ onClose, onSave }) {
  const [albumName, setAlbumName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    setLoading(true);
    try {
      await albumApi.create({ albumName: albumName.trim() });
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-album-title">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-album-title"><span>💿</span> Add New Album</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="album-name-input">Album Name <span>*</span></label>
            <input
              id="album-name-input"
              className="form-input"
              placeholder="e.g. Dark Side of the Moon"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="add-album-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="add-album-save">
              {loading ? <span className="spinner" /> : '💿'}
              Add Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Album Modal ─────────────────────────────────────────────────────────
function EditAlbumModal({ album, onClose, onSave }) {
  const [albumName, setAlbumName] = useState(album.albumName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!albumName.trim()) return;
    setLoading(true);
    try {
      await albumApi.update(album.id, { albumName: albumName.trim() });
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-album-title">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="edit-album-title"><span>✏️</span> Edit Album</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-album-name">Album Name <span>*</span></label>
            <input
              id="edit-album-name"
              className="form-input"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="edit-album-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="edit-album-save">
              {loading ? <span className="spinner" /> : '✔️'}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Albums Page ──────────────────────────────────────────────────────────────
export default function AlbumsPage({ albums, loading, onRefresh, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = albums.filter((a) =>
    a.albumName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdded = () => {
    setShowAdd(false);
    showToast('Album added!', 'success');
    onRefresh();
  };

  const handleUpdated = () => {
    setEditTarget(null);
    showToast('Album updated!', 'success');
    onRefresh();
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">💿 Albums</h1>
            <p className="page-subtitle">{albums.length} album{albums.length !== 1 ? 's' : ''} in library</p>
          </div>
          <button id="add-album-btn" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Add Album
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="albums-search"
                type="search"
                className="search-input"
                placeholder="Search albums…"
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
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading albums…</span>
            </div>
          ) : (
            <table aria-label="Albums table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Album Name</th>
                  <th>Album ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-empty">
                        <div className="table-empty-icon">💿</div>
                        <div className="table-empty-text">
                          {search ? 'No albums match your search.' : 'No albums yet. Add your first album!'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((album, idx) => (
                    <tr key={album.id} id={`album-row-${album.id}`}>
                      <td style={{ color: 'var(--text-muted)', width: 48 }}>{idx + 1}</td>
                      <td>
                        <div className="entity-cell">
                          <div className="avatar avatar-pink" aria-hidden="true">
                            {album.albumName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{album.albumName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-purple">#{album.id}</span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            id={`edit-album-${album.id}`}
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditTarget(album)}
                            title={`Edit "${album.albumName}"`}
                          >
                            ✏️ Edit
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
        <AddAlbumModal onClose={() => setShowAdd(false)} onSave={handleAdded} />
      )}

      {editTarget && (
        <EditAlbumModal
          album={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdated}
        />
      )}
    </>
  );
}
