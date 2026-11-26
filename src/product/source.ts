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

// One shelf is not a catalogue. These are the rooms Mewzak asks Audius to fill
// on boot: sixteen genres, forty tracks each, deduplicated below. That keeps the
// home screen, search and every playlist stocked with hundreds of songs instead
// of the same dozen. Partial failures are fine — whatever answers is used.
const DISCOVERY_GENRES = [
  'Lo-Fi',
  'Ambient',
  'Chill',
  'Downtempo',
  'Electronic',
  'House',
  'Techno',
  'Hip-Hop/Rap',
  'R&B/Soul',
  'Indie',
  'Pop',
  'Jazz',
  'Classical',
  'Acoustic',
  'Alternative',
  'Experimental',
];

export async function fetchTrending(
  signal?: AbortSignal,
  genres = DISCOVERY_GENRES,
): Promise<{ tracks: SourceTrack[]; sources: AudiusTrack[] }> {
  const genreQueries = genres.map(async (genre) => {
    const response = await request<TracksResponse>(
      `/tracks/trending?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&genre=${encodeURIComponent(genre)}&limit=40&time=week`,
      signal,
    );
    return response.data ?? [];
  });
  // Underground trending is where the smaller rooms live. It also keeps the
  // catalogue from being only the same chart names.
  const underground = request<TracksResponse>(
    `/tracks/trending/underground?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&limit=60`,
    signal,
  ).then((response) => response.data ?? []);

  const settled = await Promise.allSettled([...genreQueries, underground]);
  const raw = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  if (!raw.length) {
    const fallback = await request<TracksResponse>(
      `/tracks/trending?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&limit=100`,
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
  const unique = Array.from(new Set(ids)).slice(0, 200);
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
    `/tracks/search?app_name=${encodeURIComponent(AUDIUS_APP_NAME)}&query=${encodeURIComponent(q)}&limit=40`,
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
  take = 24,
  offset = 0,
): Playlist {
  const sourcePool = Array.from(new Set(sourceTracks.map((track) => track.id)));
  const fallbackPool = Array.from(new Set(fallback.map((track) => track.id)));
  const pool = sourcePool.length >= 2 ? sourcePool : fallbackPool;
  const rotated = pool.length > 1 ? [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)] : pool;
  const ids = rotated.slice(0, take);
  return {
    id,
    title,
    description,
    curator: 'Mewzak',
    palette,
    art: hash(id) % 8,
    updated: 'Curated from Audius',
    trackIds: ids,
    image: sourceTracks[offset % Math.max(1, sourceTracks.length)]?.image ?? sourceTracks[0]?.image ?? fallback[0]?.image,
  };
}

function slugFor(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

  const byGenre = (genre: string) =>
    tracks.filter((track) => track.genre?.toLowerCase() === genre.toLowerCase());
  const fromGenres = (genres: string[]) => genres.flatMap((genre) => byGenre(genre));
  const allTracks = tracks;

  const counts = new Map<string, number>();
  for (const track of tracks) {
    const genre = track.genre?.trim();
    if (!genre) continue;
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }
  const topGenres = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre]) => genre);

  const curated: Array<{
    id: string;
    title: string;
    description: string;
    genres: string[];
    palette: PaletteKey;
    take?: number;
  }> = [
    {
      id: 'late-night-purr',
      title: 'Late Night Purr',
      description: 'Low light, slow tempos and tracks that don’t ask for attention.',
      genres: ['Ambient', 'Downtempo', 'Lo-Fi', 'Chill'],
      palette: 'lavender',
      take: 30,
    },
    {
      id: 'focus-paws',
      title: 'Focus Paws',
      description: 'Steady, low-distraction music for deep work. No sudden movements.',
      genres: ['Lo-Fi', 'Ambient', 'Classical', 'Electronic'],
      palette: 'ice',
      take: 30,
    },
    {
      id: 'rainy-window',
      title: 'Rainy Window',
      description: 'The best excuse to stay in. Muted, humid, unhurried.',
      genres: ['Ambient', 'Downtempo', 'Jazz', 'Chill'],
      palette: 'sky',
      take: 28,
    },
    {
      id: 'sunday-loaf',
      title: 'Sunday Loaf',
      description: 'Nowhere to be. Nothing to prove. Just a warm windowsill and a good record.',
      genres: ['Chill', 'Acoustic', 'Lo-Fi', 'Jazz'],
      palette: 'cream',
      take: 28,
    },
    {
      id: 'golden-hour-tail',
      title: 'Golden Hour Tail',
      description: 'Warm light, long shadows, one more song.',
      genres: ['Electronic', 'Chill', 'Pop', 'Downtempo'],
      palette: 'peach',
      take: 28,
    },
    {
      id: 'soft-launch',
      title: 'Soft Launch',
      description: 'New tracks with a gentle entrance. No alarms, no surprises.',
      genres: ['Pop', 'R&B/Soul', 'Indie', 'Alternative'],
      palette: 'blush',
      take: 28,
    },
    {
      id: 'night-drive',
      title: 'Night Drive',
      description: 'Headlights, wet asphalt and a bassline that keeps its cool.',
      genres: ['House', 'Techno', 'Electronic', 'Hip-Hop/Rap'],
      palette: 'night',
      take: 28,
    },
    {
      id: 'deep-cuts',
      title: 'Deep Cuts',
      description: 'The left turns, the B-sides, the songs that reward staying.',
      genres: ['Experimental', 'Alternative', 'Jazz', 'Classical'],
      palette: 'plum',
      take: 28,
    },
  ];

  const playlists: Playlist[] = curated.map((item, index) =>
    chunkPlaylist(
      item.id,
      item.title,
      item.description,
      fromGenres(item.genres),
      allTracks,
      item.palette,
      item.take ?? 28,
      index * 7,
    ),
  );

  // One room per genre that actually returned enough music. This is how the
  // shelf keeps growing without hand-writing a playlist for every mood.
  const paletteCycle: PaletteKey[] = ['lavender', 'ice', 'sky', 'cream', 'peach', 'blush', 'night', 'plum'];
  topGenres.forEach((genre, index) => {
    const genreTracks = byGenre(genre);
    if (genreTracks.length < 4) return;
    playlists.push(
      chunkPlaylist(
        `room-${slugFor(genre)}`,
        `${genre} Room`,
        `Everything Audius has been playing in ${genre.toLowerCase()} this week, in one long breath.`,
        genreTracks,
        allTracks,
        paletteCycle[index % paletteCycle.length],
        24,
        index * 5,
      ),
    );
  });

  playlists.push({
    id: 'liked-songs',
    title: 'Liked Songs',
    description: 'Everything you saved on this device. Kept warm.',
    curator: 'You',
    palette: 'plum',
    art: 3,
    updated: 'Nothing saved yet',
    trackIds: [],
  });

  return {
    tracks,
    artists: Array.from(artistMap.values()),
    albums: Array.from(albumMap.values()),
    playlists,
  };
}
