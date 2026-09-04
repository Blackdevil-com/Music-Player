import React, { useState, useMemo, useRef } from 'react';
import { songApi } from '../api/musicApi';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { getSongCover, getArtistImage, getAlbumCover, getSongDuration, setSongDurationCache } from '../utils/mediaUtils';

// ── Add Song Modal with Audio & Cover Image Upload ───────────────────────────
function AddSongModal({ artists, albums, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', artistId: '', albumId: '', genre: '' });
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(null);
  const [durationStr, setDurationStr] = useState('');
  const [loading, setLoading] = useState(false);
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCoverChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  };

  const handleAudioChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const audio = new Audio();
      audio.src = URL.createObjectURL(f);
      audio.onloadedmetadata = () => {
        if (audio.duration && isFinite(audio.duration)) {
          const sec = Math.round(audio.duration);
          setDurationSeconds(sec);
          const m = Math.floor(sec / 60);
          const s = Math.floor(sec % 60).toString().padStart(2, '0');
          setDurationStr(`${m}:${s}`);
        }
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!file) {
      alert('Please select an audio file to upload.');
      return;
    }
    setLoading(true);
    try {
      const dto = {
        title: form.title.trim(),
        artistId: form.artistId ? Number(form.artistId) : null,
        albumId: form.albumId ? Number(form.albumId) : null,
        genre: form.genre.trim() || null,
        durationSeconds: durationSeconds || null,
      };
      const created = await songApi.createWithFile(dto, file, coverFile);
      if (created?.id && durationSeconds) {
        setSongDurationCache(created.id, durationSeconds);
      }
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-song-title">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title" id="add-song-title">
            Add Lossless Track
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Track Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="song-title">
              Track Title <span>*</span>
            </label>
            <input
              id="song-title"
              name="title"
              className="form-input"
              placeholder="e.g. Blinding Lights, Starboy"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Artist & Album */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="song-artist">
                Artist
              </label>
              <select
                id="song-artist"
                name="artistId"
                className="form-select"
                value={form.artistId}
                onChange={handleChange}
              >
                <option value="">— Select Artist —</option>
                {artists.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.artistName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="song-album">
                Album
              </label>
              <select
                id="song-album"
                name="albumId"
                className="form-select"
                value={form.albumId}
                onChange={handleChange}
              >
                <option value="">— Select Album —</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.albumName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Genre */}
          <div className="form-group">
            <label className="form-label" htmlFor="song-genre">
              Genre
            </label>
            <input
              id="song-genre"
              name="genre"
              className="form-input"
              placeholder="e.g. Pop, Hip-Hop, Rock, Emotional Ballad"
              value={form.genre}
              onChange={handleChange}
            />
          </div>

          {/* Cover Image Upload */}
          <div className="form-group">
            <label className="form-label">
              Song Artwork / Cover (Optional)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--spotify-elevated)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#121418',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--text-subdued)">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {coverFile ? coverFile.name : 'Choose album art or photo'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-subdued)', marginTop: 2 }}>
                  PNG, JPG, WEBP • Square recommended
                </div>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverChange}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? 'Change' : 'Browse'}
              </button>
            </div>
          </div>

          {/* Audio File Upload */}
          <div className="form-group">
            <label className="form-label">
              Audio Binary File <span>*</span>
            </label>
            <div
              onClick={() => audioInputRef.current?.click()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                borderRadius: 'var(--radius-md)',
                background: file ? 'rgba(30,215,96,0.06)' : 'var(--spotify-elevated)',
                border: file ? '1.5px dashed var(--spotify-green)' : '1.5px dashed rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept=".mp3,.wav,.flac,audio/*"
                style={{ display: 'none' }}
                onChange={handleAudioChange}
              />
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: file ? 'var(--spotify-green)' : 'rgba(255,255,255,0.08)',
                  color: file ? '#000000' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                {file ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                )}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>
                {file ? file.name : 'Click to select audio file'}
              </div>
              <div style={{ fontSize: 11.5, color: file ? 'var(--spotify-green)' : 'var(--text-subdued)', marginTop: 4 }}>
                {file
                  ? `✓ Ready • ${(file.size / (1024 * 1024)).toFixed(2)} MB${durationStr ? ` • ${durationStr}` : ''}`
                  : 'MP3, WAV, FLAC High-Resolution Lossless Audio'}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : '+ Save Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Spotify Discover & Search Page (Main Export) ─────────────────────────────
