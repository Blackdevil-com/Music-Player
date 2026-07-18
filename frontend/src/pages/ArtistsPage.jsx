import React, { useState } from 'react';
import { artistApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';

// ── Add Artist Modal ─────────────────────────────────────────────────────────
function AddArtistModal({ onClose, onSave }) {
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!artistName.trim()) return;
    setLoading(true);
    try {
      await artistApi.create({ artistName: artistName.trim() });
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-artist-title">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-artist-title"><span>🎤</span> Add New Artist</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="artist-name-input">Artist Name <span>*</span></label>
            <input
              id="artist-name-input"
              className="form-input"
              placeholder="e.g. Freddie Mercury"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="add-artist-cancel">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="add-artist-save">
              {loading ? <span className="spinner" /> : '🎤'}
              Add Artist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Artists Page ─────────────────────────────────────────────────────────────
export default function ArtistsPage({ artists, loading, onRefresh, showToast }) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = artists.filter((a) =>
    a.artistName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdded = () => {
    setShowAdd(false);
    showToast('Artist added!', 'success');
    onRefresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await artistApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Artist deleted.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Generate a color variant for avatar based on id
  const avatarColor = (id) => {
    const colors = ['avatar-purple', 'avatar-pink', 'avatar-cyan'];
    return colors[id % colors.length];
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">🎤 Artists</h1>
            <p className="page-subtitle">{artists.length} artist{artists.length !== 1 ? 's' : ''} in library</p>
          </div>
          <button id="add-artist-btn" className="btn btn-primary" onClick={() => setShowAdd(true)}>
            + Add Artist
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="table-wrapper">
          <div className="table-toolbar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="artists-search"
                type="search"
                className="search-input"
                placeholder="Search artists…"
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
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading artists…</span>
            </div>
          ) : (
            <table aria-label="Artists table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Artist Name</th>
                  <th>Artist ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="table-empty">
                        <div className="table-empty-icon">🎤</div>
                        <div className="table-empty-text">
                          {search ? 'No artists match your search.' : 'No artists yet. Add your first artist!'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((artist, idx) => (
                    <tr key={artist.id} id={`artist-row-${artist.id}`}>
                      <td style={{ color: 'var(--text-muted)', width: 48 }}>{idx + 1}</td>
                      <td>
                        <div className="entity-cell">
                          <div className={`avatar ${avatarColor(artist.id)}`} aria-hidden="true">
                            {artist.artistName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontWeight: 600 }}>{artist.artistName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-cyan">#{artist.id}</span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            id={`delete-artist-${artist.id}`}
                            className="btn btn-danger btn-sm"
                            onClick={() => setDeleteTarget(artist)}
                            title={`Delete "${artist.artistName}"`}
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
        <AddArtistModal onClose={() => setShowAdd(false)} onSave={handleAdded} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Artist"
          message={`Are you sure you want to delete "${deleteTarget.artistName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}
