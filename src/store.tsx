import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  playlists as dataPlaylists,
  queueSeed,
  removePlaylist,
  setLikedPlaylist,
  trackById,
  tracks,
  upsertPlaylist,
  type Track,
} from './data';
import {
  clearLocalLibrary,
  defaultLibrary,
  defaultSettings,
  loadLibrary,
  loadSettings,
  saveLibrary,
  saveSettings,
  userPlaylistToPlaylist,
  type ProductSettings,
  type StoredLibrary,
  type UserPlaylist,
} from './product/library';

export type ScreenName =
  | 'onboarding'
  | 'home'
  | 'search'
  | 'library'
  | 'playlist'
  | 'album'
  | 'artist'
  | 'nowplaying'
  | 'queue'
  | 'lyrics'
  | 'profile'
  | 'settings';

export type Platform = 'phone' | 'desktop';
export type Route = { name: ScreenName; id?: string };
export type PanelTab = 'now' | 'queue' | 'lyrics';
export type ToastTone = 'default' | 'accent' | 'warn';
export type AppMode = 'studio' | 'product';
export type AppProfile = {
  name: string;
  handle: string;
  email?: string;
  genres: string[];
  avatarSeed: string;
  birthday?: { day: number; month: number; year: number };
};
export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ready' | 'error';

export type Toast = {
  id: number;
  msg: string;
  scope: Platform | 'both';
  tone: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};

type AppApi = {
  mode: AppMode;
  profile: AppProfile | null;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  transparency: 'full' | 'reduced';
  setTransparency: (t: 'full' | 'reduced') => void;
  motion: boolean;
  setMotion: (m: boolean) => void;
  toeBean: boolean;
  setToeBean: (v: boolean) => void;

  track: Track;
  currentId: string;
  playing: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  queue: string[];
  liked: Record<string, boolean>;
  toggle: () => void;
  playTrack: (id: string, contextIds?: string[]) => void;
  playCollection: (ids: string[], startId?: string) => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  setVolume: (v: number) => void;
  setShuffle: (v: boolean) => void;
  cycleRepeat: () => void;
  toggleLike: (id: string) => void;
  playNext: (id: string) => void;
  addToQueue: (id: string) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  audioStatus: AudioStatus;
  audioError: string | null;
  retryAudio: () => void;

  routes: Record<Platform, Route[]>;
  route: (p: Platform) => Route;
  nav: (p: Platform, name: ScreenName, id?: string) => void;
  jump: (p: Platform, name: ScreenName, id?: string) => void;
  back: (p: Platform) => void;
  panelTab: PanelTab;
  setPanelTab: (t: PanelTab) => void;

  toasts: Toast[];
  toast: (
    msg: string,
    scope?: Platform | 'both',
    opts?: { tone?: ToastTone; actionLabel?: string; onAction?: () => void },
  ) => void;
  dismissToast: (id: number) => void;

  likedPlaylistIds: string[];

  userPlaylists: UserPlaylist[];
  recent: string[];
  searchHistory: string[];
  recordSearch: (query: string) => void;
  clearSearchHistory: () => void;

  playlistManagerOpen: boolean;
  managedPlaylistId: string | null;
  openPlaylistManager: (id?: string) => void;
  closePlaylistManager: () => void;
  selectManagedPlaylist: (id: string) => void;
  createPlaylist: (title: string) => string;
  renamePlaylist: (id: string, title: string) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removePlaylistTrack: (playlistId: string, trackId: string) => void;
  movePlaylistTrack: (playlistId: string, from: number, to: number) => void;
  addCurrentToPlaylist: (playlistId: string) => void;

  signOut: () => void;
  deleteLocalData: () => void;
  clearCache: () => void;
};

const AppCtx = createContext<AppApi | null>(null);

