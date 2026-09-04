import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import AudioPlayer from './components/AudioPlayer';
import ToastContainer from './components/ToastContainer';
import SpotifyLyricsModal from './components/SpotifyLyricsModal';
import DashboardPage from './pages/DashboardPage';
import SongsPage from './pages/SongsPage';
import AlbumsPage from './pages/AlbumsPage';
import ArtistsPage from './pages/ArtistsPage';
import PlaylistsPage from './pages/PlaylistsPage';
import LikedSongsPage from './pages/LikedSongsPage';
import { songApi, albumApi, artistApi, playlistApi, spotifyApi } from './api/musicApi';
import { useToast } from './hooks/useToast';

function MainPlayerApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // ── Navigation State ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  // ── Data State ────────────────────────────────────────────────────────────
  const [songs,        setSongs]        = useState([]);
  const [albums,       setAlbums]       = useState([]);
  const [artists,      setArtists]      = useState([]);
  const [playlists,    setPlaylists]    = useState([]);
  const [likedSongIds, setLikedSongIds] = useState(() => new Set());
  const [likedSongs,   setLikedSongs]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const { toasts, showToast, removeToast } = useToast();

  // ── 🎵 Global Player State ────────────────────────────────────────────────
  const [nowPlaying,       setNowPlaying]       = useState(null);
  const [playerQueue,      setPlayerQueue]      = useState([]);
  const [playerQueueSrc,   setPlayerQueueSrc]   = useState('');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [showLyricsModal,  setShowLyricsModal]  = useState(false);

  // Synchronized playback state shared by bottom AudioPlayer and RightPanel
  const [playbackState, setPlaybackState] = useState({
    playing: false,
    currentTime: 0,
    duration: 209,
    loading: false,
    isShuffle: false,
    isRepeat: false,
  });

  const playerControlsRef = useRef({
    togglePlay: () => {},
    seek: () => {},
    toggleShuffle: () => {},
    toggleRepeat: () => {},
  });

  // Check if current URL is an OAuth callback
  const [isCallbackRoute, setIsCallbackRoute] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.has('token') ||
      params.has('error') ||
      (window.location.pathname.includes('/auth/callback') && params.has('token'))
    );
  });

  const handlePlay = useCallback((song, queue = [], queueSrc = '') => {
    setNowPlaying(song);
    const q = queue.length > 0 ? queue : [song];
    setPlayerQueue(q);
    setPlayerQueueSrc(queueSrc);

    // Record playback to backend in background
    if (song?.id) {
      spotifyApi.recordPlay(song.id).catch(() => {});
    }
  }, []);

  const currentIdx = playerQueue.findIndex((s) => s.id === nowPlaying?.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < playerQueue.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) handlePlay(playerQueue[currentIdx - 1], playerQueue, playerQueueSrc);
  }, [hasPrev, currentIdx, playerQueue, playerQueueSrc, handlePlay]);

  const handleNext = useCallback(() => {
    if (hasNext) handlePlay(playerQueue[currentIdx + 1], playerQueue, playerQueueSrc);
  }, [hasNext, currentIdx, playerQueue, playerQueueSrc, handlePlay]);

  // ── Toggle Like & Sync with Backend ───────────────────────────────────────
  const handleToggleLike = useCallback(async (songId) => {
    setLikedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });

    try {
      const res = await spotifyApi.toggleLike(songId);
      if (res?.isLiked) {
        showToast('Added to Liked Songs 💚', 'success');
      } else {
        showToast('Removed from Liked Songs', 'info');
      }
      spotifyApi.getLikedSongs().then(setLikedSongs).catch(() => {});
    } catch {
      // Offline fallback
    }
  }, [showToast]);

  // ── Global Keyboard Shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'l' || e.key === 'L') {
        if (nowPlaying) handleToggleLike(nowPlaying.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [nowPlaying, handleToggleLike]);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, al, ar, pl, lkIds, lkSongs] = await Promise.all([
        songApi.getAll().catch(() => []),
        albumApi.getAll().catch(() => []),
        artistApi.getAll().catch(() => []),
        playlistApi.getAll().catch(() => []),
        spotifyApi.getLikedSongIds().catch(() => []),
        spotifyApi.getLikedSongs().catch(() => []),
      ]);
      setSongs(s   ?? []);
      setAlbums(al ?? []);
      setArtists(ar ?? []);
      setPlaylists(pl ?? []);
      setLikedSongIds(new Set(lkIds ?? []));
      setLikedSongs(lkSongs ?? []);

      if (s && s.length > 0 && !nowPlaying) {
        setNowPlaying(s[0]);
        setPlayerQueue(s);
      }
    } catch (err) {
      const msg = err.message || 'Failed to connect to backend';
      setError(msg);
      showToast(`Backend error: ${msg}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [nowPlaying, showToast]);

  const fetchSongs     = useCallback(async () => { try { setSongs((await songApi.getAll())         ?? []); } catch (e) { showToast(e.message, 'error'); } }, [showToast]);
  const fetchAlbums    = useCallback(async () => { try { setAlbums((await albumApi.getAll())       ?? []); } catch (e) { showToast(e.message, 'error'); } }, [showToast]);
  const fetchArtists   = useCallback(async () => { try { setArtists((await artistApi.getAll())     ?? []); } catch (e) { showToast(e.message, 'error'); } }, [showToast]);
  const fetchPlaylists = useCallback(async () => { try { setPlaylists((await playlistApi.getAll()) ?? []); } catch (e) { showToast(e.message, 'error'); } }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    }
  }, [isAuthenticated, fetchAll]);

  // Handle OAuth Callback screen
  if (isCallbackRoute) {
    return (
      <AuthCallbackPage
        onFinish={() => {
          setIsCallbackRoute(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // Handle Loading state
  if (authLoading) {
    return (
      <div className="modal-overlay" style={{ background: '#0c0e10' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  // If not authenticated, show LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ── Page Router ───────────────────────────────────────────────────────────
  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            songs={songs}
            albums={albums}
            artists={artists}
            playlists={playlists}
            onSelectPlaylist={setSelectedPlaylistId}
            loading={loading}
            onNav={setActiveTab}
            onPlay={(song, queue) => handlePlay(song, queue, 'dashboard')}
            likedSongIds={likedSongIds}
            onToggleLike={handleToggleLike}
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
            nowPlayingId={nowPlaying?.id}
            onPlay={(song, queue) => handlePlay(song, queue, 'songs')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'liked':
        return (
          <LikedSongsPage
            likedSongs={likedSongs.length > 0 ? likedSongs : songs.filter((s) => likedSongIds.has(s.id))}
            loading={loading}
            nowPlayingId={nowPlaying?.id}
            onPlay={(song, queue, src) => handlePlay(song, queue, src)}
            onToggleLike={handleToggleLike}
          />
        );
      case 'playlists':
        return (
          <PlaylistsPage
            playlists={playlists}
            allSongs={songs}
            loading={loading}
            onRefresh={fetchPlaylists}
            showToast={showToast}
            nowPlayingId={nowPlaying?.id}
            onPlay={(song, queue, src) => handlePlay(song, queue, src)}
            selectedPlaylistId={selectedPlaylistId}
            onSelectPlaylist={setSelectedPlaylistId}
          />
        );
      case 'albums':
        return (
          <AlbumsPage
            albums={albums}
            songs={songs}
            loading={loading}
            onRefresh={fetchAlbums}
            showToast={showToast}
            nowPlayingId={nowPlaying?.id}
            onPlay={(song, queue) => handlePlay(song, queue, 'albums')}
          />
        );
      case 'artists':
        return (
          <ArtistsPage
            artists={artists}
            songs={songs}
            loading={loading}
            onRefresh={fetchArtists}
            showToast={showToast}
            nowPlayingId={nowPlaying?.id}
            onPlay={(song, queue) => handlePlay(song, queue, 'artists')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="spotify-root-shell">
      <div className={`spotify-app ${isRightPanelOpen ? 'has-right-panel' : 'no-right-panel'}`}>
        {/* ── Left Sidebar Navigation (2-Card Desktop Layout) ── */}
        <Sidebar
          activeTab={activeTab}
          onNav={setActiveTab}
          playlists={playlists}
          artists={artists}
          albums={albums}
          likedCount={likedSongIds.size}
          onCreatePlaylist={() => {
            setSelectedPlaylistId(null);
            setActiveTab('playlists');
          }}
          onSelectPlaylist={(plId) => {
            setSelectedPlaylistId(plId);
            setActiveTab('playlists');
          }}
          nowPlaying={nowPlaying}
        />

        {/* ── Center Main Content Feed ── */}
        <div className="spotify-main-panel">
          <TopBar
            activeTab={activeTab}
            onNav={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Connection Error Banner */}
          {error && !loading && (
            <div
              style={{
                background: 'rgba(239,68,68,0.15)',
                borderBottom: '1px solid rgba(239,68,68,0.3)',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                color: '#f87171',
              }}
              role="alert"
            >
              <span>⚠️</span>
              <span>Cannot connect to Spring Boot backend at <strong>localhost:8081</strong>.</span>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={fetchAll}
              >
                🔄 Retry
              </button>
            </div>
          )}

          {/* Main View Scroll Area */}
          <div className="spotify-view-scroll" id="main-content">
            {renderPage()}
          </div>
        </div>

        {/* ── Right Side Panel: "Now Playing / About the Artist" ── */}
        {isRightPanelOpen && (
          <RightPanel
            song={nowPlaying || songs[0]}
            queue={playerQueue.length > 0 ? playerQueue : songs}
            onPrev={handlePrev}
            onNext={handleNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isLiked={(nowPlaying || songs[0]) ? likedSongIds.has((nowPlaying || songs[0]).id) : false}
            onToggleLike={() => (nowPlaying || songs[0]) && handleToggleLike((nowPlaying || songs[0]).id)}
            onPlayQueueItem={(song) => handlePlay(song, playerQueue.length > 0 ? playerQueue : songs, 'right-panel')}
            onClose={() => setIsRightPanelOpen(false)}
            playing={playbackState.playing}
            currentTime={playbackState.currentTime}
            duration={playbackState.duration}
            loading={playbackState.loading}
            onTogglePlay={() => playerControlsRef.current.togglePlay()}
            onSeek={(t) => playerControlsRef.current.seek(t)}
            isShuffle={playbackState.isShuffle}
            onToggleShuffle={() => playerControlsRef.current.toggleShuffle()}
            isRepeat={playbackState.isRepeat}
            onToggleRepeat={() => playerControlsRef.current.toggleRepeat()}
            onOpenLyrics={() => setShowLyricsModal(true)}
          />
        )}
      </div>

      {/* ── Persistent Spotify Bottom Audio Player Bar ── */}
      <AudioPlayer
        song={nowPlaying || songs[0]}
        streamUrl={(nowPlaying || songs[0])?.id ? songApi.getStreamUrl((nowPlaying || songs[0]).id) : null}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isLiked={(nowPlaying || songs[0]) ? likedSongIds.has((nowPlaying || songs[0]).id) : false}
        onToggleLike={() => (nowPlaying || songs[0]) && handleToggleLike((nowPlaying || songs[0]).id)}
        isRightPanelOpen={isRightPanelOpen}
        onToggleRightPanel={() => setIsRightPanelOpen((prev) => !prev)}
        queue={playerQueue.length > 0 ? playerQueue : songs}
        onPlayQueueItem={(song) => handlePlay(song, playerQueue.length > 0 ? playerQueue : songs, 'audio-player')}
        onSyncState={(state, controls) => {
          setPlaybackState(state);
          playerControlsRef.current = controls;
        }}
        onOpenLyrics={() => setShowLyricsModal(true)}
      />

      {/* ── Synced Vocal Lyrics Experience with Music Emoji ── */}
      {showLyricsModal && (
        <SpotifyLyricsModal
          song={nowPlaying || songs[0]}
          currentTime={playbackState.currentTime}
          duration={playbackState.duration}
          onSeek={(t) => playerControlsRef.current.seek(t)}
          onClose={() => setShowLyricsModal(false)}
          showToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainPlayerApp />
    </AuthProvider>
  );
}
