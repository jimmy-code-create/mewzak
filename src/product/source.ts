// The one music-source boundary. The UI and the player only ever see Track,
// Artist, Album and Playlist values from src/data.ts. Swapping Audius for a
// licensed catalogue means implementing this interface, not touching a screen.
//
// Audius API terms (reviewed 25 Nov 2026): read-only endpoints are available
// without an API key; tracks may be streamed and metadata may be cached for the
// current session only. Audio must not be persisted or offered as a download.
// https://audius.co/documents/ApiTerms.pdf

import type { Album, Artist, PaletteKey, Playlist, Track } from '../data';
import { palettes } from '../data';

const API_BASE = 'https://api.audius.co/v1';

export const AUDIUS_APP_NAME =
  (import.meta.env.VITE_AUDIUS_APP_NAME as string | undefined)?.trim() || 'Mewzak';

export type SourceTrack = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  palette: PaletteKey;
  art: number;
  image?: string;
  streamUrl: string;
  sourceUrl: string;
  genre?: string;
  source: 'audius';
};

export type SourceCatalogue = {
  tracks: SourceTrack[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
};

export type { AudiusTrack };

type AudiusUser = {
  id?: string;
  name?: string;
  handle?: string;
  bio?: string;
  profile_picture?: { '150x150'?: string; '480x480'?: string; '1000x1000'?: string } | null;
  follower_count?: number;
  track_count?: number;
};

type AudiusTrack = {
  id?: string;
  title?: string;
  duration?: number;
  genre?: string;
  mood?: string;
  release_date?: string;
  permalink?: string;
  is_streamable?: boolean;
  is_delete?: boolean;
  is_unlisted?: boolean;
  artwork?: { '150x150'?: string; '480x480'?: string; '1000x1000'?: string } | null;
  user?: AudiusUser;
};

const PALETTE_KEYS = Object.keys(palettes) as PaletteKey[];

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) value = (value * 31 + input.charCodeAt(i)) >>> 0;
  return value;
}

function artworkFor(item: AudiusTrack): string | undefined {
  return item.artwork?.['480x480'] ?? item.artwork?.['1000x1000'] ?? item.artwork?.['150x150'] ?? undefined;
}

function imageForUser(user: AudiusUser | undefined): string | undefined {
  return (
    user?.profile_picture?.['480x480'] ??
    user?.profile_picture?.['1000x1000'] ??
    user?.profile_picture?.['150x150'] ??
    undefined
  );
}

