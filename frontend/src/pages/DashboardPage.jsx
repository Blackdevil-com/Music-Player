import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getSongCover, getPlaylistCover } from '../utils/mediaUtils';

/**
 * Spotify Desktop Main Dashboard View
 * 1:1 match to media_1788549186221.png:
 * - Greeting: "Good evening"
 * - 6 Quick-Access Cards (2 rows of 3): Liked Songs, Moody Mix, 2000's Mix, Pop Mix, 2010 Mix, Daily Mix 3
 * - Shelf 1: "Made for [User]" (Release Radar, Daily Mix 1, Daily Mix 2, Daily Mix 4, Daily Mix 5)
 * - Shelf 2: "Your top mixes" (Afrobeats Mix, Christmas Mix, Backstreet Boys, Upbeat Mix, Hip Hop Mix)
 */
export default function DashboardPage({
  songs = [],
  albums = [],
  artists = [],
  playlists = [],
  onSelectPlaylist,
  loading,
  onNav,
  onPlay,
  likedSongIds = new Set(),
  nowPlaying,
}) {
  const { user } = useAuth();

  // Dynamic time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name?.split(' ')[0] || 'User';

  // Seed song references
  const song1 = songs[0] || { id: 1, title: 'Ravanna Mavan', artistName: 'Anirudh' };
  const song2 = songs[1] || { id: 2, title: 'Amma Amma', artistName: 'Dhanush' };
  const song3 = songs[2] || song1;
  const song4 = songs[3] || song2;

  // 6 Quick-Access Cards from Image 3
  const quickCards = [
    {
      id: 'liked-songs',
      title: 'Liked Songs',
      type: 'liked',
      isLikedCard: true,
      onClick: () => onNav('liked'),
      onPlay: () => onPlay(song1, songs),
    },
    {
      id: 'moody-mix',
      title: 'Moody Mix',
      img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=300&auto=format&fit=crop',
      isPlaying: nowPlaying?.title?.toLowerCase().includes('moody') || nowPlaying?.id === song1?.id,
      onClick: () => onPlay(song1, songs),
      onPlay: () => onPlay(song1, songs),
    },
    {
      id: '2000s-mix',
      title: "2000's Mix",
      img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300&auto=format&fit=crop',
      onClick: () => onPlay(song2, songs),
      onPlay: () => onPlay(song2, songs),
    },
    {
      id: 'pop-mix',
      title: 'Pop Mix',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
      onClick: () => onPlay(song3, songs),
      onPlay: () => onPlay(song3, songs),
    },
    {
      id: '2010-mix',
      title: '2010 Mix',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      onClick: () => onPlay(song4, songs),
      onPlay: () => onPlay(song4, songs),
    },
    {
      id: 'daily-mix-3',
      title: 'Daily Mix 3',
      img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
      onClick: () => onPlay(song1, songs),
      onPlay: () => onPlay(song1, songs),
    },
  ];

  // Shelf 1: "Made for [User]" (Image 3)
  const madeForCards = [
    {
      id: 'rr-1',
      title: 'Release Radar',
      desc: 'Catch up with new release from your fav....',
      tag: 'Release Radar',
      tagColor: '#2e3842',
      img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
      song: song1,
    },
    {
      id: 'dm-1',
      title: 'Daily Mix 1',
      desc: 'Kiss daniel, Asake, Olamide, and more',
      tag: 'Daily Mix 1',
      tagColor: '#53d7b6',
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
      song: song2,
    },
    {
      id: 'dm-2',
      title: 'Daily Mix 2',
      desc: 'Ed sheeran, One Direction, shawn...',
      tag: 'Daily Mix 2',
      tagColor: '#f1b4c3',
      img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
      song: song3,
    },
    {
      id: 'dm-4',
      title: 'Daily Mix 4',
      desc: 'Lewis Capaldi, Alexander stewart...',
      tag: 'Daily Mix 4',
      tagColor: '#f43f5e',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
      song: song4,
    },
    {
      id: 'dm-5',
      title: 'Daily Mix 5',
      desc: "Alec Benjamin, Olivia O'brien, John Legend...",
      tag: 'Daily Mix 5',
      tagColor: '#fbbf24',
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
      song: song1,
    },
  ];

  // Shelf 2: "Your top mixes" (Image 3)
  const topMixesCards = [
    {
      id: 'tm-1',
      title: 'Afrobeats Mix',
      desc: 'Shallipopi, kHaid',
      lineColor: '#22d3ee',
      img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
      song: song2,
    },
    {
      id: 'tm-2',
      title: 'Christmas Mix',
      desc: 'Maverick city, Pentatonix',
      lineColor: '#f87171',
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
      song: song3,
    },
    {
      id: 'tm-3',
      title: 'Backstreet Boys',
      desc: 'Gymclass heroes.....',
      lineColor: '#60a5fa',
      img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
      song: song4,
    },
    {
      id: 'tm-4',
      title: 'Upbeat Mix',
      desc: 'Clean bandit, Cia, Khalid....',
      lineColor: '#eab308',
      img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
      song: song1,
    },
    {
      id: 'tm-5',
      title: 'Hip Hop Mix',
      desc: 'Kendrick lamar, Eminem, Popsmoke...',
      lineColor: '#d97706',
      img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
      song: song2,
    },
  ];

  return (
    <div className="spotify-feed-wrapper">
      {/* ── Top Bar Controls: Navigation Arrows, Explore Premium, Profile ── */}
      <div className="dashboard-top-nav-row">
        <div className="history-arrows-box">
          <button className="history-circle-btn" onClick={() => window.history.back()} title="Go back">
            ‹
          </button>
          <button className="history-circle-btn" onClick={() => window.history.forward()} title="Go forward">
            ›
          </button>
        </div>

        <div className="dashboard-top-right-box">
          <button
            className="explore-premium-pill-btn"
            onClick={() => alert('Patta Kelu Lossless: Premium high-definition audio is enabled.')}
          >
            Explore Premium
          </button>
          <div className="topbar-user-avatar-circle" title={displayName}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Heading: Good evening ── */}
      <h1 className="spotify-greeting-heading">
        {getGreeting()}
      </h1>

      {/* ── 6 Quick-Access Cards (2 rows of 3) ── */}
      <div className="quick-access-grid-6">
        {quickCards.map((card) => (
          <div
            key={card.id}
            className="quick-card-tile"
            onClick={card.onClick}
          >
            {card.isLikedCard ? (
              <div className="quick-card-art-box liked-gradient-art">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            ) : (
              <div className="quick-card-art-box">
                <img src={card.img} alt={card.title} className="quick-card-img" />
              </div>
            )}

            <div className="quick-card-title-box">
              <span className="quick-card-name">{card.title}</span>
              {card.isPlaying && (
                <div className="quick-card-equalizer-bars" title="Playing">
                  <span className="eq-bar bar-1" />
                  <span className="eq-bar bar-2" />
                  <span className="eq-bar bar-3" />
                </div>
              )}
            </div>

            <button
              className="quick-card-play-hover-btn"
              onClick={(e) => {
                e.stopPropagation();
                card.onPlay();
              }}
              title={`Play ${card.title}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* ── Shelf 1: "Made for [User]" (Image 3) ── */}
      <section className="feed-shelf-section">
        <div className="feed-shelf-header">
          <h2 className="feed-shelf-title">Made for {displayName}</h2>
          <button className="feed-show-all" onClick={() => onNav('songs')}>
            Show all
          </button>
        </div>

        <div className="spotify-shelf-5-grid">
          {madeForCards.map((item) => (
            <div
              key={item.id}
              className="spotify-mix-card"
              onClick={() => onPlay(item.song, songs)}
            >
              <div className="mix-card-artwork-box">
                <img src={item.img} alt={item.title} className="mix-card-img" />
                <div className="mix-card-tag-banner" style={{ background: item.tagColor }}>
                  <span className="mix-tag-text">{item.tag}</span>
                </div>
                <button
                  className="shelf-card-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(item.song, songs);
                  }}
                  title="Play"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              <div className="mix-card-title">{item.title}</div>
              <div className="mix-card-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shelf 2: "Your top mixes" (Image 3) ── */}
      <section className="feed-shelf-section">
        <div className="feed-shelf-header">
          <h2 className="feed-shelf-title">Your top mixes</h2>
          <button className="feed-show-all" onClick={() => onNav('playlists')}>
            Show all
          </button>
        </div>

        <div className="spotify-shelf-5-grid">
          {topMixesCards.map((item) => (
            <div
              key={item.id}
              className="spotify-mix-card"
              onClick={() => onPlay(item.song, songs)}
            >
              <div className="mix-card-artwork-box">
                <img src={item.img} alt={item.title} className="mix-card-img" />
                <div className="top-mix-bottom-accent-bar" style={{ borderBottomColor: item.lineColor }} />
                <button
                  className="shelf-card-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(item.song, songs);
                  }}
                  title="Play"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              <div className="mix-card-title">{item.title}</div>
              <div className="mix-card-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shelf 3: Available Playlists ── */}
      {playlists.length > 0 && (
        <section className="feed-shelf-section">
          <div className="feed-shelf-header">
            <h2 className="feed-shelf-title">Your Available Playlists</h2>
            <button className="feed-show-all" onClick={() => onNav('playlists')}>
              Show all
            </button>
          </div>

          <div className="spotify-shelf-5-grid">
            {playlists.slice(0, 5).map((pl) => {
              const count = pl.songs ? (Array.isArray(pl.songs) ? pl.songs.length : Object.keys(pl.songs).length) : 0;
              return (
                <div
                  key={pl.id}
                  className="spotify-mix-card"
                  onClick={() => {
                    if (onSelectPlaylist) onSelectPlaylist(pl.id);
                    onNav('playlists');
                  }}
                >
                  <div className="mix-card-artwork-box">
                    <img
                      src={getPlaylistCover(pl)}
                      alt={pl.name}
                      className="mix-card-img"
                    />
                    <button
                      className="shelf-card-play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if ((pl.songs || []).length > 0) {
                          onPlay(pl.songs[0], pl.songs);
                        } else {
                          if (onSelectPlaylist) onSelectPlaylist(pl.id);
                          onNav('playlists');
                        }
                      }}
                      title={`Play ${pl.name}`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>

                  <div className="mix-card-title" title={pl.name}>
                    {pl.name}
                  </div>
                  <div className="mix-card-desc">
                    Playlist • {count} track{count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
