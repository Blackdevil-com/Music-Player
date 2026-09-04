import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Spotify Top Navigation Bar
 * 1:1 match to media_1788546109465.png:
 * - Search Capsule: [ 🔍 What do you want to listen to? ]
 * - Notification Bell
 * - User Profile Capsule: [ 👤 username ▼ ]
 * - Settings Gear
 */
export default function TopBar({
  activeTab,
  onNav,
  searchQuery,
  onSearchChange,
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || 'ianlaragordo';

  return (
    <header className="spotify-topbar" role="banner">
      {/* ── Search Pill Capsule ── */}
      <div className="topbar-search-capsule">
        <span className="search-icon-span">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </span>
        <input
          type="search"
          className="topbar-search-input"
          placeholder="What do you want to listen to?"
          value={searchQuery || ''}
          onChange={(e) => {
            if (activeTab !== 'songs') onNav('songs');
            onSearchChange(e.target.value);
          }}
          onFocus={() => {
            if (activeTab !== 'songs') onNav('songs');
          }}
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Right Actions: Bell, User Profile Pill, Settings Gear ── */}
      <div className="topbar-actions-right">
          {/* Notification Bell */}
        <button
          className="topbar-circle-btn"
          title="What's New"
          onClick={() => alert("You're all caught up with latest Patta Kelu releases.")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
        </button>

        {/* User Profile Pill Capsule */}
        <div className="topbar-profile-container" ref={menuRef}>
          <button
            className="topbar-user-pill"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
          >
            <div className="user-avatar-sm">
              <span style={{ fontSize: 13, fontWeight: 900 }}>👤</span>
            </div>
            <span className="user-pill-name">{displayName}</span>
            <span className="user-pill-arrow">▼</span>
          </button>

          {/* Profile Dropdown Menu */}
          {menuOpen && (
            <div className="topbar-dropdown-menu">
              <div className="dropdown-user-header">
                <div className="dropdown-user-name">{displayName}</div>
                <div className="dropdown-user-sub">{user?.role === 'ADMIN' ? 'Admin Account' : 'Standard User Account'}</div>
              </div>

              <button
                className="dropdown-menu-item"
                onClick={() => {
                  onNav('dashboard');
                  setMenuOpen(false);
                }}
              >
                Home
              </button>

              <button
                className="dropdown-menu-item"
                onClick={() => {
                  onNav('liked');
                  setMenuOpen(false);
                }}
              >
                Liked Songs
              </button>

              <div className="dropdown-divider" />

              <button
                className="dropdown-menu-item logout-item"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>

        {/* Settings Gear */}
        <button
          className="topbar-circle-btn"
          title="Settings"
          onClick={() => alert('Patta Kelu Audio Quality: Very High (Lossless 320kbps).')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
