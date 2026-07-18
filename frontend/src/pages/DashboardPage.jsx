import React from 'react';

/**
 * Dashboard overview page — stat cards + quick-view top songs/artists
 */
export default function DashboardPage({ songs, albums, artists, loading, onNav }) {
  const recentSongs = [...songs]
    .sort((a, b) => new Date(b.createAt || 0) - new Date(a.createAt || 0))
    .slice(0, 5);

  const formatDate = (dt) =>
    dt
      ? new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

  const stats = [
    { label: 'Total Songs',   value: songs.length,   icon: '🎵', color: 'purple' },
    { label: 'Total Albums',  value: albums.length,  icon: '💿', color: 'pink' },
    { label: 'Total Artists', value: artists.length, icon: '🎤', color: 'cyan' },
    {
      label: 'Genres',
      value: [...new Set(songs.map((s) => s.genre).filter(Boolean))].length,
      icon: '🎼',
      color: 'green',
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1 className="page-title">🏠 Dashboard</h1>
            <p className="page-subtitle">Overview of your music library</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button id="dash-goto-songs" className="btn btn-secondary btn-sm" onClick={() => onNav('songs')}>
              🎵 Manage Songs
            </button>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map(({ label, value, icon, color }) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon-wrap ${color}`} aria-hidden="true">{icon}</div>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">
                  {loading ? <span className="spinner" style={{ width: 20, height: 20 }} /> : value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Songs */}
        <div className="section-header">
          <h2 className="section-title">🕒 Recently Added Songs</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('songs')} id="dash-view-all-songs">
            View All →
          </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" style={{ width: 36, height: 36 }} />
            </div>
          ) : recentSongs.length === 0 ? (
            <div className="table-empty" style={{ padding: '40px 16px' }}>
              <div className="table-empty-icon">🎵</div>
              <div className="table-empty-text">No songs yet.</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 16 }}
                onClick={() => onNav('songs')}
                id="dash-add-first-song"
              >
                + Add Your First Song
              </button>
            </div>
          ) : (
            <table aria-label="Recent songs">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                  <th>Genre</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {recentSongs.map((song) => (
                  <tr key={song.id}>
                    <td>
                      <div className="entity-cell">
                        <div className="avatar avatar-purple" aria-hidden="true">
                          {song.title?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontWeight: 600 }}>{song.title}</span>
                      </div>
                    </td>
                    <td>{song.artistName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{song.albumName  || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {song.genre
                        ? <span className="badge badge-purple">{song.genre}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(song.createAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Stats Row */}
        {!loading && (albums.length > 0 || artists.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            {/* Top Albums */}
            <div className="table-wrapper" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>💿 Albums</span>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav('albums')} id="dash-view-albums">View All</button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {albums.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(124,58,237,0.06)' }}>
                    <div className="avatar avatar-pink" style={{ width: 28, height: 28, fontSize: 12 }}>{a.albumName?.[0]?.toUpperCase()}</div>
                    <span style={{ fontSize: 13 }}>{a.albumName}</span>
                    <span className="badge badge-pink" style={{ marginLeft: 'auto' }}>#{a.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists */}
            <div className="table-wrapper" style={{ padding: 0 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎤 Artists</span>
                <button className="btn btn-ghost btn-sm" onClick={() => onNav('artists')} id="dash-view-artists">View All</button>
              </div>
              <div style={{ padding: '8px 0' }}>
                {artists.slice(0, 5).map((a) => (
                  <div key={a.id} style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(124,58,237,0.06)' }}>
                    <div className="avatar avatar-cyan" style={{ width: 28, height: 28, fontSize: 12 }}>{a.artistName?.[0]?.toUpperCase()}</div>
                    <span style={{ fontSize: 13 }}>{a.artistName}</span>
                    <span className="badge badge-cyan" style={{ marginLeft: 'auto' }}>#{a.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
