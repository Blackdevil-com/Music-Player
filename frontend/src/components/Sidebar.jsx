import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPlaylistCover, getArtistImage, getAlbumCover } from '../utils/mediaUtils';

/**
 * Spotify Desktop Left Navigation Sidebar
 * 1:1 match to media_1788549186221.png:
 * - Top card: Patta Kelu logo + brand name, Home, Search
 * - Bottom card: "Your Library" with pills (Playlists, Podcasts & Shows, Albums, Artists),
 *   search & sort ("Recents ☰"), and rich library item list (Liked Songs, Playlists, Artists, Albums).
 */
export default function Sidebar({
  activeTab,
  onNav,
  playlists = [],
  artists = [],
  albums = [],
  likedCount = 0,
  onCreatePlaylist,
  onSelectPlaylist,
  nowPlaying,
}) {
  const { logout } = useAuth();
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [librarySearch, setLibrarySearch] = useState('');

  const filteredPlaylists = playlists.filter((pl) =>
    libraryFilter === 'All' || libraryFilter === 'Playlists'
  );
  const filteredArtists = artists.filter((ar) =>
    libraryFilter === 'All' || libraryFilter === 'Artists'
  );
  const filteredAlbums = albums.filter((al) =>
    libraryFilter === 'All' || libraryFilter === 'Albums'
  );

  return (
    <aside className="spotify-sidebar" role="navigation" aria-label="Patta Kelu Navigation">
      {/* ── Top Box: Brand + Home + Search ── */}
      <div className="sidebar-nav-card">
        {/* Brand Header */}
        <div className="sidebar-brand-header" onClick={() => onNav('dashboard')} title="Patta Kelu">
          <img
            src="/logo.png"
            alt="Patta Kelu"
            className="sidebar-brand-logo-img"
          />
          <span className="sidebar-brand-title">Patta Kelu</span>
        </div>

        <nav className="sidebar-primary-nav">
          {/* Home */}
          <button
            className={`sidebar-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNav('dashboard')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'dashboard' ? '#ffffff' : '#b3b3b3'}>
              {activeTab === 'dashboard' ? (
                <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33z" />
              ) : (
                <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33zM4 20V7.577l7.5-4.33 7.5 4.33V20h-4v-6a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6H4z" />
              )}
            </svg>
            <span>Home</span>
          </button>

          {/* Search */}
          <button
            className={`sidebar-nav-link ${activeTab === 'songs' ? 'active' : ''}`}
            onClick={() => onNav('songs')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={activeTab === 'songs' ? '#ffffff' : '#b3b3b3'}>
              <path d="M10.533 1.278.278 10.533a1.5 1.5 0 0 0 0 2.122l6.364 6.364a1.5 1.5 0 0 0 2.122 0l9.255-9.255a1.5 1.5 0 0 0 0-2.122l-6.364-6.364a1.5 1.5 0 0 0-2.122 0zm1.06 2.121 5.304 5.304-8.193 8.193-5.304-5.304 8.193-8.193z" opacity="0" />
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* ── Bottom Card: "Your Library" ── */}
      <div className="sidebar-library-card">
        {/* Library Header */}
        <div className="library-card-header">
          <div className="library-title-btn" onClick={() => onNav('playlists')} title="Collapse / Expand Your Library">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1.5-.866zM16 20V4h4v16h-4zM8.406 2.502a1 1 0 0 0-1.272.632l-4.8 14.4a1 1 0 0 0 .632 1.272l1.92.64a1 1 0 0 0 1.272-.632l4.8-14.4a1 1 0 0 0-.632-1.272z" />
            </svg>
            <span>Your Library</span>
          </div>

          <div className="library-header-actions">
            <button
              className="library-icon-action-btn"
              onClick={onCreatePlaylist}
              title="Create playlist or folder"
              aria-label="Create playlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
            <button
              className="library-icon-action-btn"
              onClick={() => onNav('playlists')}
              title="Enlarge your library"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 5l7 7-7 7-1.41-1.41L17.17 13H3v-2h14.17l-4.58-4.59L14 5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Pills: Playlists, Podcasts & Shows, Albums, Artists */}
        <div className="library-pills-row">
          {['Playlists', 'Podcasts & Shows', 'Albums', 'Artists'].map((filter) => (
            <button
              key={filter}
              className={`library-filter-pill ${libraryFilter === filter ? 'active' : ''}`}
              onClick={() => setLibraryFilter(libraryFilter === filter ? 'All' : filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search & Recents Sort Row */}
        <div className="library-search-sort-row">
          <div className="library-mini-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>

          <div className="library-sort-label">
            <span>Recents</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
            </svg>
          </div>
        </div>

        {/* Library Scroll List */}
        <div className="library-items-scroll">
          {/* Liked Songs Item (Gradient purple cover with white heart) */}
          {(libraryFilter === 'All' || libraryFilter === 'Playlists') && (
            <div
              className={`library-list-row ${activeTab === 'liked' ? 'active' : ''}`}
              onClick={() => onNav('liked')}
            >
              <div className="library-item-art liked-gradient-thumb">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="library-item-meta">
                <span className="library-item-title">Liked Songs</span>
                <span className="library-item-sub">Playlist • {likedCount} songs</span>
              </div>
            </div>
          )}

          {/* User Playlists */}
          {filteredPlaylists.map((pl) => (
            <div
              key={pl.id}
              className="library-list-row"
              onClick={() => {
                if (onSelectPlaylist) onSelectPlaylist(pl.id);
                onNav('playlists');
              }}
              title={pl.name}
            >
              <img
                src={getPlaylistCover(pl)}
                alt=""
                className="library-item-art"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="library-item-meta">
                <span className="library-item-title">{pl.name}</span>
                <span className="library-item-sub">Playlist • Patta Kelu</span>
              </div>
            </div>
          ))}

          {/* Artists */}
          {filteredArtists.map((ar) => (
            <div
              key={ar.id}
              className="library-list-row"
              onClick={() => onNav('artists')}
              title={ar.artistName}
            >
              <img
                src={getArtistImage(ar)}
                alt=""
                className="library-item-art circular"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="library-item-meta">
                <span className="library-item-title">{ar.artistName}</span>
                <span className="library-item-sub">Artist</span>
              </div>
            </div>
          ))}

          {/* Albums */}
          {filteredAlbums.map((al) => (
            <div
              key={al.id}
              className="library-list-row"
              onClick={() => onNav('albums')}
              title={al.albumName}
            >
              <img
                src={getAlbumCover(al)}
                alt=""
                className="library-item-art"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="library-item-meta">
                <span className="library-item-title">{al.albumName}</span>
                <span className="library-item-sub">Album</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
