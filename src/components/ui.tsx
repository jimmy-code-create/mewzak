import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  ChevronDown,
  Disc3,
  ExternalLink,
  Heart,
  ListMusic,
  ListPlus,
  Mic2,
  MoreHorizontal,
  PawPrint,
  Play,
  Search,
  Share2,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  X,
  Check,
} from 'lucide-react';
import { useApp, type Platform } from '../store';
import {
  albumById,
  artistById,
  fmtTime,
  palettes,
  playlistById,
  trackById,
  type Album,
  type Artist,
  type PaletteKey,
  type Playlist,
  type Track,
} from '../data';
import { CatMark, Mascot } from './Brand';

/* ── Artwork ───────────────────────────────────────────────────────────────── */

const shapeNodes: ReactNode[] = [
  <g key="rings" fill="none" stroke="rgba(255,255,255,.34)">
    <circle cx="84" cy="30" r="27" strokeWidth="0.7" />
    <circle cx="84" cy="30" r="17" strokeWidth="0.7" opacity="0.7" />
    <circle cx="20" cy="102" r="38" fill="rgba(255,255,255,.09)" stroke="none" />
  </g>,
  <g key="arcs" fill="none" stroke="rgba(255,255,255,.4)">
    <circle cx="112" cy="6" r="60" strokeWidth="0.8" />
    <circle cx="112" cy="6" r="44" strokeWidth="0.8" opacity="0.65" />
    <circle cx="112" cy="6" r="28" strokeWidth="0.8" opacity="0.4" />
  </g>,
  <g key="lines" stroke="rgba(255,255,255,.32)" strokeWidth="0.7">
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M-10 ${18 + i * 11} L130 ${10 + i * 11}`} />
    ))}
    <rect x="14" y="58" width="34" height="34" fill="rgba(255,255,255,.14)" stroke="none" />
  </g>,
  null,
  <g key="dots" fill="rgba(255,255,255,.4)">
    {Array.from({ length: 6 }).map((_, r) =>
      Array.from({ length: 7 }).map((__, c) => (
        <circle key={`${r}-${c}`} cx={12 + c * 16} cy={14 + r * 17} r={r === 2 && c === 4 ? 2.6 : 1.1} />
      )),
    )}
    <circle cx="86" cy="48" r="30" fill="rgba(255,255,255,.08)" />
  </g>,
  <g key="waves" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="0.8">
    <path d="M-10 76 C18 54 36 96 62 74 C86 54 104 88 132 66" />
    <path d="M-10 88 C18 66 36 108 62 86 C86 66 104 100 132 78" opacity="0.7" />
    <path d="M-10 100 C18 78 36 120 62 98 C86 78 104 112 132 90" opacity="0.4" />
  </g>,
  <g key="moon">
    <circle cx="78" cy="40" r="23" fill="rgba(255,255,255,.2)" />
    <path d="M0 88 H120" stroke="rgba(255,255,255,.25)" strokeWidth="0.8" />
    <circle cx="97" cy="26" r="1.5" fill="rgba(255,255,255,.7)" />
    <circle cx="24" cy="21" r="1" fill="rgba(255,255,255,.5)" />
    <circle cx="44" cy="55" r="0.9" fill="rgba(255,255,255,.4)" />
  </g>,
  <g key="beam" stroke="rgba(255,255,255,.3)">
    <path d="M-20 104 L76 -20" strokeWidth="18" opacity="0.12" />
    <path d="M6 120 L108 2" strokeWidth="0.9" />
    <path d="M28 120 L130 2" strokeWidth="0.9" opacity="0.5" />
    <rect x="66" y="66" width="30" height="30" fill="none" strokeWidth="0.9" />
  </g>,
];

export function Art({
  palette,
  variant = 0,
  radius = 14,
  className = '',
  alt,
  image,
}: {
  palette: PaletteKey;
  variant?: number;
  radius?: number | string;
  className?: string;
  alt?: string;
  image?: string;
}) {
  const colors = palettes[palette].colors;
  const v = ((variant % 8) + 8) % 8;
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const showImage = Boolean(image) && failedImage !== image;
  const style = {
    '--a1': colors[0],
    '--a2': colors[1],
    '--a3': colors[2],
    borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
  } as CSSProperties;
  return (
    <div
      className={`art ${showImage ? 'art--image' : ''} ${className}`}
      style={style}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <span className="art-base" />
      {showImage ? (
        <img
          className="art-image"
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedImage(image ?? null)}
        />
      ) : null}
      <svg className="art-shape" viewBox="0 0 120 120" preserveAspectRatio="none">
        {shapeNodes[v]}
      </svg>
      {v === 3 && <CatMark className="art-mark" gradient />}
      <span className="art-grain" />
      <span className="art-sheen" />
    </div>
  );
}

export function artVars(palette: PaletteKey): CSSProperties {
  const colors = palettes[palette].colors;
  return {
    '--pa': colors[0],
    '--pb': colors[2],
    '--pa-soft': `color-mix(in srgb, ${colors[0]} 16%, transparent)`,
  } as CSSProperties;
}

export function Avatar({
  name,
  palette,
  variant = 0,
  size = 48,
  className = '',
  image,
}: {
  name: string;
  palette: PaletteKey;
  variant?: number;
  size?: number;
  className?: string;
  image?: string;
}) {
  const initials = name
    .replace('& the Quiet', '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return (
    <span
      className={`avatar ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
      aria-hidden="true"
    >
      <Art palette={palette} variant={variant} radius="50%" image={image} />
      <span className="avatar-initials">{initials}</span>
    </span>
  );
}

