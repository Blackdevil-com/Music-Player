import React from 'react';

/**
 * Sidebar navigation
 * @param {string} activeTab - current active tab key
 * @param {function} onNav - navigation handler
 * @param {object} counts - badge counts { songs, albums, artists }
 */
export default function Sidebar({ activeTab, onNav, counts }) {
  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'songs',     icon: '🎵', label: 'Songs',   badge: counts?.songs },
    { key: 'albums',    icon: '💿', label: 'Albums',  badge: counts?.albums },
    { key: 'artists',   icon: '🎤', label: 'Artists', badge: counts?.artists },
  ];

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon" aria-hidden="true">🎶</div>
        <span className="logo-text">MusicDB</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu</div>
        {navItems.map(({ key, icon, label, badge }) => (
          <button
            key={key}
            id={`nav-${key}`}
            className={`nav-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => onNav(key)}
            aria-current={activeTab === key ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{icon}</span>
            {label}
            {badge != null && badge > 0 && (
              <span className="nav-badge">{badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Backend</div>
          <div>localhost:8081</div>
          <div>Spring Boot v4.1</div>
        </div>
      </div>
    </aside>
  );
}