const TAB_SCREENS: ScreenName[] = ['home', 'search', 'library'];
const PANEL_SCREENS: ScreenName[] = ['nowplaying', 'queue', 'lyrics'];
export const SESSION_KEY = 'mewzak.phase2.session.v1';

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function applyLibraryToCatalogue(items: UserPlaylist[], likedIds: string[]) {
  const itemIds = new Set(items.map((item) => item.id));
  for (const playlist of [...dataPlaylists]) {
    if (playlist.user && !itemIds.has(playlist.id)) removePlaylist(playlist.id);
  }
  for (const item of items) {
    upsertPlaylist(userPlaylistToPlaylist(item, trackById[item.trackIds[0]]?.image));
  }
  setLikedPlaylist(likedIds);
}

function persistSessionCleared() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* no-op */
  }
}

function resetProduct() {
  window.location.reload();
}

export function AppProvider({
  children,
  mode = 'studio',
  profile = null,
}: {
  children: ReactNode;
  mode?: AppMode;
  profile?: AppProfile | null;
}) {
  const product = mode === 'product';
  const [bootLibrary] = useState<StoredLibrary>(() =>
    product ? loadLibrary() : { ...defaultLibrary, liked: ['slow-blink', 'moonlit-knead', 'peach-soda', 'moth-hour'] },
  );
  const [bootSettings] = useState<ProductSettings>(() => (product ? loadSettings() : defaultSettings));

  const [theme, setTheme] = useState<'dark' | 'light'>(bootSettings.theme);
  const [transparency, setTransparency] = useState<'full' | 'reduced'>(bootSettings.transparency);
  const [motion, setMotion] = useState(bootSettings.motion);
  const [toeBean, setToeBean] = useState(bootSettings.toeBean);

  const initialLiked = useMemo(() => {
    const record: Record<string, boolean> = {};
    for (const id of bootLibrary.liked) record[id] = true;
    return record;
  }, [bootLibrary.liked]);
  const [liked, setLiked] = useState<Record<string, boolean>>(initialLiked);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>(() => {
    if (product) applyLibraryToCatalogue(bootLibrary.playlists, bootLibrary.liked);
    return bootLibrary.playlists;
  });

  const initialQueue = (() => {
    if (!product) return queueSeed;
    const valid = bootLibrary.queue.filter((id) => Boolean(trackById[id]));
    if (valid.length) return valid;
    const fromPlaylist = dataPlaylists[0]?.trackIds ?? [];
    return fromPlaylist.length ? fromPlaylist : tracks.slice(0, 12).map((track) => track.id);
  })();
  const [currentId, setCurrentId] = useState(
    product && bootLibrary.currentId && trackById[bootLibrary.currentId]
      ? bootLibrary.currentId
      : initialQueue[0] ?? tracks[0]?.id ?? '',
  );
  const [queue, setQueue] = useState<string[]>(() => {
    if (!product) return queueSeed;
    const valid = bootLibrary.queue.filter((id) => Boolean(trackById[id]));
    return valid.length ? valid : initialQueue;
  });
  const [playing, setPlaying] = useState(!product);
  const [progress, setProgress] = useState(product ? 0 : 38);
  const [volume, setVolume] = useState(bootSettings.volume);
  const [shuffle, setShuffle] = useState(product ? bootSettings.shuffle : false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>(product ? bootSettings.repeat : 'off');
  const [recent, setRecent] = useState<string[]>(product ? bootLibrary.recent : []);
  const [searchHistory, setSearchHistory] = useState<string[]>(product ? bootLibrary.searchHistory : []);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('idle');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playlistManagerOpen, setPlaylistManagerOpen] = useState(false);
  const [managedPlaylistId, setManagedPlaylistId] = useState<string | null>(null);

  const [routes, setRoutes] = useState<Record<Platform, Route[]>>({
    phone: [{ name: 'home' }],
    desktop: [{ name: 'home' }],
  });
  const [panelTab, setPanelTab] = useState<PanelTab>('now');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  const track = trackById[currentId] ?? tracks[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextRef = useRef<() => void>(() => undefined);
  const prevRef = useRef<() => void>(() => undefined);
  const seekRef = useRef<(sec: number) => void>(() => undefined);
  const stateRef = useRef({ currentId, queue, progress, repeat, shuffle, playing });
  stateRef.current = { currentId, queue, progress, repeat, shuffle, playing };
  const trackRef = useRef(track);
  trackRef.current = track;

  // Keep the shared catalogue in step with the local library. The catalogue is
  // mutated because the Phase 1 screens intentionally read one global model.
  useEffect(() => {
    if (!product) return;
    applyLibraryToCatalogue(userPlaylists, Object.keys(liked).filter((id) => liked[id]));
  }, [product, userPlaylists, liked]);

  const likedPlaylistIds = useMemo(
    () => Object.keys(liked).filter((id) => liked[id] && Boolean(trackById[id])),
    [liked],
  );

  // Persist only the user's own library state. Source metadata and audio stay in
  // memory and belong to the current session, per the Audius API terms.
  useEffect(() => {
    if (!product) return;
    const timeout = window.setTimeout(() => {
      saveLibrary({
        version: 1,
        liked: Object.keys(liked).filter((id) => liked[id]),
        playlists: userPlaylists,
        recent: recent.slice(0, 20),
        searchHistory: searchHistory.slice(0, 8),
        queue,
        currentId,
      });
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [product, liked, userPlaylists, recent, searchHistory, queue, currentId]);

  useEffect(() => {
    if (!product) return;
    saveSettings({ theme, motion, transparency, toeBean, volume, repeat, shuffle });
  }, [product, theme, motion, transparency, toeBean, volume, repeat, shuffle]);

  /* ── Audio ─────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!product) return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = bootSettings.volume;
    audioRef.current = audio;

    const onTime = () => {
      setProgress(audio.currentTime || 0);
      if (navigator.mediaSession?.setPositionState) {
        const duration = Number.isFinite(audio.duration) ? audio.duration : trackRef.current.duration;
        if (duration > 0) {
          navigator.mediaSession.setPositionState({
            duration,
            position: Math.min(audio.currentTime, duration),
            playbackRate: audio.playbackRate,
          });
        }
      }
    };
    const onWaiting = () => setAudioStatus('loading');
    const onCanPlay = () => {
      setAudioStatus((status) => (status === 'playing' ? status : 'ready'));
      setAudioError(null);
    };
    const onPlaying = () => {
      setAudioStatus('playing');
      setAudioError(null);
    };
    const onPause = () => {
      setAudioStatus((status) => (status === 'error' ? status : 'paused'));
    };
    const onEnded = () => nextRef.current();
    const onError = () => {
      setAudioError('This track could not play. Check your connection, then try again.');
      setAudioStatus('error');
      setPlaying(false);
    };
    const onDuration = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setProgress((value) => Math.min(value, audio.duration));
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('stalled', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onDuration);

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('stalled', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onDuration);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [product, bootSettings.volume]);

  useEffect(() => {
    if (!product) return;
    const audio = audioRef.current;
    if (!audio || !track.streamUrl) {
      if (product && track && !track.streamUrl) {
        setAudioError('This track has no stream available.');
        setAudioStatus('error');
      }
      return;
    }
    audio.src = track.streamUrl;
    audio.load();
    setProgress(0);
    setAudioStatus(playing ? 'loading' : 'ready');
    setAudioError(null);
    // The playing effect below starts playback after the source is attached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, track.id, track.streamUrl]);

  useEffect(() => {
    if (!product) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      if (!audio.src || !track.streamUrl) return;
      audio
        .play()
        .then(() => setAudioStatus('playing'))
        .catch((error: DOMException) => {
          if (error?.name === 'AbortError') return;
          setAudioError('Playback was blocked or the stream is unavailable. Press play again.');
          setAudioStatus('error');
          setPlaying(false);
        });
    } else {
      audio.pause();
    }
  }, [product, playing, track.id, track.streamUrl]);

  useEffect(() => {
    if (!product) return;
    const audio = audioRef.current;
    if (audio) audio.volume = Math.max(0, Math.min(1, volume));
  }, [product, volume]);

  useEffect(() => {
    if (!product) return;
    const audio = audioRef.current;
    if (audio) audio.loop = repeat === 'one';
  }, [product, repeat, track.id]);

  useEffect(() => {
    if (!product || !('mediaSession' in navigator)) return;
    if (track) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.image ? [{ src: track.image, sizes: '480x480', type: 'image/jpeg' }] : [],
      });
    }
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    const handle = (action: MediaSessionAction, callback: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, callback);
      } catch {
        /* Older webviews do not support every action. */
      }
    };
    handle('play', () => setPlaying(true));
    handle('pause', () => setPlaying(false));
    handle('previoustrack', () => prevRef.current());
    handle('nexttrack', () => nextRef.current());
    handle('seekto', (details) => {
      if (typeof details.seekTime === 'number') seekRef.current(details.seekTime);
    });
    handle('seekbackward', (details) => {
      seekRef.current(Math.max(0, stateRef.current.progress - (details.seekOffset ?? 10)));
    });
    handle('seekforward', (details) => {
      seekRef.current(stateRef.current.progress + (details.seekOffset ?? 10));
    });
    return () => {
      handle('play', null);
      handle('pause', null);
      handle('previoustrack', null);
      handle('nexttrack', null);
      handle('seekto', null);
      handle('seekbackward', null);
      handle('seekforward', null);
    };
  }, [product, track, playing]);

  /* ── Transport ─────────────────────────────────────────────────────────── */

  const chooseNext = useCallback((): string | null => {
    const { currentId: current, queue: list, shuffle: isShuffle, repeat: mode } = stateRef.current;
    if (!list.length) return null;
    if (mode === 'one') return current;
    if (isShuffle) {
      const options = list.filter((id) => id !== current);
      if (!options.length) return current;
      return options[Math.floor(Math.random() * options.length)];
    }
    const index = list.indexOf(current);
    if (index >= 0 && index < list.length - 1) return list[index + 1];
    if (mode === 'all') return list[0];
    return null;
  }, []);

  const next = useCallback(() => {
    if (!product) {
      if (repeat === 'one') {
        setProgress(0);
        return;
      }
      const idx = queue.indexOf(currentId);
      const nextId = idx === -1 || queue.length === 0 ? queueSeed[0] : queue[(idx + 1) % queue.length];
      setCurrentId(nextId);
      setProgress(0);
      setPlaying(true);
      return;
    }
    const nextId = chooseNext();
    if (!nextId) {
      setPlaying(false);
      const audio = audioRef.current;
      if (audio) setProgress(audio.duration || track.duration);
      return;
    }
    if (repeat === 'one') {
      seekRef.current(0);
      setPlaying(true);
      return;
    }
    setCurrentId(nextId);
    setProgress(0);
    setPlaying(true);
    setAudioStatus('loading');
    setAudioError(null);
    setRecent((items) => [nextId, ...items.filter((id) => id !== nextId)].slice(0, 20));
  }, [product, repeat, queue, currentId, chooseNext, track.duration]);
  nextRef.current = next;

  const prev = useCallback(() => {
    if (!product) {
      if (progress > 3) {
        setProgress(0);
        return;
      }
      const idx = queue.indexOf(currentId);
      const prevId = idx <= 0 ? queue[queue.length - 1] : queue[idx - 1];
      setCurrentId(prevId ?? currentId);
      setProgress(0);
      return;
    }
    if (progress > 3) {
      seekRef.current(0);
      return;
    }
    const index = queue.indexOf(currentId);
    const prevId = index > 0 ? queue[index - 1] : repeat === 'all' ? queue[queue.length - 1] : currentId;
    setCurrentId(prevId);
    setProgress(0);
    setPlaying(true);
    setAudioStatus('loading');
    setAudioError(null);
  }, [product, progress, queue, currentId, repeat]);
  prevRef.current = prev;

  const seek = useCallback(
    (sec: number) => {
      const max = track?.duration || 0;
      const nextValue = Math.min(max, Math.max(0, sec));
      setProgress(nextValue);
      if (product) {
        const audio = audioRef.current;
        if (audio && Number.isFinite(audio.duration)) audio.currentTime = Math.min(nextValue, audio.duration);
      }
    },
    [product, track?.duration],
  );
  seekRef.current = seek;

  const toggle = useCallback(() => {
    if (product && audioError) {
      setAudioError(null);
      const audio = audioRef.current;
      if (audio && track.streamUrl) {
        audio.src = track.streamUrl;
        audio.load();
        setAudioStatus('loading');
        setPlaying(true);
        return;
      }
    }
    setPlaying((value) => !value);
  }, [product, audioError, track.streamUrl]);

  // Studio transport clock only. The product clock comes from the audio element.
  useEffect(() => {
    if (product || !playing) return;
    const id = window.setInterval(() => {
      setProgress((value) => Math.min(track.duration, value + 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [product, playing, track.duration]);

  useEffect(() => {
    if (!product && progress >= track.duration) next();
  }, [product, progress, track.duration, next]);

  const playTrack = useCallback(
    (id: string, contextIds?: string[]) => {
      if (!trackById[id]) return;
      const nextQueue = contextIds?.length
        ? unique([...contextIds, id]).filter((item) => Boolean(trackById[item]))
        : undefined;
      if (nextQueue) {
        setQueue(nextQueue);
      } else {
        setQueue((items) => {
          if (items.includes(id)) return items;
          const index = items.indexOf(currentId);
          if (index < 0) return [id, ...items];
          return [...items.slice(0, index + 1), id, ...items.slice(index + 1)];
        });
      }
      if (id !== currentId) setProgress(0);
      setCurrentId(id);
      setPlaying(true);
      setAudioStatus('loading');
      setAudioError(null);
      setRecent((items) => [id, ...items.filter((item) => item !== id)].slice(0, 20));
    },
    [currentId],
  );

  const playCollection = useCallback((ids: string[], startId?: string) => {
    const valid = unique(ids).filter((id) => Boolean(trackById[id]));
    if (!valid.length) return;
    const start = startId && valid.includes(startId) ? startId : valid[0];
    setQueue(valid);
    setCurrentId(start);
    setProgress(0);
    setPlaying(true);
    setAudioStatus('loading');
    setAudioError(null);
    setRecent((items) => [start, ...items.filter((id) => id !== start)].slice(0, 20));
  }, []);

  const toggleLike = useCallback((id: string) => {
    setLiked((items) => {
      const next = { ...items };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  }, []);

  const playNext = useCallback(
    (id: string) => {
      setQueue((items) => {
        const without = items.filter((item) => item !== id);
        const index = without.indexOf(currentId);
        return [...without.slice(0, index + 1), id, ...without.slice(index + 1)];
      });
    },
    [currentId],
  );

  const addToQueue = useCallback((id: string) => {
    setQueue((items) => (items.includes(id) ? items : [...items, id]));
  }, []);

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((items) => items.filter((id, itemIndex) => itemIndex !== index || id === currentId));
    },
    [currentId],
  );

  const clearQueue = useCallback(() => setQueue([currentId]), [currentId]);
  const cycleRepeat = useCallback(() => {
    setRepeat((value) => (value === 'off' ? 'all' : value === 'all' ? 'one' : 'off'));
  }, []);

  const retryAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track.streamUrl) return;
    setAudioError(null);
    setAudioStatus('loading');
    audio.src = track.streamUrl;
    audio.load();
    setPlaying(true);
  }, [track.streamUrl]);

  /* ── Library ───────────────────────────────────────────────────────────── */

  const patchUserPlaylist = useCallback((id: string, patch: Partial<UserPlaylist>) => {
    setUserPlaylists((items) =>
      items.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }, []);

  const createPlaylist = useCallback(
    (title: string) => {
      const item = {
        id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim() || 'New playlist',
        description: 'A playlist kept on this device.',
        trackIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        palette: 'lavender' as const,
        art: userPlaylists.length % 8,
      };
      setUserPlaylists((items) => [...items, item]);
      setManagedPlaylistId(item.id);
      return item.id;
    },
    [userPlaylists.length],
  );

  const renamePlaylist = useCallback(
    (id: string, title: string) => {
      const nextTitle = title.trim();
      if (nextTitle) patchUserPlaylist(id, { title: nextTitle });
    },
    [patchUserPlaylist],
  );

  const deletePlaylist = useCallback(
    (id: string) => {
      setUserPlaylists((items) => items.filter((item) => item.id !== id));
      removePlaylist(id);
      setManagedPlaylistId((current) => (current === id ? null : current));
    },
    [],
  );

  const addTrackToPlaylist = useCallback(
    (playlistId: string, trackId: string) => {
      const playlist = userPlaylists.find((item) => item.id === playlistId);
      if (!playlist || !trackById[trackId] || playlist.trackIds.includes(trackId)) return;
      patchUserPlaylist(playlistId, { trackIds: [...playlist.trackIds, trackId] });
    },
    [userPlaylists, patchUserPlaylist],
  );

  const addCurrentToPlaylist = useCallback(
    (playlistId: string) => addTrackToPlaylist(playlistId, currentId),
    [addTrackToPlaylist, currentId],
  );

  const removePlaylistTrack = useCallback(
    (playlistId: string, trackId: string) => {
      const playlist = userPlaylists.find((item) => item.id === playlistId);
      if (!playlist) return;
      patchUserPlaylist(playlistId, {
        trackIds: playlist.trackIds.filter((id) => id !== trackId),
      });
    },
    [userPlaylists, patchUserPlaylist],
  );

  const movePlaylistTrack = useCallback(
    (playlistId: string, from: number, to: number) => {
      const playlist = userPlaylists.find((item) => item.id === playlistId);
      if (!playlist || to < 0 || to >= playlist.trackIds.length) return;
      const next = [...playlist.trackIds];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      patchUserPlaylist(playlistId, { trackIds: next });
    },
    [userPlaylists, patchUserPlaylist],
  );

  const openPlaylistManager = useCallback(
    (id?: string) => {
      setPlaylistManagerOpen(true);
      setManagedPlaylistId(id ?? userPlaylists[0]?.id ?? null);
    },
    [userPlaylists],
  );
  const closePlaylistManager = useCallback(() => setPlaylistManagerOpen(false), []);
  const selectManagedPlaylist = useCallback((id: string) => setManagedPlaylistId(id), []);

  const recordSearch = useCallback((query: string) => {
    const clean = query.trim();
    if (clean.length < 2) return;
    setSearchHistory((items) => [clean, ...items.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 8));
  }, []);
  const clearSearchHistory = useCallback(() => setSearchHistory([]), []);

  const signOut = useCallback(() => {
    persistSessionCleared();
    resetProduct();
  }, []);
  const deleteLocalData = useCallback(() => {
    clearLocalLibrary();
    persistSessionCleared();
    resetProduct();
  }, []);
  const clearCache = useCallback(() => {
    try {
      if ('caches' in window) {
        void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
      }
    } catch {
      /* no-op */
    }
  }, []);

  const route = useCallback((p: Platform) => routes[p][routes[p].length - 1], [routes]);
  const jump = useCallback((p: Platform, name: ScreenName, id?: string) => {
    setRoutes((items) => ({ ...items, [p]: [{ name, id }] }));
  }, []);
  const nav = useCallback(
    (p: Platform, name: ScreenName, id?: string) => {
      if (p === 'desktop' && PANEL_SCREENS.includes(name)) {
        setPanelTab(name === 'nowplaying' ? 'now' : (name as PanelTab));
        return;
      }
      setRoutes((items) => {
        if (TAB_SCREENS.includes(name)) return { ...items, [p]: [{ name, id }] };
        return { ...items, [p]: [...items[p], { name, id }] };
      });
    },
    [],
  );
  const back = useCallback((p: Platform) => {
    setRoutes((items) => (items[p].length > 1 ? { ...items, [p]: items[p].slice(0, -1) } : items));
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);
  const toast = useCallback<AppApi['toast']>((msg, scope = 'phone', opts) => {
    const id = ++toastSeq.current;
    setToasts((items) => [
      ...items.slice(-2),
      {
        id,
        msg,
        scope,
        tone: opts?.tone ?? 'default',
        actionLabel: opts?.actionLabel,
        onAction: opts?.onAction,
      },
    ]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement | null;
      if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.isContentEditable)) return;
      if (product && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        jump('phone', 'search');
        jump('desktop', 'search');
        return;
      }
      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
        return;
      }
      if (product && event.key === 'ArrowRight') {
        event.preventDefault();
        seek(stateRef.current.progress + 5);
      }
      if (product && event.key === 'ArrowLeft') {
        event.preventDefault();
        seek(stateRef.current.progress - 5);
      }
      if (event.key === 'Escape') setPlaylistManagerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, toggle, seek, jump]);

  useEffect(() => {
    if (managedPlaylistId && !userPlaylists.some((item) => item.id === managedPlaylistId)) {
      setManagedPlaylistId(userPlaylists[0]?.id ?? null);
    }
  }, [managedPlaylistId, userPlaylists]);

  const api = useMemo<AppApi>(
    () => ({
      mode,
      profile,
      theme,
      setTheme,
      transparency,
      setTransparency,
      motion,
      setMotion,
      toeBean,
      setToeBean,
      track,
      currentId,
      playing,
      progress,
      volume,
      shuffle,
      repeat,
      queue,
      liked,
      toggle,
      playTrack,
      playCollection,
      next,
      prev,
      seek,
      setVolume,
      setShuffle,
      cycleRepeat,
      toggleLike,
      playNext,
      addToQueue,
      removeFromQueue,
      clearQueue,
      audioStatus,
      audioError,
      retryAudio,
      routes,
      route,
      nav,
      jump,
      back,
      panelTab,
      setPanelTab,
      toasts,
      toast,
      dismissToast,
      likedPlaylistIds,
      userPlaylists,
      recent,
      searchHistory,
      recordSearch,
      clearSearchHistory,
      playlistManagerOpen,
      managedPlaylistId,
      openPlaylistManager,
      closePlaylistManager,
      selectManagedPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removePlaylistTrack,
      movePlaylistTrack,
      addCurrentToPlaylist,
      signOut,
      deleteLocalData,
      clearCache,
    }),
    [
      mode,
      profile,
      theme,
      transparency,
      motion,
      toeBean,
      track,
      currentId,
      playing,
      progress,
      volume,
      shuffle,
      repeat,
      queue,
      liked,
      toggle,
      playTrack,
      playCollection,
      next,
      prev,
      seek,
      audioStatus,
      audioError,
      retryAudio,
      routes,
      route,
      nav,
      jump,
      back,
      panelTab,
      toasts,
      toast,
      dismissToast,
      likedPlaylistIds,
      userPlaylists,
      recent,
      searchHistory,
      recordSearch,
      clearSearchHistory,
      playlistManagerOpen,
      managedPlaylistId,
      openPlaylistManager,
      closePlaylistManager,
      selectManagedPlaylist,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addTrackToPlaylist,
      removePlaylistTrack,
      movePlaylistTrack,
      addCurrentToPlaylist,
      signOut,
      deleteLocalData,
      clearCache,
    ],
  );

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
