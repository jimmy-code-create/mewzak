import type { PaletteKey, Playlist } from '../data';

export const LIBRARY_KEY = 'mewzak.library.v1';
export const SETTINGS_KEY = 'mewzak.settings.v1';

export type UserPlaylist = {
  id: string;
  title: string;
  description: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
  palette: PaletteKey;
  art: number;
};

export type StoredLibrary = {
  version: 1;
  liked: string[];
  playlists: UserPlaylist[];
  recent: string[];
  searchHistory: string[];
  queue: string[];
  currentId?: string;
};

export type ProductSettings = {
  theme: 'dark' | 'light';
  motion: boolean;
  transparency: 'full' | 'reduced';
  toeBean: boolean;
  volume: number;
  repeat: 'off' | 'all' | 'one';
  shuffle: boolean;
};

export const defaultLibrary: StoredLibrary = {
  version: 1,
  liked: [],
  playlists: [],
  recent: [],
  searchHistory: [],
  queue: [],
};

export const defaultSettings: ProductSettings = {
  theme: 'dark',
  motion: true,
  transparency: 'full',
  toeBean: true,
  volume: 0.72,
  repeat: 'off',
  shuffle: false,
};

function stringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').slice(0, limit);
}

export function loadLibrary(): StoredLibrary {
  try {
    const raw = window.localStorage.getItem(LIBRARY_KEY);
    if (!raw) return { ...defaultLibrary };
    const parsed = JSON.parse(raw) as Partial<StoredLibrary>;
    const playlists: UserPlaylist[] = Array.isArray(parsed.playlists)
      ? parsed.playlists
          .filter((item): item is UserPlaylist => {
            return (
              !!item &&
              typeof item === 'object' &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              Array.isArray(item.trackIds)
            );
          })
          .map((item) => ({
            ...item,
            description: typeof item.description === 'string' ? item.description : '',
            trackIds: stringArray(item.trackIds, 500),
            createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString(),
            updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString(),
            palette: item.palette ?? 'lavender',
            art: Number.isFinite(item.art) ? item.art : 0,
          }))
      : [];
    return {
      version: 1,
      liked: stringArray(parsed.liked, 2000),
      playlists,
      recent: stringArray(parsed.recent, 20),
      searchHistory: stringArray(parsed.searchHistory, 8),
      queue: stringArray(parsed.queue, 500),
      currentId: typeof parsed.currentId === 'string' ? parsed.currentId : undefined,
    };
  } catch {
    return { ...defaultLibrary };
  }
}

export function saveLibrary(library: StoredLibrary) {
  try {
    window.localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch {
    /* Storage can be unavailable in a private window. The session still works. */
  }
}

export function loadSettings(): ProductSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<ProductSettings>;
    const volume = Number(parsed.volume);
    return {
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      motion: typeof parsed.motion === 'boolean' ? parsed.motion : true,
      transparency: parsed.transparency === 'reduced' ? 'reduced' : 'full',
      toeBean: typeof parsed.toeBean === 'boolean' ? parsed.toeBean : true,
      volume: Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0.72,
      repeat: parsed.repeat === 'all' || parsed.repeat === 'one' ? parsed.repeat : 'off',
      shuffle: Boolean(parsed.shuffle),
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: ProductSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* no-op */
  }
}

export function clearLocalLibrary() {
  try {
    window.localStorage.removeItem(LIBRARY_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
  } catch {
    /* no-op */
  }
}

const PALETTES: PaletteKey[] = ['lavender', 'peach', 'blush', 'night', 'ice', 'plum', 'cream', 'sky'];

export function createUserPlaylist(title: string, existing: UserPlaylist[]): UserPlaylist {
  const now = new Date().toISOString();
  const index = existing.length + 3;
  return {
    id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || 'New playlist',
    description: 'A playlist kept on this device.',
    trackIds: [],
    createdAt: now,
    updatedAt: now,
    palette: PALETTES[index % PALETTES.length],
    art: index % 8,
  };
}

export function userPlaylistToPlaylist(item: UserPlaylist, cover?: string): Playlist {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    curator: 'You',
    palette: item.palette,
    art: item.art,
    updated: `Edited ${new Date(item.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })}`,
    trackIds: item.trackIds,
    image: cover,
    user: true,
  };
}
