/**
 * Spotify-Style Synchronized Lyrics Engine
 * Features:
 * - Time-synced vocal playback
 * - Music emoji (🎵 🎶) detection and automatic instrumental interludes
 * - Parser for LRC format [mm:ss] and plain text auto-alignment
 * - Persistence via backend API + localStorage fallback
 */

import { songApi } from '../api/musicApi';

export const DEFAULT_SYNCED_LYRICS = {
  'vaadi pulla vaadi': `[00:00] 🎵 🎶 (Intro Music - Nadaswaram & Thavil Rhythms) 🎶 🎵
[00:09] 🎵 🎶 (Beat Drops...) 🎶 🎵
[00:15] Vaadi pulla vaadi vaadi pulla vaadi
[00:20] Enna nee paarthu siricha podhum vaadi
[00:25] Kooda vandhu aadu vaadi pulla aadu
[00:30] Kaathu mela kaatha veesi paadu pulla paadu
[00:35] 🎵 🎶 (Folk Instrumental & Beats Interlude) 🎶 🎵
[00:46] En Nenjukkulla Kudiyirukkum En Anbaana Kadhaliye
[00:52] Unna Paatha Pozhudhu En Manasellam Parakudhadhey
[00:58] Kannu Rendum Kaandhamaaga Enna Izhukudhadi
[01:04] Un Sirippil En Ulagam Thalaikeezha Maarudhadi
[01:10] 🎵 🎶 (Bass Rhythm & Nadaswaram Solo) 🎶 🎵
[01:21] Vaadi Pulla Vaadi Un Nenjil Idam Thaadi
[01:27] Kooda Vandhu Serum Kaalam Idhudhaandi
[01:33] Vaadi pulla vaadi vaadi pulla vaadi
[01:38] Enna nee paarthu siricha podhum vaadi
[01:44] 🎵 🎶 (Outro Melodic Beats) 🎶 🎵`,

  'before you go': `[00:00] 🎵 🎶 (Acoustic Guitar Picking Intro) 🎶 🎵
[00:10] I fell by the wayside like everyone else
[00:15] I hate you, I hate you, I hate you, but I was just kidding myself
[00:23] Our every moment, I start to replace
[00:28] 'Cause now that they're gone, all I hear are the words that I needed to say
[00:35] When you hurt under the surface
[00:38] Like troubled water running cold
[00:41] Well, time can heal, but this won't
[00:45] So, before you go
[00:48] Was there something I could've said to make your heart beat better?
[00:54] If only I'd have known you had a storm to weather
[01:00] So, before you go
[01:04] Was there something I could've said to make it all stop hurting?
[01:09] It kills me how your mind can make you feel so worthless
[01:16] So, before you go
[01:20] 🎵 🎶 (Acoustic Solo & Cello Harmony) 🎶 🎵
[01:30] Would we be better off by now
[01:33] If I'd let my walls come down?
[01:36] Maybe, I guess we'll never know
[01:42] So, before you go
[01:46] 🎵 🎶 (Outro Guitar Echoes) 🎶 🎵`,

  'bad guy': `[00:00] 🎵 🎶 (Minimalist Groovy Bassline & Snaps) 🎶 🎵
[00:07] White shirt now red, my bloody nose
[00:11] Sleepin', you're on your tippy toes
[00:14] Creepin' around like no one knows
[00:17] Think you're so criminal
[00:21] Bruises on both my knees for you
[00:24] Don't say thank you or please
[00:26] I do what I want when I'm wanting to
[00:29] My soul? So cynical
[00:32] So you're a tough guy, like it really rough guy
[00:36] Just can't get enough guy, chest always so puffed guy
[00:39] I'm that bad type, make your mama sad type
[00:43] Make your girlfriend mad tight, might seduce your dad type
[00:47] I'm the bad guy, duh
[00:50] 🎵 🎶 (Heavy Synth Bass Drop & Groove) 🎶 🎵
[01:05] I'm only good at bein' bad, bad
[01:12] I like when you get mad
[01:16] I guess I'm pretty glad that you're alone
[01:21] You said she's scared of me?
[01:24] I mean, I don't see what she sees
[01:28] But maybe it's 'cause I'm wearing your cologne
[01:32] 🎵 🎶 (Outro Glitch Synth Beats) 🎶 🎵`,

  'amma amma': `[00:00] 🎵 🎶 (Soulful Acoustic Melodies) 🎶 🎵
[00:06] Amma Amma Nee Enga Amma
[00:12] Unna Vitta Enakku Yaaru Amma
[00:18] Thedi Paatheney Kaanalaye
[00:23] En Kanneer Thuligal Theeralaye
[00:28] 🎵 🎶 (Violin Echoes & Flute Notes) 🎶 🎵`,

  'arabic kuthu': `[00:00] 🎵 🎶 (Arabic Melodies & Fast Kuthu Beats) 🎶 🎵
[00:10] Halamithi Habibo
[00:13] Halamithi Habibo
[00:17] Malama Pitha Pithadhey
[00:21] Malama Pitha Pithadhey
[00:25] 🎵 🎶 (High-Energy Dance Beats) 🎶 🎵
[00:33] Kannazhaga En Nenjil Koothadikkum Alaye
[00:38] Un Paarvaiyaal Ennai Mayakkum Nilave
[00:43] 🎵 🎶 (Trumpet & Shenhai Groove) 🎶 🎵`,

  'enjoy enjaami': `[00:00] 🎵 🎶 (Parai Beats & Bird Sounds Intro) 🎶 🎵
[00:08] Enjoy Enjaami Vaango Vaango Ondhaagi
[00:14] Amma Ammaani Kannaal Kanda Kaanaagi
[00:20] 🎵 🎶 (Traditional Folk Bass Drops) 🎶 🎵
[00:28] Paattan Poottan Kaathuvacha Boomi Idhu Thaane
[00:34] Koottaaga Serndhu Naama Kondaduvom Vaane
[00:40] 🎵 🎶 (Flute & Nature Outro) 🎶 🎵`,
};

