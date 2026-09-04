// API Service — connects to backend at http://localhost:8081
// In development, Vite proxies /api/* → localhost:8081, so we use a relative URL.
// In production builds, set VITE_API_BASE to your full backend URL.
const BASE_URL = import.meta.env.VITE_API_BASE ?? '/api/v1';

const getAuthHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Auth ───────────────────────────────────────────────
export const authApi = {
  /** GET /api/v1/auth/me */
  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// ── Songs ──────────────────────────────────────────────

export const songApi = {
  /** GET /api/v1/songs */
  getAll: () =>
    fetch(`${BASE_URL}/songs`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/songs/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/songs/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /**
   * Returns the streaming URL for a song.
   * The HTML5 <audio> element natively sends HTTP Range headers to this URL.
   * Route: GET /api/v1/songs/:id/stream
   */
  getStreamUrl: (id) => `${BASE_URL}/songs/${id}/stream`,

  /** POST /api/v1/songs — multipart form (file is required, cover is optional) */
  createWithFile: (songDto, file, coverFile = null) => {
    const form = new FormData();
    form.append('songDto', new Blob([JSON.stringify(songDto)], { type: 'application/json' }));
    form.append('file', file);
    if (coverFile) {
      form.append('cover', coverFile);
    }
    return fetch(`${BASE_URL}/songs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: form,
    }).then(handleResponse);
  },

  /** PUT /api/v1/songs/:id/lyrics */
  updateLyrics: (id, lyrics) =>
    fetch(`${BASE_URL}/songs/${id}/lyrics`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ lyrics }),
    }).then(handleResponse),

  /** DELETE /api/v1/songs/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/songs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// ── Albums ─────────────────────────────────────────────

export const albumApi = {
  /** GET /api/v1/albums */
  getAll: () =>
    fetch(`${BASE_URL}/albums`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** POST /api/v1/albums — supports JSON or multipart with cover */
  create: (albumDto, coverFile = null) => {
    if (coverFile) {
      const form = new FormData();
      form.append('albumDto', new Blob([JSON.stringify(albumDto)], { type: 'application/json' }));
      form.append('cover', coverFile);
      return fetch(`${BASE_URL}/albums`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      }).then(handleResponse);
    }
    return fetch(`${BASE_URL}/albums`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(albumDto),
    }).then(handleResponse);
  },

  /** PUT /api/v1/album/:id */
  update: (id, albumDto) =>
    fetch(`${BASE_URL}/album/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(albumDto),
    }).then(handleResponse),
};

// ── Artists ────────────────────────────────────────────

export const artistApi = {
  /** GET /api/v1/artists */
  getAll: () =>
    fetch(`${BASE_URL}/artists`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** POST /api/v1/artists — supports JSON or multipart with image */
  create: (artistDto, imageFile = null) => {
    if (imageFile) {
      const form = new FormData();
      form.append('artistDto', new Blob([JSON.stringify(artistDto)], { type: 'application/json' }));
      form.append('image', imageFile);
      return fetch(`${BASE_URL}/artists`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      }).then(handleResponse);
    }
    return fetch(`${BASE_URL}/artists`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(artistDto),
    }).then(handleResponse);
  },

  /** DELETE /api/v1/artists/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/artists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// ── Playlists ───────────────────────────────────────────

export const playlistApi = {
  /** GET /api/v1/playlists — returns List<PlaylistResponse> (with songs) */
  getAll: () =>
    fetch(`${BASE_URL}/playlists`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/playlists/:id — returns PlaylistResponse (with songs) */
  getById: (id) =>
    fetch(`${BASE_URL}/playlists/${id}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** POST /api/v1/playlists — supports JSON or multipart with cover file */
  create: (req, coverFile = null) => {
    if (coverFile) {
      const form = new FormData();
      form.append('playlistRequest', new Blob([JSON.stringify(req)], { type: 'application/json' }));
      form.append('cover', coverFile);
      return fetch(`${BASE_URL}/playlists`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form,
      }).then(handleResponse);
    }
    return fetch(`${BASE_URL}/playlists`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(req),
    }).then(handleResponse);
  },

  /** POST /api/v1/playlists/:id/songs/:songId — add song to playlist */
  addSong: (playlistId, songId) =>
    fetch(`${BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** DELETE /api/v1/playlists/:id — delete playlist */
  delete: (id) =>
    fetch(`${BASE_URL}/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** DELETE /api/v1/playlists/:playlistId/songs/:songId — remove song from playlist */
  removeSong: (playlistId, songId) =>
    fetch(`${BASE_URL}/playlists/${playlistId}/songs/${songId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

// ── Spotify Extended API ──────────────────────────────────
export const spotifyApi = {
  /** POST /api/v1/spotify/songs/:id/like */
  toggleLike: (songId) =>
    fetch(`${BASE_URL}/spotify/songs/${songId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/spotify/songs/liked */
  getLikedSongs: () =>
    fetch(`${BASE_URL}/spotify/songs/liked`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/spotify/songs/liked/ids */
  getLikedSongIds: () =>
    fetch(`${BASE_URL}/spotify/songs/liked/ids`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** POST /api/v1/spotify/history/:songId */
  recordPlay: (songId) =>
    fetch(`${BASE_URL}/spotify/history/${songId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/spotify/history */
  getRecentlyPlayed: () =>
    fetch(`${BASE_URL}/spotify/history`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),

  /** GET /api/v1/spotify/search?query=... */
  search: (query) =>
    fetch(`${BASE_URL}/spotify/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    }).then(handleResponse),
};

