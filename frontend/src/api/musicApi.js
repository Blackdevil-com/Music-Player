// API Service — connects to backend at http://localhost:8081
// In development, Vite proxies /api/* → localhost:8081, so we use a relative URL.
// In production builds, set VITE_API_BASE to your full backend URL.
const BASE_URL = import.meta.env.VITE_API_BASE ?? '/api/v1';

const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(`Error ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

// ── Songs ──────────────────────────────────────────────

export const songApi = {
  /** GET /api/v1/songs */
  getAll: () =>
    fetch(`${BASE_URL}/songs`).then(handleResponse),

  /** GET /api/v1/songs/:id */
  getById: (id) =>
    fetch(`${BASE_URL}/songs/${id}`).then(handleResponse),

  /**
   * Returns the streaming URL for a song.
   * The HTML5 <audio> element natively sends HTTP Range headers to this URL.
   * The backend's FileStorageService.streamFile() responds with 206 Partial
   * Content — enabling seek, scrub, and progressive playback.
   *
   * Route: GET /api/v1/songs/:id/stream
   */
  getStreamUrl: (id) => `${BASE_URL}/songs/${id}/stream`,

  /** POST /api/v1/songs — multipart form (file is required by backend) */
  createWithFile: (songDto, file) => {
    const form = new FormData();
    form.append('songDto', new Blob([JSON.stringify(songDto)], { type: 'application/json' }));
    form.append('file', file);
    return fetch(`${BASE_URL}/songs`, {
      method: 'POST',
      body: form,
    }).then(handleResponse);
  },

  /** DELETE /api/v1/songs/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/songs/${id}`, { method: 'DELETE' }).then(handleResponse),
};

// ── Albums ─────────────────────────────────────────────

export const albumApi = {
  /** GET /api/v1/albums */
  getAll: () =>
    fetch(`${BASE_URL}/albums`).then(handleResponse),

  /** POST /api/v1/albums */
  create: (albumDto) =>
    fetch(`${BASE_URL}/albums`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumDto),
    }).then(handleResponse),

  /** PUT /api/v1/album/:id */
  update: (id, albumDto) =>
    fetch(`${BASE_URL}/album/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(albumDto),
    }).then(handleResponse),
};

// ── Artists ────────────────────────────────────────────

export const artistApi = {
  /** GET /api/v1/artists */
  getAll: () =>
    fetch(`${BASE_URL}/artists`).then(handleResponse),

  /** POST /api/v1/artists */
  create: (artistDto) =>
    fetch(`${BASE_URL}/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artistDto),
    }).then(handleResponse),

  /** DELETE /api/v1/artists/:id */
  delete: (id) =>
    fetch(`${BASE_URL}/artists/${id}`, { method: 'DELETE' }).then(handleResponse),
};