/**
 * Parses raw LRC string into structured line objects
 * with start time in seconds, text, and music indicator.
 */
export function parseLyrics(rawText, totalDuration = 200) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const timeRegex = /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/;

  const hasTimestamps = lines.some((l) => timeRegex.test(l));

  if (hasTimestamps) {
    const parsed = [];
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(timeRegex);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const time = mins * 60 + secs;
        const text = lines[i].replace(timeRegex, '').trim();
        const isMusic =
          text.includes('🎵') ||
          text.includes('🎶') ||
          text.toLowerCase().includes('(music') ||
          text.toLowerCase().includes('(beat') ||
          text.toLowerCase().includes('(intro') ||
          text.toLowerCase().includes('(interlude') ||
          text.toLowerCase().includes('(solo') ||
          text.toLowerCase().includes('(outro');

        parsed.push({ time, text: text || '🎵 🎶 🎵 🎶', isMusic });
      }
    }
    parsed.sort((a, b) => a.time - b.time);

    // Auto-insert music emoji breaks if gap between lines is > 8 seconds
    const withBreaks = [];
    for (let i = 0; i < parsed.length; i++) {
      withBreaks.push(parsed[i]);
      if (i < parsed.length - 1) {
        const gap = parsed[i + 1].time - parsed[i].time;
        if (gap >= 8 && !parsed[i].isMusic && !parsed[i + 1].isMusic) {
          withBreaks.push({
            time: parsed[i].time + 2,
            text: '🎵 🎶 (Music playing...) 🎶 🎵',
            isMusic: true,
          });
        }
      }
    }
    return withBreaks;
  }

  // Fallback: Plain text lyrics without timestamps
  // Automatically distribute across duration with intro and outro music emojis
  const vocalCount = lines.length;
  const introTime = 8;
  const outroTime = Math.max(introTime + 10, totalDuration - 8);
  const availableVocalTime = outroTime - introTime;
  const interval = vocalCount > 0 ? availableVocalTime / vocalCount : 4;

  const result = [
    { time: 0, text: '🎵 🎶 (Intro Music) 🎶 🎵', isMusic: true },
  ];

  lines.forEach((lineText, idx) => {
    const isMusic =
      lineText.includes('🎵') ||
      lineText.includes('🎶') ||
      lineText.toLowerCase().includes('(music');
    result.push({
      time: Math.round((introTime + idx * interval) * 10) / 10,
      text: lineText,
      isMusic,
    });
  });

  result.push({
    time: outroTime,
    text: '🎵 🎶 (Outro Melodies) 🎶 🎵',
    isMusic: true,
  });

  return result;
}

/**
 * Retrieves the lyrics text for a given song:
 * 1. Checks localStorage custom lyrics
 * 2. Checks song.lyrics from backend
 * 3. Matches default curated lyrics by title/artist
 * 4. Generates standard rhythmic vocal lyrics with music breaks
 */
export function getSongLyricsText(song) {
  if (!song) return '';

  // 1. Local storage override
  if (song.id) {
    const local = localStorage.getItem(`song_lyrics_${song.id}`);
    if (local) return local;
  }

  // 2. Song entity lyrics from backend
  if (song.lyrics && song.lyrics.trim()) {
    return song.lyrics;
  }

  // 3. Default curated match
  const titleKey = (song.title || '').toLowerCase().trim();
  for (const [key, val] of Object.entries(DEFAULT_SYNCED_LYRICS)) {
    if (titleKey.includes(key) || key.includes(titleKey)) {
      return val;
    }
  }

  // 4. Default template
  const artist = song.artistName || 'Artist';
  const title = song.title || 'Track';
  return `[00:00] 🎵 🎶 (Intro Music - Melodic Beats) 🎶 🎵
[00:10] ${title} — sung by ${artist}
[00:18] High fidelity lossless master playback
[00:25] Feel the rhythm flowing through your mind
[00:32] 🎵 🎶 (Instrumental Interlude) 🎶 🎵
[00:44] Every single beat brings the soul alive
[00:52] Memories in harmony, echoes of the night
[01:00] 🎵 🎶 (Music playing...) 🎶 🎵
[01:12] Sing along with the vocal waves
[01:20] Patta Kelu pure audio immersion
[01:28] 🎵 🎶 (Outro Music) 🎶 🎵`;
}

/**
 * Saves custom lyrics both locally and to the backend
 */
export async function saveSongLyrics(songId, lyricsText) {
  if (songId) {
    localStorage.setItem(`song_lyrics_${songId}`, lyricsText);
    try {
      await songApi.updateLyrics(songId, lyricsText);
    } catch {
      // Offline fallback
    }
  }
}