function yearOf(date?: string): number {
  if (!date) return new Date().getFullYear();
  const year = Number(date.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : new Date().getFullYear();
}

export function toSourceTrack(item: AudiusTrack): SourceTrack | null {
  const id = item.id?.trim();
  const user = item.user;
  const artistId = user?.id ? `au-artist-${user.id}` : '';
  if (!id || !item.title?.trim() || !user?.name?.trim() || !artistId) return null;
  if (!item.is_streamable || item.is_delete || item.is_unlisted) return null;
  const duration = Number(item.duration);
  if (!Number.isFinite(duration) || duration < 20) return null;
  const palette = PALETTE_KEYS[hash(id) % PALETTE_KEYS.length];
  const art = hash(`${id}-art`) % 8;
  const albumId = `au-release-${user.id}`;
  return {
    id: `au-track-${id}`,
    title: item.title.trim(),
    artist: user.name.trim(),
    artistId,
    album: `Singles from ${user.name.trim()}`,
    albumId,
    duration,
    palette,
    art,
    image: artworkFor(item),
    streamUrl: `${API_BASE}/tracks/${encodeURIComponent(id)}/stream?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}`,
    sourceUrl: item.permalink ? `https://audius.co${item.permalink}` : 'https://audius.co',
    genre: item.genre || item.mood || undefined,
    source: 'audius',
  };
}

function artistFromTrack(track: SourceTrack, source: AudiusTrack): Artist {
  const user = source.user;
  const palette = PALETTE_KEYS[hash(track.artistId) % PALETTE_KEYS.length];
  return {
    id: track.artistId,
    name: track.artist,
    tagline: track.genre ? `${track.genre} · on Audius` : 'On Audius',
    monthly: user?.follower_count ?? 0,
    followers: user?.follower_count ?? 0,
    palette,
    art: hash(track.artistId) % 8,
    bio: user?.bio?.trim() || `Music by ${track.artist}, streamed from Audius.`,
    topTracks: [track.id],
    image: imageForUser(user),
    sourceUrl: user?.handle ? `https://audius.co/${user.handle}` : 'https://audius.co',
  };
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Music source returned ${response.status}`);
  }
  return (await response.json()) as T;
}

type TracksResponse = { data?: AudiusTrack[] };

export async function fetchTrending(
  signal?: AbortSignal,
  genres = ['Lo-Fi', 'Ambient', 'Chill', 'Electronic', 'Downtempo'],
): Promise<{ tracks: SourceTrack[]; sources: AudiusTrack[] }> {
  const queries = genres.map(async (genre) => {
    const response = await request<TracksResponse>(
      `/tracks/trending?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&genre=${encodeURIComponent(genre)}&limit=12`,
      signal,
    );
    return response.data ?? [];
  });
  const settled = await Promise.allSettled(queries);
  const raw = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  if (!raw.length) {
    const fallback = await request<TracksResponse>(
      `/tracks/trending?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&limit=24`,
      signal,
    );
    raw.push(...(fallback.data ?? []));
  }

  const seen = new Set<string>();
  const tracks: SourceTrack[] = [];
  const sources: AudiusTrack[] = [];
  for (const item of raw) {
    const mapped = toSourceTrack(item);
    if (!mapped || seen.has(mapped.id)) continue;
    seen.add(mapped.id);
    tracks.push(mapped);
    sources.push(item);
  }
  return { tracks, sources };
}

type TrackResponse = { data?: AudiusTrack };

/** Re-read saved track IDs from the source. Metadata is not persisted locally. */
export async function fetchTracksByIds(
  ids: string[],
  signal?: AbortSignal,
): Promise<{ tracks: SourceTrack[]; sources: AudiusTrack[] }> {
  const unique = Array.from(new Set(ids)).slice(0, 80);
  const tracks: SourceTrack[] = [];
  const sources: AudiusTrack[] = [];
  const seen = new Set<string>();

  for (let start = 0; start < unique.length; start += 8) {
    const batch = unique.slice(start, start + 8);
    const settled = await Promise.allSettled(
      batch.map(async (id) => {
        const response = await request<TrackResponse>(
          `/tracks/${encodeURIComponent(id)}?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}`,
          signal,
        );
        return response.data;
      }),
    );
    for (const result of settled) {
      if (result.status !== 'fulfilled' || !result.value) continue;
      const track = toSourceTrack(result.value);
      if (!track || seen.has(track.id)) continue;
      seen.add(track.id);
      tracks.push(track);
      sources.push(result.value);
    }
  }

  return { tracks, sources };
}

export async function searchTracks(
  query: string,
  signal?: AbortSignal,
): Promise<{ tracks: SourceTrack[]; sources: AudiusTrack[] }> {
  const q = query.trim();
  if (q.length < 2) return { tracks: [], sources: [] };
  const response = await request<TracksResponse>(
    `/tracks/search?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&query=${encodeURIComponent(q)}&limit=24`,
    signal,
  );
  const seen = new Set<string>();
  const tracks: SourceTrack[] = [];
  const sources: AudiusTrack[] = [];
  for (const item of response.data ?? []) {
    const track = toSourceTrack(item);
    if (!track || seen.has(track.id)) continue;
    seen.add(track.id);
    tracks.push(track);
    sources.push(item);
  }
  return { tracks, sources };
}

function chunkPlaylist(
  id: string,
  title: string,
  description: string,
  sourceTracks: SourceTrack[],
  fallback: SourceTrack[],
  palette: PaletteKey,
): Playlist {
  const unique = Array.from(new Set(sourceTracks.map((track) => track.id)));
  const ids = (unique.length >= 2 ? unique : fallback.map((track) => track.id)).slice(0, 12);
  return {
    id,
    title,
    description,
    curator: 'Mewzak',
    palette,
    art: hash(id) % 8,
    updated: 'Curated from Audius',
    trackIds: ids,
    image: sourceTracks[0]?.image ?? fallback[0]?.image,
  };
}

export function buildCatalogue(
  tracks: SourceTrack[],
  sources: AudiusTrack[],
): SourceCatalogue {
  if (!tracks.length) throw new Error('No playable tracks were returned by the music source.');

  const sourceById = new Map<string, AudiusTrack>();
  for (const source of sources) {
    if (source.id) sourceById.set(`au-track-${source.id}`, source);
  }

  const artistMap = new Map<string, Artist>();
  const albumMap = new Map<string, Album>();
  for (const track of tracks) {
    const source = sourceById.get(track.id);
    const user = source?.user;
    const existing = artistMap.get(track.artistId);
    if (existing) {
      existing.topTracks.push(track.id);
    } else if (source) {
      artistMap.set(track.artistId, artistFromTrack(track, source));
    }
    const album = albumMap.get(track.albumId);
    if (album) {
      album.trackIds.push(track.id);
      if (!album.image) album.image = track.image;
    } else {
      albumMap.set(track.albumId, {
        id: track.albumId,
        title: track.album,
        artist: track.artist,
        artistId: track.artistId,
        year: yearOf(source?.release_date),
        palette: track.palette,
        art: track.art,
        blurb: `Tracks by ${track.artist}, streamed from Audius.`,
        trackIds: [track.id],
        image: track.image,
        sourceUrl: track.sourceUrl,
      });
      if (user) {
        // The album is honestly a grouping of that artist's available tracks,
        // not a claim that the source supplied an album release.
        albumMap.get(track.albumId)!.title = `Singles from ${track.artist}`;
      }
    }
  }

  const byGenre = (genre: string) => tracks.filter((track) => track.genre?.toLowerCase() === genre.toLowerCase());
  const allTracks = tracks;
  const playlists: Playlist[] = [
    chunkPlaylist(
      'late-night-purr',
      'Late Night Purr',
      'Low light, slow tempos and tracks that don’t ask for attention.',
      [...byGenre('Ambient'), ...byGenre('Downtempo'), ...byGenre('Lo-Fi')],
      allTracks,
      'lavender',
    ),
    chunkPlaylist(
      'focus-paws',
      'Focus Paws',
      'Steady, low-distraction music for deep work.',
      [...byGenre('Lo-Fi'), ...byGenre('Ambient')],
      allTracks,
      'ice',
    ),
    chunkPlaylist(
      'rainy-window',
      'Rainy Window',
      'The best excuse to stay in. Muted, humid, unhurried.',
      [...byGenre('Ambient'), ...byGenre('Downtempo')],
      allTracks,
      'sky',
    ),
    chunkPlaylist(
      'sunday-loaf',
      'Sunday Loaf',
      'Nowhere to be. Nothing to prove.',
      [...byGenre('Chill'), ...byGenre('Lo-Fi')],
      allTracks,
      'cream',
    ),
    chunkPlaylist(
      'golden-hour-tail',
      'Golden Hour Tail',
      'Warm light, long shadows, one more song.',
      [...byGenre('Electronic'), ...byGenre('Chill')],
      allTracks,
      'peach',
    ),
    chunkPlaylist(
      'soft-launch',
      'Soft Launch',
      'New tracks with a gentle entrance. No alarms.',
      tracks.slice(0, 12),
      allTracks,
      'blush',
    ),
    {
      id: 'liked-songs',
      title: 'Liked Songs',
      description: 'Everything you saved on this device. Kept warm.',
      curator: 'You',
      palette: 'plum',
      art: 3,
      updated: 'Nothing saved yet',
      trackIds: [],
    },
  ];

  return {
    tracks,
    artists: Array.from(artistMap.values()),
    albums: Array.from(albumMap.values()),
    playlists,
  };
}