/* ── Playback controls ─────────────────────────────────────────────────────── */

function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="46%" height="46%" aria-hidden="true">
      <path d="M8.2 5.3 19 11.2c1.1.6 1.1 1.7 0 2.3L8.2 19.4c-1.1.6-2-.1-2-1.4V6.7c0-1.3.9-2 2-1.4Z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="46%" height="46%" aria-hidden="true">
      <rect className="pause-bar pause-bar--l" x="6.3" y="4.6" width="4.2" height="14.8" rx="2.1" fill="currentColor" />
      <rect className="pause-bar pause-bar--r" x="13.5" y="4.6" width="4.2" height="14.8" rx="2.1" fill="currentColor" />
    </svg>
  );
}

export function PlayButton({
  size = 56,
  className = '',
  plain = false,
}: {
  size?: number;
  className?: string;
  plain?: boolean;
}) {
  const { playing, toggle, toeBean } = useApp();
  return (
    <button
      className={`play-btn ${plain ? 'play-btn--plain' : 'play-btn--grad'} ${className}`}
      style={{ width: size, height: size }}
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-label={playing ? 'Pause' : 'Play'}
      title={playing ? 'Pawse' : 'Play'}
    >
      {playing ? <PauseGlyph /> : <PlayGlyph />}
      {toeBean && (
        <span className="paw-hint" aria-hidden="true">
          <PawPrint size={Math.max(10, size * 0.2)} />
        </span>
      )}
    </button>
  );
}

export function PlayCollectionButton({
  trackIds,
  size = 52,
}: {
  trackIds: string[];
  size?: number;
}) {
  const { playing, currentId, playCollection, toggle } = useApp();
  const inList = trackIds.includes(currentId);
  const active = playing && inList;
  return (
    <button
      className="play-btn play-btn--grad"
      style={{ width: size, height: size }}
      onClick={() => {
        if (inList) toggle();
        else playCollection(trackIds);
      }}
      aria-label={active ? 'Pause' : 'Play all'}
      title={active ? 'Pawse' : 'Play all'}
    >
      {active ? <PauseGlyph /> : <PlayGlyph />}
    </button>
  );
}