export default function SongsPage({
  songs = [],
  artists = [],
  albums = [],
  loading,
  onRefresh,
  showToast,
  nowPlayingId,
  onPlay,
  searchQuery = '',
  onSearchChange,
}) {
  const { isAdmin } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState(() => new Set());
  const [searchFilterCategory, setSearchFilterCategory] = useState('All'); // 'All' | 'Songs' | 'Artists' | 'Albums'

  // Spotify Official 12 Colorful Genre Tiles
  const browseGenres = [
    { title: 'Pop', color: '#8d67ab', icon: '🔥', tag: 'Pop' },
    { title: 'Hip-Hop', color: '#ba5d07', icon: '🎤', tag: 'Hip-Hop' },
    { title: 'Dance / EDM', color: '#e13300', icon: '⚡', tag: 'Electronic' },
    { title: 'Rock', color: '#e91429', icon: '🎸', tag: 'Rock' },
    { title: 'Romantic', color: '#e8115b', icon: '💖', tag: 'Love' },
    { title: 'Acoustic', color: '#1e3264', icon: '☕', tag: 'Acoustic' },
    { title: 'Sound Effects', color: '#503750', icon: '🔊', tag: 'SFX' },
    { title: 'Podcasts', color: '#006450', icon: '🎙️', tag: 'Podcast' },
    { title: 'Mood & Chill', color: '#431f47', icon: '🌙', tag: 'Chill' },
    { title: 'Indie', color: '#608108', icon: '🌱', tag: 'Indie' },
    { title: 'R&B & Soul', color: '#8400e7', icon: '🎷', tag: 'R&B' },
    { title: 'Workout', color: '#777777', icon: '🏃', tag: 'Workout' },
  ];

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered tracks
  const effectiveQuery = searchQuery.trim();
  const matchingSongs = useMemo(() => {
    if (!effectiveQuery) return songs;
    return songs.filter((s) =>
      [s.title, s.artistName, s.albumName, s.genre].some((v) =>
        v?.toLowerCase().includes(effectiveQuery.toLowerCase())
      )
    );
  }, [songs, effectiveQuery]);

  // Matching Artists
  const matchingArtists = useMemo(() => {
    if (!effectiveQuery) return [];
    return artists.filter((a) =>
      a.artistName?.toLowerCase().includes(effectiveQuery.toLowerCase())
    );
  }, [artists, effectiveQuery]);

  // Matching Albums
  const matchingAlbums = useMemo(() => {
    if (!effectiveQuery) return [];
    return albums.filter((al) =>
      al.albumName?.toLowerCase().includes(effectiveQuery.toLowerCase())
    );
  }, [albums, effectiveQuery]);

  // Top Result match
  const topResult = useMemo(() => {
    if (!effectiveQuery) return null;
    // Prefer artist match if exact, else song match
    if (matchingArtists.length > 0 && matchingArtists[0].artistName.toLowerCase() === effectiveQuery.toLowerCase()) {
      return { type: 'Artist', data: matchingArtists[0] };
    }
    if (matchingSongs.length > 0) {
      return { type: 'Song', data: matchingSongs[0] };
    }
    if (matchingArtists.length > 0) {
      return { type: 'Artist', data: matchingArtists[0] };
    }
    if (matchingAlbums.length > 0) {
      return { type: 'Album', data: matchingAlbums[0] };
    }
    return null;
  }, [effectiveQuery, matchingSongs, matchingArtists, matchingAlbums]);

  const topSongsPreview = useMemo(() => {
    return matchingSongs.slice(0, 4);
  }, [matchingSongs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (!isAdmin) {
      showToast('Permission denied: Regular users do not have authority to delete tracks.', 'error');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await songApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Track deleted from library.', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="search-explore-page">
      {/* ── Search Header & Actions ── */}
      <div className="search-page-top-header">
        <div>
          <h1 className="search-page-title">
            {effectiveQuery ? `Search Results for "${effectiveQuery}"` : 'Discover & Search'}
          </h1>
          <p className="search-page-subtitle">
            Find songs, artists, albums, podcasts, and playlists across Spotify Hi-Fi.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Song
        </button>
      </div>

      {/* ── Filter Category Chips (when searching) ── */}
      {effectiveQuery && (
        <div className="search-category-chips">
          {['All', 'Songs', 'Artists', 'Albums'].map((cat) => (
            <button
              key={cat}
              className={`search-chip ${searchFilterCategory === cat ? 'active' : ''}`}
              onClick={() => setSearchFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── 1. When NO query: Browse All Genre Grid ── */}
      {!effectiveQuery && (
        <section className="search-browse-section">
          <h2 className="search-section-heading">Browse all</h2>
          <div className="spotify-genre-tiles-grid">
            {browseGenres.map((genre) => (
              <div
                key={genre.title}
                className="spotify-genre-tile"
                style={{ backgroundColor: genre.color }}
                onClick={() => onSearchChange(genre.tag)}
              >
                <span className="genre-tile-label">{genre.title}</span>
                <span className="genre-tile-art">{genre.icon}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 2. When SEARCH query active: Spotify Top Result + Songs Split View ── */}
      {effectiveQuery && topResult && (searchFilterCategory === 'All' || searchFilterCategory === 'Songs') && (
        <section className="search-split-layout">
          {/* Left: Top Result Card */}
          <div className="search-col-top-result">
            <h2 className="search-section-heading">Top result</h2>
            <div
              className="spotify-top-card"
              onClick={() => {
                if (topResult.type === 'Song') onPlay(topResult.data, matchingSongs);
              }}
            >
              <div className={`top-card-thumb ${topResult.type === 'Artist' ? 'circle' : ''}`} style={{ overflow: 'hidden' }}>
                <img
                  src={
                    topResult.type === 'Artist'
                      ? getArtistImage(topResult.data)
                      : topResult.type === 'Album'
                      ? getAlbumCover(topResult.data)
                      : getSongCover(topResult.data)
                  }
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                />
              </div>

              <div className="top-card-title">
                {topResult.type === 'Song'
                  ? topResult.data.title
                  : topResult.type === 'Artist'
                  ? topResult.data.artistName
                  : topResult.data.albumName}
              </div>

              <div className="top-card-subline">
                <span className="top-card-artist">
                  {topResult.type === 'Song'
                    ? topResult.data.artistName || 'Various Artists'
                    : 'Lossless Collection'}
                </span>
                <span className="top-card-pill">{topResult.type}</span>
              </div>

              {/* Floating Green Play Button on Hover */}
              <button
                className="top-card-play-hover"
                onClick={(e) => {
                  e.stopPropagation();
                  if (topResult.type === 'Song') onPlay(topResult.data, matchingSongs);
                }}
                title="Play"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Right: Songs (Top 4 preview rows) */}
          <div className="search-col-songs">
            <div className="songs-header-row">
              <h2 className="search-section-heading">Songs</h2>
              <button
                className="songs-see-all-link"
                onClick={() => {
                  const el = document.getElementById('full-tracklist-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See all ({matchingSongs.length})
              </button>
            </div>

            <div className="search-songs-preview-list">
              {topSongsPreview.map((song) => {
                const isPlaying = song.id === nowPlayingId;
                const isLiked = likedSongIds.has(song.id);
                return (
                  <div
                    key={song.id}
                    className={`search-song-row ${isPlaying ? 'playing' : ''}`}
                    onClick={() => onPlay(song, matchingSongs)}
                  >
                    <div className="search-row-art" style={{ overflow: 'hidden' }}>
                      <img
                        src={getSongCover(song)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                      />
                      <button
                        className="row-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(song, matchingSongs);
                        }}
                      >
                        ▶
                      </button>
                    </div>

                    <div className="search-row-info">
                      <div className="search-row-title">{song.title}</div>
                      <div className="search-row-artist">{song.artistName || 'Various Artists'}</div>
                    </div>

                    <button
                      className={`heart-action-btn ${isLiked ? 'active' : ''}`}
                      onClick={(e) => toggleLike(song.id, e)}
                      title={isLiked ? 'Liked' : 'Like'}
                    >
                      {isLiked ? '💚' : '♡'}
                    </button>

                    <div className="search-row-time">{getSongDuration(song)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. Artists Section (if matching) ── */}
      {effectiveQuery && matchingArtists.length > 0 && (searchFilterCategory === 'All' || searchFilterCategory === 'Artists') && (
        <section className="search-shelf-section">
          <h2 className="search-section-heading">Artists</h2>
          <div className="recent-cards-grid">
            {matchingArtists.map((artist) => (
              <div
                key={artist.id}
                className="recent-square-card"
                onClick={() => {
                  const tracks = songs.filter((s) => s.artistName === artist.artistName);
                  if (tracks.length > 0) onPlay(tracks[0], tracks);
                }}
              >
                <div style={{ position: 'relative', width: '100%', marginBottom: 10 }}>
                  <div className="recent-card-artwork" style={{ borderRadius: '50%', background: '#1e2126', overflow: 'hidden', margin: 0 }}>
                    <img
                      src={getArtistImage(artist)}
                      alt={artist.artistName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <button className="recent-card-play-hover" title="Play">▶</button>
                </div>
                <div className="recent-card-title" style={{ textAlign: 'center' }}>{artist.artistName}</div>
                <div className="recent-card-sub" style={{ textAlign: 'center' }}>Artist • Verified</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Albums Section (if matching) ── */}
      {effectiveQuery && matchingAlbums.length > 0 && (searchFilterCategory === 'All' || searchFilterCategory === 'Albums') && (
        <section className="search-shelf-section">
          <h2 className="search-section-heading">Albums</h2>
          <div className="recent-cards-grid">
            {matchingAlbums.map((album) => (
              <div
                key={album.id}
                className="recent-square-card"
                onClick={() => {
                  const tracks = songs.filter((s) => s.albumName === album.albumName);
                  if (tracks.length > 0) onPlay(tracks[0], tracks);
                }}
              >
                <div className="recent-card-artwork" style={{ background: '#1e2126', overflow: 'hidden' }}>
                  <img
                    src={getAlbumCover(album)}
                    alt={album.albumName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                  />
                  <button className="recent-card-play-hover" title="Play">▶</button>
                </div>
                <div className="recent-card-title">{album.albumName}</div>
                <div className="recent-card-sub">Album • Studio Master</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Full Structured Tracklist Table ── */}
      {effectiveQuery && (searchFilterCategory === 'All' || searchFilterCategory === 'Songs') && (
        <section id="full-tracklist-section" className="search-shelf-section" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="search-section-heading">
              Matching Tracks ({matchingSongs.length})
            </h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (matchingSongs.length > 0) {
                    const shuffled = [...matchingSongs].sort(() => Math.random() - 0.5);
                    onPlay(shuffled[0], shuffled);
                  }
                }}
                disabled={matchingSongs.length === 0}
              >
                🔀 Shuffle
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (matchingSongs.length > 0) onPlay(matchingSongs[0], matchingSongs);
                }}
                disabled={matchingSongs.length === 0}
              >
                ▶ Play All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
            </div>
          ) : matchingSongs.length === 0 ? (
            <div className="table-empty">
              <div className="table-empty-icon">🔍</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
                No results found for "{effectiveQuery}"
              </div>
              <p style={{ color: 'var(--text-subdued)', fontSize: 13, maxWidth: 420, margin: '0 auto 16px' }}>
                Please check your spelling or try searching for another artist, album, or genre.
              </p>
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                + Add New Song
              </button>
            </div>
          ) : (
            <table className="spotify-table">
              <thead>
                <tr>
                  <th style={{ width: 44, textAlign: 'center' }}>#</th>
                  <th>Title</th>
                  <th style={{ width: '25%' }}>Album</th>
                  <th style={{ width: '18%' }}>Genre</th>
                  <th style={{ width: 70, textAlign: 'right' }}>⏱️</th>
                  <th style={{ width: 50, textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {matchingSongs.map((song, idx) => {
                  const isPlaying = song.id === nowPlayingId;
                  const isLiked = likedSongIds.has(song.id);
                  return (
                    <tr
                      key={song.id}
                      className={isPlaying ? 'active-playing' : ''}
                      onClick={() => onPlay(song, matchingSongs)}
                    >
                      <td className="track-num-col">
                        {isPlaying ? (
                          <span style={{ color: 'var(--spotify-green)' }}>▶</span>
                        ) : (
                          <>
                            <span className="track-num-span">{idx + 1}</span>
                            <button
                              className="track-play-hover-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlay(song, matchingSongs);
                              }}
                            >
                              ▶
                            </button>
                          </>
                        )}
                      </td>

                      <td>
                        <div className="track-title-cell">
                          <div className="track-cover-sm" style={{ overflow: 'hidden' }}>
                            <img
                              src={getSongCover(song)}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                            />
                          </div>
                          <div className="track-meta-wrap">
                            <span className="track-name-bold">{song.title}</span>
                            <span className="track-artist-sub">{song.artistName || 'Various Artists'}</span>
                          </div>
                        </div>
                      </td>

                      <td>{song.albumName || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>

                      <td>
                        {song.genre ? (
                          <span className="pill-tag">{song.genre}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        {getSongDuration(song)}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`player-heart-btn ${isLiked ? 'active' : ''}`}
                          onClick={(e) => toggleLike(song.id, e)}
                          title={isLiked ? 'Liked' : 'Like'}
                        >
                          {isLiked ? '💚' : '♡'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Modals */}
      {showAdd && (
        <AddSongModal
          artists={artists}
          albums={albums}
          onClose={() => setShowAdd(false)}
          onSave={() => {
            setShowAdd(false);
            showToast('Track added to library!', 'success');
            onRefresh();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Track"
          message={`Are you sure you want to delete "${deleteTarget.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
