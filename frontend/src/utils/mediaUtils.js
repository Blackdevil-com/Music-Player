// mediaUtils.js — High-fidelity media resolvers and Spotify aesthetic sample images

// Resolves relative backend file URLs to absolute or proxied URLs
export function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE;
  if (apiBase && apiBase.startsWith('http')) {
    const origin = new URL(apiBase).origin;
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  return url;
}

// ── Curated Sample Artist Portraits ──────────────────────────────────────────
const ARTIST_NAME_MAP = {
  'anirudh': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=700&auto=format&fit=crop',
  'spb': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700&auto=format&fit=crop',
  'dhanush': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop',
  'billie eilish': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
  'sza': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop',
  'ben&ben': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=700&auto=format&fit=crop',
  'kendrick lamar': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=700&auto=format&fit=crop',
  'newjeans': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=700&auto=format&fit=crop',
  'the weeknd': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=700&auto=format&fit=crop',
};

const SAMPLE_ARTIST_PORTRAITS = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=700&auto=format&fit=crop',
];

function strHash(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getArtistImage(artist) {
  if (!artist) return SAMPLE_ARTIST_PORTRAITS[0];
  if (artist.imageUrl && typeof artist.imageUrl === 'string' && artist.imageUrl.trim() !== '') {
    return resolveImageUrl(artist.imageUrl);
  }
  const name = (artist.artistName || artist.name || '').trim().toLowerCase();
  if (ARTIST_NAME_MAP[name]) {
    return ARTIST_NAME_MAP[name];
  }
  const idx = strHash(name || String(artist.id || 0)) % SAMPLE_ARTIST_PORTRAITS.length;
  return SAMPLE_ARTIST_PORTRAITS[idx];
}

// ── Curated Sample Album Covers ──────────────────────────────────────────────
const ALBUM_NAME_MAP = {
  'attitude': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
  'love': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'sfx': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=700&auto=format&fit=crop',
};

const SAMPLE_ALBUM_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520523839898-507125cd53c1?q=80&w=700&auto=format&fit=crop',
];

export function getAlbumCover(album) {
  if (!album) return SAMPLE_ALBUM_COVERS[0];
  if (album.coverUrl && typeof album.coverUrl === 'string' && album.coverUrl.trim() !== '') {
    return resolveImageUrl(album.coverUrl);
  }
  const name = (album.albumName || album.name || '').trim().toLowerCase();
  if (ALBUM_NAME_MAP[name]) {
    return ALBUM_NAME_MAP[name];
  }
  const idx = strHash(name || String(album.id || 0)) % SAMPLE_ALBUM_COVERS.length;
  return SAMPLE_ALBUM_COVERS[idx];
}

// ── Curated Sample Song Covers ───────────────────────────────────────────────
const SONG_TITLE_MAP = {
  'ravanna mavan': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=700&auto=format&fit=crop',
  'amma amma': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'velicha poove': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop',
  'chain rustle': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=700&auto=format&fit=crop',
  'breathing sound': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=700&auto=format&fit=crop',
  'aanandha_yazhai': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700&auto=format&fit=crop',
  'bad guy': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=700&auto=format&fit=crop',
  'humble.': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=700&auto=format&fit=crop',
};

const SAMPLE_SONG_COVERS = [
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520523839898-507125cd53c1?q=80&w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=700&auto=format&fit=crop',
];

export function getSongCover(song) {
  if (!song) return SAMPLE_SONG_COVERS[0];
  if (song.coverUrl && typeof song.coverUrl === 'string' && song.coverUrl.trim() !== '') {
    return resolveImageUrl(song.coverUrl);
  }
  const title = (song.title || '').trim().toLowerCase();
  if (SONG_TITLE_MAP[title]) {
    return SONG_TITLE_MAP[title];
  }
  if (song.albumName && ALBUM_NAME_MAP[song.albumName.toLowerCase()]) {
    return ALBUM_NAME_MAP[song.albumName.toLowerCase()];
  }
  const idx = strHash(title || String(song.id || 0)) % SAMPLE_SONG_COVERS.length;
  return SAMPLE_SONG_COVERS[idx];
}

// ── Curated Sample Playlist Covers ───────────────────────────────────────────
const PLAYLIST_NAME_MAP = {
  'love': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'loves': 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  'attitude': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
  'fight': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=700&auto=format&fit=crop',
  'morning vibe': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=700&auto=format&fit=crop',
  'chill': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=700&auto=format&fit=crop',
};

export const SAMPLE_PLAYLIST_COVERS = [
  {
    name: 'Love & Romance',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Attitude & Trap',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Fight & Workout',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Morning Vibe',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Night Drives',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=700&auto=format&fit=crop',
  },
  {
    name: 'Acoustic Soul',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=700&auto=format&fit=crop',
  },
];

export function getPlaylistCover(playlist) {
  if (!playlist) return SAMPLE_PLAYLIST_COVERS[0].url;
  if (playlist.coverUrl && typeof playlist.coverUrl === 'string' && playlist.coverUrl.trim() !== '') {
    return resolveImageUrl(playlist.coverUrl);
  }
  const name = (playlist.name || '').trim().toLowerCase();
  if (PLAYLIST_NAME_MAP[name]) {
    return PLAYLIST_NAME_MAP[name];
  }
  const idx = strHash(name || String(playlist.id || 0)) % SAMPLE_PLAYLIST_COVERS.length;
  return SAMPLE_PLAYLIST_COVERS[idx].url;
}

// ── Audio Duration Resolver & Cache ──────────────────────────────────────────
const durationCache = new Map();

const KNOWN_DURATIONS = {
  'amma amma': 29,
  'ravanna mavan': 208,
  'velicha poove': 235,
  'aanandha_yazhai': 214,
  'chain rustle': 18,
  'breathing sound': 12,
  'bad guy': 194,
  'humble.': 177,
  'kill bill': 153,
};

export function formatTime(seconds) {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function getSongDuration(song) {
  if (!song) return '3:15';
  if (song.durationSeconds && song.durationSeconds > 0) {
    return formatTime(song.durationSeconds);
  }
  if (song.id && durationCache.has(song.id)) {
    return formatTime(durationCache.get(song.id));
  }
  const titleKey = (song.title || '').trim().toLowerCase();
  if (KNOWN_DURATIONS[titleKey]) {
    if (song.id) durationCache.set(song.id, KNOWN_DURATIONS[titleKey]);
    return formatTime(KNOWN_DURATIONS[titleKey]);
  }
  return '3:20';
}

export function setSongDurationCache(songId, seconds) {
  if (songId && seconds && isFinite(seconds) && seconds > 0) {
    durationCache.set(songId, Math.round(seconds));
  }
}