export function Eq({ className = '' }: { className?: string }) {
  return (
    <span className={`eq ${className}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function TransportControls({
  size = 'md',
  className = '',
}: {
  size?: 'md' | 'lg';
  className?: string;
}) {
  const { shuffle, setShuffle, repeat, cycleRepeat, prev, next, toast } = useApp();
  return (
    <div className={`transport-controls transport-controls--${size} ${className}`}>
      <button
        className={`ghost-icon ${shuffle ? 'is-on' : ''}`}
        onClick={() => {
          setShuffle(!shuffle);
          toast(shuffle ? 'Shuffle off. Order restored.' : 'Shuffled. Order is a suggestion.', 'both');
        }}
        aria-label="Shuffle"
        aria-pressed={shuffle}
        title="Shuffle"
      >
        <Shuffle />
      </button>
      <button className="skip-btn" onClick={prev} aria-label="Previous track" title="Previous track">
        <SkipBack />
      </button>
      <PlayButton size={size === 'lg' ? 64 : 44} />
      <button className="skip-btn" onClick={next} aria-label="Next track" title="Next track">
        <SkipForward />
      </button>
      <button
        className={`ghost-icon ${repeat !== 'off' ? 'is-on' : ''}`}
        onClick={cycleRepeat}
        aria-label={`Repeat ${repeat}`}
        title={`Repeat ${repeat}`}
      >
        {repeat === 'one' ? <Repeat1 /> : <Repeat />}
      </button>
    </div>
  );
}

export function ScrubBar({
  value,
  max,
  onChange,
  label = 'Seek',
  className = '',
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <input
      type="range"
      min={0}
      max={Math.max(1, Math.round(max))}
      step={1}
      value={Math.round(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      className={`range range--scrub ${className}`}
      style={{ '--pct': `${pct}%` } as CSSProperties}
    />
  );
}

export function ScrubRow({ compact = false }: { compact?: boolean }) {
  const { progress, track, seek } = useApp();
  return (
    <div className={`scrub-row ${compact ? 'scrub-row--compact' : ''}`}>
      <span className="time">{fmtTime(progress)}</span>
      <ScrubBar value={progress} max={track.duration} onChange={seek} label="Seek in track" />
      <span className="time time--total">-{fmtTime(Math.max(0, track.duration - progress))}</span>
    </div>
  );
}

export function VolumeSlider({ compact = false }: { compact?: boolean }) {
  const { volume, setVolume } = useApp();
  const pct = Math.round(volume * 100);
  return (
    <div className={`volume ${compact ? 'volume--compact' : ''}`}>
      <button
        className="ghost-icon"
        onClick={() => setVolume(volume === 0 ? 0.72 : 0)}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        title={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? <VolumeX /> : <Volume2 />}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={pct}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        aria-label="Volume"
        className="range range--volume"
        style={{ '--pct': `${pct}%` } as CSSProperties}
      />
    </div>
  );
}

/* ── Track row + context menu ──────────────────────────────────────────────── */

export function TrackMenu({
  track,
  platform = 'phone',
  onClose,
  onRemove,
}: {
  track: Track;
  platform?: Platform;
  onClose: () => void;
  onRemove?: () => void;
}) {
  const { liked, toggleLike, playNext, addToQueue, nav, toast } = useApp();
  const isLiked = !!liked[track.id];
  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };
  return (
    <div
      className="ctx-menu"
      role="menu"
      aria-label={`Options for ${track.title}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="ctx-head">
        <strong>{track.title}</strong>
        <span>{track.artist}</span>
      </div>
      <button
        role="menuitem"
        onClick={act(() => {
          playNext(track.id);
          toast('Up next. Cutting the line, politely.', platform);
        })}
      >
        <ListPlus /> Play next
      </button>
      <button
        role="menuitem"
        onClick={act(() => {
          addToQueue(track.id);
          toast('Queued. Patience, kitten.', platform);
        })}
      >
        <ListMusic /> Add to queue
      </button>
      <button
        role="menuitem"
        onClick={act(() => {
          toggleLike(track.id);
          toast(isLiked ? 'Removed. No hard feelings.' : 'Saved. Very purr-sonal.', platform);
        })}
      >
        <Heart className={isLiked ? 'is-filled' : ''} /> {isLiked ? 'Remove from Liked Songs' : 'Like'}
      </button>
      <div className="ctx-sep" />
      <button role="menuitem" onClick={act(() => nav(platform, 'album', track.albumId))}>
        <Disc3 /> Go to album
      </button>
      <button role="menuitem" onClick={act(() => nav(platform, 'artist', track.artistId))}>
        <Mic2 /> Go to artist
      </button>
      <button
        role="menuitem"
        onClick={act(() => {
          const url = track.sourceUrl || window.location.href;
          if (navigator.share) {
            void navigator.share({ title: `${track.title} — ${track.artist}`, url }).catch(() => undefined);
          } else {
            void navigator.clipboard?.writeText(url).catch(() => undefined);
            toast('Link copied.', platform);
          }
        })}
      >
        <Share2 /> Share
      </button>
      {track.sourceUrl && (
        <a role="menuitem" className="ctx-link" href={track.sourceUrl} target="_blank" rel="noreferrer">
          <ExternalLink /> Open on Audius
        </a>
      )}
      {onRemove && (
        <>
          <div className="ctx-sep" />
          <button
            role="menuitem"
            className="ctx-danger"
            onClick={act(() => {
              onRemove();
              toast('Removed from queue.', platform);
            })}
          >
            <X /> Remove from queue
          </button>
        </>
      )}
    </div>
  );
}

export function TrackRow({
  trackId,
  index,
  platform = 'phone',
  variant = 'phone',
  onRemove,
  contextIds,
}: {
  trackId: string;
  index?: number;
  platform?: Platform;
  variant?: 'phone' | 'desktop';
  onRemove?: () => void;
  contextIds?: string[];
}) {
  const track = trackById[trackId];
  const { currentId, playing, playTrack, liked, toggleLike, toast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const isCurrent = currentId === trackId;

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  if (!track) return null;

  return (
    <div
      ref={rowRef}
      className={[
        'track-row',
        `track-row--${variant}`,
        index === undefined ? 'track-row--noindex' : '',
        isCurrent ? 'is-current' : '',
        menuOpen ? 'is-menu-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={() => playTrack(track.id, contextIds)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playTrack(track.id, contextIds);
        }
      }}
      aria-label={`Play ${track.title} by ${track.artist}`}
    >
      {index !== undefined && (
        <span className="track-lead">
          {isCurrent && playing ? <Eq /> : <span className="track-num">{String(index + 1).padStart(2, '0')}</span>}
        </span>
      )}
      <Art palette={track.palette} variant={track.art} radius={10} className="track-art" image={track.image} />
      <span className="track-main">
        <span className="track-title">{track.title}</span>
        <span className="track-sub">{track.artist}</span>
      </span>
      <span className="track-album">{track.album}</span>
      <button
        className={`track-like ${liked[track.id] ? 'is-liked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleLike(track.id);
          toast(liked[track.id] ? 'Removed. No hard feelings.' : 'Saved. Very purr-sonal.', platform);
        }}
        aria-label={liked[track.id] ? 'Unlike' : 'Like'}
      >
        <Heart />
      </button>
      <span className="track-time">{fmtTime(track.duration)}</span>
      <span className="track-menu-wrap">
        <button
          className="track-more"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-label="More options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal />
        </button>
        {menuOpen && (
          <TrackMenu
            track={track}
            platform={platform}
            onClose={() => setMenuOpen(false)}
            onRemove={onRemove}
          />
        )}
      </span>
    </div>
  );
}

/* ── Cards & chips ─────────────────────────────────────────────────────────── */

function CoverPlay({ trackId }: { trackId: string }) {
  const { playTrack } = useApp();
  return (
    <button
      className="cover-play"
      onClick={(e) => {
        e.stopPropagation();
        playTrack(trackId);
      }}
      aria-label="Play"
      tabIndex={-1}
    >
      <Play />
    </button>
  );
}

export function AlbumCard({
  albumId,
  size = 'md',
  platform = 'phone',
  showArtist = true,
}: {
  albumId: string;
  size?: 'sm' | 'md' | 'lg';
  platform?: Platform;
  showArtist?: boolean;
}) {
  const album = albumById[albumId];
  const { nav } = useApp();
  if (!album) return null;
  return (
    <div
      className={`media-card media-card--${size}`}
      role="button"
      tabIndex={0}
      onClick={() => nav(platform, 'album', album.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') nav(platform, 'album', album.id);
      }}
    >
      <div className="media-cover">
        <Art palette={album.palette} variant={album.art} radius={size === 'sm' ? 14 : 18} image={album.image} />
        <CoverPlay trackId={album.trackIds[0]} />
      </div>
      <span className="media-title">{album.title}</span>
      {showArtist && (
        <span className="media-sub">
          {album.artist} · {album.year}
        </span>
      )}
    </div>
  );
}

export function PlaylistCard({
  playlistId,
  size = 'md',
  platform = 'phone',
  showCurator = false,
}: {
  playlistId: string;
  size?: 'sm' | 'md' | 'lg';
  platform?: Platform;
  showCurator?: boolean;
}) {
  const playlist = playlistById[playlistId];
  const { nav } = useApp();
  if (!playlist) return null;
  return (
    <div
      className={`media-card media-card--${size}`}
      role="button"
      tabIndex={0}
      onClick={() => nav(platform, 'playlist', playlist.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') nav(platform, 'playlist', playlist.id);
      }}
    >
      <div className="media-cover">
        <Art palette={playlist.palette} variant={playlist.art} radius={size === 'sm' ? 14 : 18} image={playlist.image} />
        <CoverPlay trackId={playlist.trackIds[0]} />
      </div>
      <span className="media-title">{playlist.title}</span>
      <span className="media-sub">
        {showCurator ? playlist.curator : `${playlist.trackIds.length} songs`}
      </span>
    </div>
  );
}

export function ArtistChip({
  artistId,
  platform = 'phone',
  size = 34,
  sub,
}: {
  artistId: string;
  platform?: Platform;
  size?: number;
  sub?: string;
}) {
  const artist = artistById[artistId];
  const { nav } = useApp();
  if (!artist) return null;
  return (
    <button className="artist-chip" onClick={() => nav(platform, 'artist', artist.id)}>
      <Avatar name={artist.name} palette={artist.palette} variant={artist.art} size={size} image={artist.image} />
      <span className="artist-chip-text">
        <span className="artist-chip-name">{artist.name}</span>
        {(sub ?? artist.tagline) && <span className="artist-chip-sub">{sub ?? artist.tagline}</span>}
      </span>
    </button>
  );
}

/* ── Inputs ────────────────────────────────────────────────────────────────── */

export function SearchBar({
  value,
  onChange,
  placeholder = 'Songs, artists, playlists',
  hint,
  onClear,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  onClear?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="searchbar">
      <Search className="searchbar-icon" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search Mewzak"
        enterKeyHint="search"
      />
      {value ? (
        <button
          className="searchbar-clear"
          onClick={() => {
            onChange('');
            onClear?.();
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <X />
        </button>
      ) : (
        hint && <span className="kbd">{hint}</span>
      )}
    </div>
  );
}

export function Seg<T extends string>({
  value,
  options,
  onChange,
  className = '',
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={`seg ${className}`} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={value === o.value ? 'is-on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      className={`toggle ${checked ? 'is-on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

/* ── Feedback ──────────────────────────────────────────────────────────────── */

export function ToastHost({ scope }: { scope: Platform }) {
  const { toasts, dismissToast } = useApp();
  const shown = toasts.filter((t) => t.scope === scope || t.scope === 'both');
  return (
    <div className={`toast-host toast-host--${scope}`} aria-live="polite">
      {shown.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`} role="status">
          <span className="toast-paw">
            <PawPrint />
          </span>
          <span className="toast-msg">{t.msg}</span>
          {t.actionLabel && (
            <button
              className="toast-action"
              onClick={() => {
                t.onAction?.();
                dismissToast(t.id);
              }}
            >
              {t.actionLabel}
            </button>
          )}
          <button className="toast-x" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            <X />
          </button>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
  state = 'sleeping',
  size = 116,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  state?: 'idle' | 'sleeping' | 'error' | 'loading' | 'happy';
  size?: number;
}) {
  return (
    <div className="empty">
      <Mascot state={state} size={size} />
      <h4>{title}</h4>
      <p>{body}</p>
      {action && (
        <button className="btn btn--soft" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

export function Skeleton({
  h = 14,
  w = '100%',
  r = 8,
  className = '',
}: {
  h?: number | string;
  w?: number | string;
  r?: number;
  className?: string;
}) {
  return (
    <span
      className={`skel ${className}`}
      style={{ height: h, width: w, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skel-card">
      <Skeleton h="auto" w="100%" r={16} className="skel-square" />
      <Skeleton h={12} w="75%" />
      <Skeleton h={10} w="52%" />
    </div>
  );
}

export function CopyChip({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`copy-chip ${done ? 'is-done' : ''}`}
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => undefined);
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }}
      aria-label={`Copy ${value}`}
    >
      {done ? <Check /> : <span className="copy-chip-dot" />}
      {value}
    </button>
  );
}

export function IconNote({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="icon-note">
      {icon}
      {children}
    </span>
  );
}

export type { Album, Artist, Playlist, Track };
