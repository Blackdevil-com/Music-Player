import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import DashboardPage from './pages/DashboardPage';
import SongsPage from './pages/SongsPage';
import AlbumsPage from './pages/AlbumsPage';
import ArtistsPage from './pages/ArtistsPage';
import { songApi, albumApi, artistApi } from './api/musicApi';
import { useToast } from './hooks/useToast';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { toasts, showToast, removeToast } = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, al, ar] = await Promise.all([
        songApi.getAll(),
        albumApi.getAll(),
        artistApi.getAll(),
      ]);
      setSongs(s ?? []);
      setAlbums(al ?? []);
      setArtists(ar ?? []);
    } catch (err) {
      const msg = err.message || 'Failed to connect to backend';
      setError(msg);
      showToast(`Backend error: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchSongs = useCallback(async () => {
    try {
      const s = await songApi.getAll();
      setSongs(s ?? []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  const fetchAlbums = useCallback(async () => {
    try {
      const al = await albumApi.getAll();
      setAlbums(al ?? []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  const fetchArtists = useCallback(async () => {
    try {
      const ar = await artistApi.getAll();
      setArtists(ar ?? []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            songs={songs}
            albums={albums}
            artists={artists}
            loading={loading}
            onNav={setActiveTab}
          />
        );
      case 'songs':
        return (
          <SongsPage
            songs={songs}
            artists={artists}
            albums={albums}
            loading={loading}
            onRefresh={fetchSongs}
            showToast={showToast}
          />
        );
      case 'albums':
        return (
          <AlbumsPage
            albums={albums}
            loading={loading}
            onRefresh={fetchAlbums}
            showToast={showToast}
          />
        );
      case 'artists':
        return (
          <ArtistsPage
            artists={artists}
            loading={loading}
            onRefresh={fetchArtists}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onNav={setActiveTab}
        counts={{ songs: songs.length, albums: albums.length, artists: artists.length }}
      />

      {/* Main */}
      <main className="main-content" id="main-content">
        {/* Connection Error Banner */}
        {error && !loading && (
          <div
            style={{
              background: 'rgba(239,68,68,0.12)',
              borderBottom: '1px solid rgba(239,68,68,0.3)',
              padding: '10px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#f87171',
            }}
            role="alert"
          >
            <span>⚠️</span>
            <span>Cannot reach backend at <strong>localhost:8081</strong>. Make sure the Spring Boot server is running.</span>
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 'auto', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
              onClick={fetchAll}
              id="retry-connection-btn"
            >
              🔄 Retry
            </button>
          </div>
        )}

        {renderPage()}
      </main>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
