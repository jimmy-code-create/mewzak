import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  Airplay,
  BatteryFull,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  ExternalLink,
  Focus,
  Heart,
  ListMusic,
  MoreHorizontal,
  Moon,
  Pause,
  Play,
  Plus,
  Quote,
  RotateCw,
  Settings as SettingsIcon,
  Shuffle,
  Signal,
  SkipForward,
  SlidersHorizontal,
  Sparkles,
  Car,
  Bed,
  AudioLines,
  Music2,
  Piano,
  Waves,
  Wifi,
  UserCheck,
  UserPlus,
  Check,
} from 'lucide-react';
import { useApp, type ScreenName } from '../store';
import {
  albumById,
  albums,
  artistById,
  artists,
  categories,
  fmtTime,
  formatCount,
  displayNameFor,
  lyrics,
  moods,
  palettes,
  playlistById,
  playlists,
  totalLabel,
  trackById,
  tracks,
} from '../data';
import { useSourceSearch } from '../product/search';
import { Logo, Mascot } from '../components/Brand';
import {
  AlbumCard,
  Art,
  ArtistChip,
  Avatar,
  EmptyState,
  Eq,
  PlayButton,
  PlayCollectionButton,
  PlaylistCard,
  ScrubBar,
  ScrubRow,
  SearchBar,
  Seg,
  Skeleton,
  SkeletonCard,
  ToastHost,
  Toggle,
  TrackRow,
  artVars,
} from '../components/ui';

const CATEGORY_ICONS: Record<string, typeof Moon> = {
  Moon,
  Focus,
  CloudRain,
  Sparkles,
  Waves,
  Bed,
  Music2,
  Piano,
  AudioLines,
  Car,
};

/* ── Chrome ───────────────────────────────────────────────────────────────── */

function StatusBar({ os, light = false }: { os: 'ios' | 'android'; light?: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return (
    <div className={`ph-status ${light ? 'ph-status--light' : ''}`} aria-hidden="true">
      <span className="ph-time">{time}</span>
      <span className="ph-status-icons">
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={18} />
      </span>
      {os === 'ios' ? <span className="island" /> : <span className="punch" />}
    </div>
  );
}

function HomeIndicator({ os, light = false }: { os: 'ios' | 'android'; light?: boolean }) {
  return (
    <span
      className={`home-indicator ${os === 'android' ? 'home-indicator--android' : ''} ${
        light ? 'home-indicator--light' : ''
      }`}
      aria-hidden="true"
    />
  );
}

export function PhoneTabBar({
  active,
  onTab,
}: {
  active: 'home' | 'search' | 'library' | null;
  onTab: (s: ScreenName) => void;
}) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'search' as const, label: 'Search', icon: SearchIcon },
    { id: 'library' as const, label: 'Library', icon: LibraryIcon },
  ];
  return (
    <nav className="ph-tabbar glass" aria-label="Primary">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            className={`ph-tab ${active === t.id ? 'is-on' : ''}`}
            onClick={() => onTab(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
          >
            <Icon />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.6 12 3.6l8.5 7v8.1a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z" />
      <path d="M9.4 20.5v-6.2h5.2v6.2" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}
function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5v13M8.6 5.5v13" />
      <path d="m13 6.3 5.4 12.1" />
    </svg>
  );
}

export function MiniPlayer() {
  const { track, playing, toggle, next, nav, progress } = useApp();
  const pct = Math.min(100, (progress / track.duration) * 100);
  return (
    <div
      className="ph-mini glass"
      style={artVars(track.palette)}
      role="button"
      tabIndex={0}
      onClick={() => nav('phone', 'nowplaying')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') nav('phone', 'nowplaying');
      }}
      aria-label="Open now playing"
    >
      <Art palette={track.palette} variant={track.art} radius={11} className="mini-art" image={track.image} />
      <span className="mini-copy">
        <span className="mini-title">{track.title}</span>
        <span className="mini-artist">{track.artist}</span>
      </span>
      <button
        className="mini-btn"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
      </button>
      <button
        className="mini-btn"
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        aria-label="Next track"
      >
        <SkipForward size={17} />
      </button>
      <span className="mini-progress" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

function PhoneTop({
  title,
  onBack,
  actions,
  transparent = false,
}: {
  title: string;
  onBack: () => void;
  actions?: ReactNode;
  transparent?: boolean;
}) {
  return (
    <div className={`ph-topbar ${transparent ? 'ph-topbar--clear' : ''}`}>
      <button className="ph-back" onClick={onBack} aria-label="Back">
        <ChevronLeft />
      </button>
      <span className="ph-topbar-title">{title}</span>
      <div className="ph-topbar-actions">{actions}</div>
    </div>
  );
}

/* ── Home ─────────────────────────────────────────────────────────────────── */

function HomeSkeleton() {
  return (
    <div className="ph-home-skel">
      <Skeleton h={168} r={26} />
      <div className="ph-rail-skel">
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <Skeleton h={18} w="42%" />
      <div className="ph-grid">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

function HomeScreen() {
  const { track, playing, nav, toast, profile, playCollection } = useApp();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = profile?.name ?? 'Listener';
  const first = name.split(/\s+/)[0];
  const initials = displayNameFor(name).initials;

  const madeForYou = playlists
    .filter((item) => item.curator === 'Mewzak' && item.id !== 'liked-songs' && item.trackIds.length > 0)
    .slice(0, 8)
    .map((item) => item.id);
  const recent = albums.slice(0, 6).map((album) => album.id);
  const pickedTracks = tracks.slice(0, 6).map((item) => item.id);
  const deepCuts = tracks.slice(6, 12).map((item) => item.id);

  return (
    <div className="ph-page ph-home">
      <header className="ph-home-head">
        <div>
          <span className="eyebrow">
            {now.toLocaleDateString(undefined, { weekday: 'long' })} ·{' '}
            {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
          <h1 className="display">
            {greeting},
            <br />
            <em>{first}.</em>
          </h1>
        </div>
        <button className="ph-avatar" onClick={() => nav('phone', 'profile')} aria-label="Open profile">
          <span>{initials}</span>
        </button>
      </header>

      <div className="ph-home-tools">
        <p>Real music from Audius, picked softly.</p>
      </div>

      <>
        <>
          <section className="ph-hero" style={artVars(track.palette)} onClick={() => nav('phone', 'nowplaying')}>
            <div className="ph-hero-body">
              <span className="ph-hero-label">
                <span className="ph-live-dot" />
                {playing ? 'Continue listening' : 'Pick up where you left off'}
              </span>
              <h2 className="display">{track.title}</h2>
              <p className="ph-hero-sub">
                {track.artist} · From your queue
              </p>
              <div className="ph-hero-row">
                <PlayButton size={44} />
                <button
                  className="ph-hero-open"
                  onClick={(e) => {
                    e.stopPropagation();
                    nav('phone', 'nowplaying');
                  }}
                >
                  {playing ? 'Now playing' : 'Paused'} <ChevronRight size={13} />
                </button>
              </div>
            </div>
            <div className="ph-hero-artwrap">
              <Art palette={track.palette} variant={track.art} radius={18} image={track.image} />
            </div>
          </section>

          <div className="ph-moods scroll-x">
            {moods.slice(0, 4).map((m) => (
              <button key={m.label} className="chip" onClick={() => nav('phone', 'playlist', m.playlist)}>
                {m.label}
              </button>
            ))}
            <button className="chip" onClick={() => nav('phone', 'search')}>
              More moods
            </button>
          </div>

          <section className="ph-section">
            <SectionHead
              title="Made for you"
              action="All playlists"
              onAction={() => nav('phone', 'library')}
            />
            <div className="ph-rail scroll-x">
              {madeForYou.map((id) => (
                <div className="ph-rail-item" key={id}>
                  <PlaylistCard playlistId={id} size="sm" platform="phone" />
                </div>
              ))}
            </div>
          </section>

          <section className="ph-section">
            <SectionHead title="Jump back in" action="Library" onAction={() => nav('phone', 'library')} />
            <div className="ph-grid">
              {recent.map((id) => (
                <AlbumCard key={id} albumId={id} platform="phone" />
              ))}
            </div>
          </section>

          <section className="ph-section">
            <SectionHead title="Fresh from Audius" action="Search" onAction={() => nav('phone', 'search')} />
            <div className="ph-list">
              {pickedTracks.map((id) => (
                <TrackRow
                  key={id}
                  trackId={id}
                  platform="phone"
                  variant="phone"
                  contextIds={pickedTracks}
                />
              ))}
            </div>
          </section>

          {deepCuts.length ? (
            <section className="ph-section">
              <SectionHead title="Deep cuts" action="Search" onAction={() => nav('phone', 'search')} />
              <div className="ph-list">
                {deepCuts.map((id) => (
                  <TrackRow
                    key={id}
                    trackId={id}
                    platform="phone"
                    variant="phone"
                    contextIds={deepCuts}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <button
            className="ph-quiet-card"
            onClick={() => {
              const ids = playlistById['late-night-purr']?.trackIds ?? [];
              if (ids.length) {
                playCollection(ids);
                toast('A quiet mix from Audius. Playing.', 'phone');
              } else {
                nav('phone', 'search');
              }
            }}
          >
            <span className="ph-quiet-icon">
              <Moon size={17} />
            </span>
            <span>
              <strong>A quiet mix, just for tonight</strong>
              <span>
                {playlistById['late-night-purr']?.trackIds.length ?? 0} songs, no sudden movements.
              </span>
            </span>
            <ChevronRight size={16} />
          </button>

          <p className="ph-signoff">Soft paws, all day. Music from Audius.</p>
        </>
      </>
    </div>
  );
}

function SectionHead({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="ph-sec-head">
      <h3>{title}</h3>
      {action && (
        <button onClick={onAction}>
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}

/* ── Search ───────────────────────────────────────────────────────────────── */

function SearchScreen() {
  const { nav, mode, searchHistory, clearSearchHistory } = useApp();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const remote = useSourceSearch(q, mode === 'product');

  const trackResults = useMemo(() => {
    if (mode === 'product') return remote.results.slice(0, 6);
    return tracks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.artist.toLowerCase().includes(term) ||
          t.album.toLowerCase().includes(term),
      )
      .slice(0, 4);
  }, [mode, remote.results, term]);
  const artistResults = useMemo(
    () =>
      artists
        .filter((a) => a.name.toLowerCase().includes(term) || a.tagline.toLowerCase().includes(term))
        .slice(0, 3),
    [term],
  );
  const playlistResults = useMemo(
    () =>
      playlists
        .filter((p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
        .slice(0, 5),
    [term],
  );

  const hasResults = trackResults.length + artistResults.length + playlistResults.length > 0;
  const searching = mode === 'product' && remote.loading;
  const searchError = mode === 'product' ? remote.error : null;

  return (
    <div className="ph-page ph-search-page">
      <header className="ph-page-head">
        <div>
          <span className="eyebrow">Find your next purr</span>
          <h1 className="display">Search</h1>
        </div>
        <span className="ph-head-mark" aria-hidden="true">
          <SearchGlyph />
        </span>
      </header>

      <SearchBar value={q} onChange={setQ} />

      {!q.trim() ? (
        <>
          <div className="ph-sec-head ph-sec-head--tight">
            <h3>Browse all</h3>
            <span className="ph-count">{categories.length} moods</span>
          </div>
          <div className="ph-cat-grid">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.icon] ?? Moon;
              const colors = palettes[c.palette].colors;
              return (
                <button
                  key={c.name}
                  className="ph-cat"
                  onClick={() => nav('phone', 'playlist', c.playlist)}
                  style={{ background: `linear-gradient(140deg, ${colors[0]}, ${colors[1]})` }}
                >
                  <span className="art-grain" />
                  <span className="ph-cat-icon">
                    <Icon size={17} />
                  </span>
                  <span className="ph-cat-name">{c.name}</span>
                </button>
              );
            })}
          </div>
          {searchHistory.length > 0 && (
            <div className="ph-recent-searches">
              <div className="ph-sec-head ph-sec-head--tight">
                <span className="eyebrow">Recent searches</span>
                <button onClick={clearSearchHistory}>Clear</button>
              </div>
              <div className="ph-moods scroll-x">
                {searchHistory.map((r) => (
                  <button key={r} className="chip" onClick={() => setQ(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="ph-search-source">Streaming catalogue supplied by Audius.</p>
        </>
      ) : searching ? (
        <div className="ph-search-loading" role="status" aria-live="polite">
          <Skeleton h={52} r={12} />
          <Skeleton h={52} r={12} />
          <Skeleton h={52} r={12} />
          <span>Searching Audius…</span>
        </div>
      ) : searchError ? (
        <EmptyState
          state="error"
          title="Search tripped over its tail."
          body="Audius did not answer. Nothing was lost; try the same words again."
          action="Retry search"
          onAction={remote.retry}
        />
      ) : !hasResults ? (
        <EmptyState
          state="sleeping"
          title="No matches. Cats are picky; we’re not."
          body={`Nothing for “${q.trim()}” yet. Try a mood, an artist, or one of these.`}
          action="Clear search"
          onAction={() => setQ('')}
        />
      ) : (
        <div className="ph-results">
          {artistResults.length > 0 && (
            <section className="ph-section ph-section--tight">
              <h3 className="ph-result-head">Artists</h3>
              <div className="ph-artist-list">
                {artistResults.map((a) => (
                  <ArtistChip key={a.id} artistId={a.id} platform="phone" size={44} />
                ))}
              </div>
            </section>
          )}

          {playlistResults.length > 0 && (
            <section className="ph-section ph-section--tight">
              <h3 className="ph-result-head">Playlists</h3>
              <div className="ph-rail scroll-x">
                {playlistResults.map((p) => (
                  <div className="ph-rail-item" key={p.id}>
                    <PlaylistCard playlistId={p.id} size="sm" platform="phone" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {trackResults.length > 0 && (
            <section className="ph-section ph-section--tight">
              <h3 className="ph-result-head">Songs</h3>
              <div className="ph-list">
                {trackResults.map((t) => (
                  <TrackRow
                    key={t.id}
                    trackId={t.id}
                    platform="phone"
                    variant="phone"
                    contextIds={trackResults.map((item) => item.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 40 40" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="18" cy="18" r="10.5" opacity="0.5" />
      <path d="m25.5 25.5 8 8" opacity="0.5" />
      <path d="M13 20c2 2 4 2 6 0" opacity="0.8" />
    </svg>
  );
}

/* ── Library ──────────────────────────────────────────────────────────────── */

function LibraryScreen() {
  const { nav, openPlaylistManager } = useApp();
  const [tab, setTab] = useState<'playlists' | 'artists' | 'albums'>('playlists');
  const liked = playlistById['liked-songs'];
  const libraryPlaylists = playlists.filter((p) => p.id !== 'liked-songs').slice(0, 8);

  return (
    <div className="ph-page ph-library">
      <header className="ph-page-head">
        <div>
          <span className="eyebrow">Everything you kept</span>
          <h1 className="display">Your library</h1>
        </div>
        <div className="ph-head-actions">
          <button
            className="icon-btn ph-add-btn"
            onClick={() => openPlaylistManager()}
            aria-label="Create or manage playlists"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <div className="ph-filter-row scroll-x">
        <Seg
          value={tab}
          options={[
            { value: 'playlists', label: 'Playlists' },
            { value: 'artists', label: 'Artists' },
            { value: 'albums', label: 'Albums' },
          ]}
          onChange={setTab}
          className="ph-lib-seg"
        />
      </div>

      {tab === 'playlists' && (
        <div className="ph-lib-list">
          <button className="ph-lib-row ph-lib-row--liked" onClick={() => nav('phone', 'playlist', liked.id)}>
            <span className="liked-cover">
              <Heart size={20} fill="currentColor" />
            </span>
            <span className="ph-lib-copy">
              <strong>Liked Songs</strong>
              <span>
                {liked.trackIds.length} {liked.trackIds.length === 1 ? 'song' : 'songs'} · Kept warm
              </span>
            </span>
            <ChevronRight size={16} />
          </button>
          {libraryPlaylists.map((p) => (
            <button className="ph-lib-row" key={p.id} onClick={() => nav('phone', 'playlist', p.id)}>
              <Art palette={p.palette} variant={p.art} radius={12} image={p.image} />
              <span className="ph-lib-copy">
                <strong>{p.title}</strong>
                <span>
                  Playlist · {p.trackIds.length} songs
                </span>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
          <button className="ph-create-row" onClick={() => openPlaylistManager()}>
            <span className="ph-create-icon">
              <Plus size={18} />
            </span>
            <span>Create or manage playlists</span>
          </button>
        </div>
      )}

      {tab === 'artists' && (
        <div className="ph-lib-list ph-artists-list">
          {artists.slice(0, 8).map((a) => (
            <ArtistChip
              key={a.id}
              artistId={a.id}
              platform="phone"
              size={48}
              sub={a.followers != null ? `${formatCount(a.followers)} followers on Audius` : 'On Audius'}
            />
          ))}
        </div>
      )}

      {tab === 'albums' && (
        <div className="ph-grid ph-grid--library">
          {albums.slice(0, 8).map((a) => (
            <AlbumCard key={a.id} albumId={a.id} platform="phone" size="sm" />
          ))}
        </div>
      )}

    </div>
  );
}

/* ── Detail screens ───────────────────────────────────────────────────────── */

function DetailActions({
  trackIds,
  onToast,
}: {
  trackIds: string[];
  onToast: (msg: string) => void;
}) {
  const { shuffle, setShuffle, openPlaylistManager } = useApp();
  const first = trackById[trackIds[0]];
  return (
    <div className="ph-actions">
      <PlayCollectionButton trackIds={trackIds} size={52} />
      <button
        className={`ph-action ${shuffle ? 'is-on' : ''}`}
        onClick={() => {
          setShuffle(!shuffle);
          onToast(shuffle ? 'Shuffle off. Order restored.' : 'Shuffled. Order is a suggestion.');
        }}
        aria-label="Shuffle"
      >
        <Shuffle size={17} />
      </button>
      <button
        className="ph-action"
        onClick={async () => {
          if (!first?.sourceUrl) return;
          if (navigator.share) {
            await navigator.share({ title: `${first.title} — ${first.artist}`, url: first.sourceUrl }).catch(() => undefined);
          } else {
            await navigator.clipboard?.writeText(first.sourceUrl).catch(() => undefined);
            onToast('Link copied.');
          }
        }}
        aria-label="Share"
      >
        <Quote size={17} />
      </button>
      <button className="ph-action ph-action--last" onClick={() => openPlaylistManager()} aria-label="Add to playlist">
        <Plus size={17} />
      </button>
    </div>
  );
}

function PlaylistScreen() {
  const { route, back, nav, toast, openPlaylistManager } = useApp();
  const routeInfo = route('phone');
  const pl = playlistById[routeInfo.id ?? 'late-night-purr'] ?? playlists[0];
  const plTracks = pl.trackIds.map((id) => trackById[id]).filter(Boolean);
  const leadArtist = artistById[plTracks[0]?.artistId];

  return (
    <div className="ph-page ph-detail">
      <PhoneTop
        title="Playlist"
        onBack={() => back('phone')}
        actions={
          <button
            className="icon-btn"
            aria-label={pl.user ? 'Manage playlist' : 'Playlist options'}
            onClick={() => {
              if (pl.user) openPlaylistManager(pl.id);
              else toast('Curated by Mewzak. Tracks stream from Audius.', 'phone');
            }}
          >
            <MoreHorizontal size={17} />
          </button>
        }
      />

      <section className="ph-detail-hero" style={artVars(pl.palette)}>
        <div className="ph-detail-glow" aria-hidden="true" />
        <Art palette={pl.palette} variant={pl.art} radius={22} className="ph-detail-art" alt={`${pl.title} cover`} image={pl.image} />
        <div className="ph-detail-copy">
          <span className="eyebrow">{pl.curator === 'Mewzak' ? 'Mewzak playlist' : 'Your playlist'}</span>
          <h1 className="display">{pl.title}</h1>
          <p>{pl.description}</p>
          <span className="ph-meta">
            {pl.trackIds.length} songs · {totalLabel(pl.trackIds)} · {pl.updated}
          </span>
        </div>
      </section>

      <DetailActions trackIds={pl.trackIds} onToast={(m) => toast(m, 'phone')} />

      <div className="ph-list">
        {plTracks.map((t, i) => (
          <TrackRow
            key={t.id}
            trackId={t.id}
            index={i}
            platform="phone"
            variant="phone"
            contextIds={pl.trackIds}
          />
        ))}
      </div>

      <button
        className="ph-artist-credit"
        onClick={() => (pl.user ? openPlaylistManager(pl.id) : leadArtist && nav('phone', 'artist', leadArtist.id))}
      >
        {leadArtist ? (
          <Avatar
            name={leadArtist.name}
            palette={leadArtist.palette}
            variant={leadArtist.art}
            size={36}
            image={leadArtist.image}
          />
        ) : (
          <span className="ph-radio-badge">
            <ListMusic size={16} />
          </span>
        )}
        <span>
          <span className="eyebrow">{pl.user ? 'On this device' : 'Curated by'}</span>
          <strong>{pl.user ? pl.title : leadArtist ? `Mewzak, with ${leadArtist.name}` : 'Mewzak'}</strong>
        </span>
        <ChevronRight size={15} />
      </button>
      <p className="ph-signoff">Made with soft paws. Streamed from Audius.</p>
    </div>
  );
}

function AlbumScreen() {
  const { route, back, nav, toast, openPlaylistManager } = useApp();
  const routeInfo = route('phone');
  const album = albumById[routeInfo.id ?? 'slow-parade'] ?? albums[0];
  const albumTracks = album.trackIds.map((id) => trackById[id]).filter(Boolean);
  const artist = artistById[album.artistId];
  const lead = albumTracks[0];

  return (
    <div className="ph-page ph-detail ph-album">
      <PhoneTop
        title="Album"
        onBack={() => back('phone')}
        actions={
          <button
            className="icon-btn"
            aria-label="Share album"
            onClick={async () => {
              if (!lead?.sourceUrl) return;
              if (navigator.share) {
                await navigator.share({ title: `${album.title} — ${album.artist}`, url: lead.sourceUrl }).catch(() => undefined);
              } else {
                await navigator.clipboard?.writeText(lead.sourceUrl).catch(() => undefined);
                toast('Link copied.', 'phone');
              }
            }}
          >
            <Quote size={17} />
          </button>
        }
      />
      <section className="ph-detail-hero ph-album-hero" style={artVars(album.palette)}>
        <div className="ph-detail-glow" aria-hidden="true" />
        <Art palette={album.palette} variant={album.art} radius={24} className="ph-album-art" alt={`${album.title} cover`} image={album.image} />
        <div className="ph-detail-copy">
          <span className="eyebrow">Collection · {album.year}</span>
          <h1 className="display">{album.title}</h1>
          <button className="ph-inline-artist" onClick={() => nav('phone', 'artist', album.artistId)}>
            <Avatar
              name={album.artist}
              palette={album.palette}
              variant={album.art}
              size={20}
              image={artist?.image}
            />
            {album.artist}
          </button>
          <span className="ph-meta">
            {album.trackIds.length} songs · {totalLabel(album.trackIds)}
          </span>
        </div>
      </section>

      <div className="ph-actions ph-actions--center">
        <PlayCollectionButton trackIds={album.trackIds} size={52} />
        <button
          className="ph-action"
          onClick={async () => {
            if (!lead?.sourceUrl) return;
            if (navigator.share) {
              await navigator.share({ title: `${album.title} — ${album.artist}`, url: lead.sourceUrl }).catch(() => undefined);
            } else {
              await navigator.clipboard?.writeText(lead.sourceUrl).catch(() => undefined);
              toast('Link copied.');
            }
          }}
          aria-label="Share"
        >
          <Quote size={17} />
        </button>
        <button className="ph-action" onClick={() => openPlaylistManager()} aria-label="Add to playlist">
          <Plus size={17} />
        </button>
        {lead?.sourceUrl && (
          <a className="ph-action" href={lead.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open on Audius">
            <ExternalLink size={17} />
          </a>
        )}
      </div>

      <div className="ph-list">
        {albumTracks.map((t, i) => (
          <TrackRow
            key={t.id}
            trackId={t.id}
            index={i}
            platform="phone"
            variant="phone"
            contextIds={album.trackIds}
          />
        ))}
      </div>

      <section className="ph-about">
        <span className="eyebrow">About this collection</span>
        <p>{album.blurb}</p>
        <div className="ph-about-meta">
          <span>Released</span>
          <strong>{album.year}</strong>
          <span>Length</span>
          <strong>{totalLabel(album.trackIds)}</strong>
          <span>Source</span>
          <strong>Audius</strong>
        </div>
      </section>

      {artist && (
        <button className="ph-artist-credit" onClick={() => nav('phone', 'artist', artist.id)}>
          <Avatar name={artist.name} palette={artist.palette} variant={artist.art} size={36} image={artist.image} />
          <span>
            <span className="eyebrow">Artist</span>
            <strong>{artist.name}</strong>
          </span>
          <ChevronRight size={15} />
        </button>
      )}
      <p className="ph-signoff">Streamed from Audius. Played loudly enough.</p>
    </div>
  );
}

function ArtistScreen() {
  const { route, back, nav, toast, playCollection, setShuffle } = useApp();
  const routeInfo = route('phone');
  const artist = artistById[routeInfo.id ?? 'luna-vale'] ?? artists[0];
  const [following, setFollowing] = useState(false);
  const artistAlbums = albums.filter((a) => a.artistId === artist.id);
  const top = artist.topTracks.map((id) => trackById[id]).filter(Boolean);
  const genres = Array.from(new Set(top.map((item) => item.genre).filter(Boolean))).slice(0, 3);

  return (
    <div className="ph-page ph-detail ph-artist-page">
      <PhoneTop
        title="Artist"
        onBack={() => back('phone')}
        actions={
          <button
            className="icon-btn"
            aria-label="Share artist"
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({ title: artist.name, text: `Listen to ${artist.name} on Mewzak` }).catch(() => undefined);
              } else {
                await navigator.clipboard?.writeText(artist.name).catch(() => undefined);
                toast('Artist name copied.', 'phone');
              }
            }}
          >
            <Quote size={17} />
          </button>
        }
      />
      <section className="ph-artist-hero" style={artVars(artist.palette)}>
        <div className="ph-artist-glow" aria-hidden="true" />
        <Avatar name={artist.name} palette={artist.palette} variant={artist.art} size={112} className="ph-artist-avatar" image={artist.image} />
        <span className="eyebrow">Artist · Audius</span>
        <h1 className="display">{artist.name}</h1>
        <p className="ph-artist-tagline">{artist.tagline}</p>
        <span className="ph-meta">
          {artist.followers != null ? `${formatCount(artist.followers)} followers on Audius` : 'Streaming from Audius'}
        </span>
        <div className="ph-artist-actions">
          <PlayCollectionButton trackIds={artist.topTracks} size={48} />
          <button
            className={`ph-follow ${following ? 'is-on' : ''}`}
            onClick={() => {
              setFollowing(!following);
              toast(following ? 'Unfollowed. We’ll keep it quiet.' : 'Following. Whiskers on the pulse.', 'phone');
            }}
          >
            {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            className="ph-action"
            onClick={() => {
              setShuffle(true);
              playCollection(top.map((item) => item.id));
              toast('Artist radio, shuffled. Real tracks from Audius.', 'phone');
            }}
            aria-label="Shuffle artist"
          >
            <Shuffle size={16} />
          </button>
        </div>
      </section>

      <section className="ph-section ph-section--tight">
        <div className="ph-sec-head">
          <h3>Popular</h3>
          <button onClick={() => playCollection(top.map((item) => item.id))}>
            Play <ChevronRight size={13} />
          </button>
        </div>
        <div className="ph-list">
          {top.map((t, i) => (
            <TrackRow
              key={t.id}
              trackId={t.id}
              index={i}
              platform="phone"
              variant="phone"
              contextIds={artist.topTracks}
            />
          ))}
        </div>
      </section>

      <section className="ph-section">
        <div className="ph-sec-head">
          <h3>Releases</h3>
        </div>
        <div className="ph-rail scroll-x">
          {artistAlbums.map((a) => (
            <div className="ph-rail-item" key={a.id}>
              <AlbumCard albumId={a.id} platform="phone" size="sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="ph-about">
        <span className="eyebrow">About</span>
        <p>{artist.bio}</p>
        <div className="ph-genre-row">
          {(genres.length ? genres : [artist.tagline]).map((genre) => (
            <span key={genre as string} className="chip chip--solid">
              {genre}
            </span>
          ))}
        </div>
      </section>

      <button className="ph-artist-credit" onClick={() => nav('phone', 'profile')}>
        <span className="ph-radio-badge">
          <Sparkles size={16} />
        </span>
        <span>
          <span className="eyebrow">Station</span>
          <strong>{artist.name} Radio</strong>
        </span>
        <ChevronRight size={15} />
      </button>
      <p className="ph-signoff">Artists are people. Be soft to them.</p>
    </div>
  );
}

/* ── Now Playing ──────────────────────────────────────────────────────────── */

function NowPlayingSheet() {
  const { back, nav, track, liked, toggleLike, toast, volume, setVolume, openPlaylistManager } = useApp();
  const isLiked = !!liked[track.id];

  return (
    <div className="np" style={artVars(track.palette)} data-theme="dark">
      <div className="np-bg" aria-hidden="true">
        <Art palette={track.palette} variant={track.art} radius={0} className="np-wash" image={track.image} />
        <span className="np-shade" />
      </div>

      <div className="np-top">
        <button className="np-icon" onClick={() => back('phone')} aria-label="Close now playing">
          <ChevronDown />
        </button>
        <button className="np-context" onClick={() => nav('phone', 'queue')}>
          <span>Playing from</span>
          <strong>Your queue</strong>
        </button>
        <a
          className="np-icon"
          href={track.sourceUrl || 'https://audius.co'}
          target="_blank"
          rel="noreferrer"
          aria-label="Open on Audius"
        >
          <ExternalLink />
        </a>
      </div>

      <div className="np-art-wrap">
        <Art
          palette={track.palette}
          variant={track.art}
          radius={26}
          className="np-art"
          alt={`Artwork for ${track.title}`}
          image={track.image}
        />
      </div>

      <div className="np-meta">
        <div className="np-title-block">
          <h1 className="display">{track.title}</h1>
          <button onClick={() => nav('phone', 'artist', track.artistId)}>{track.artist}</button>
        </div>
        <div className="np-meta-actions">
          <button
            className={`np-like ${isLiked ? 'is-liked' : ''}`}
            onClick={() => {
              toggleLike(track.id);
              toast(isLiked ? 'Removed. No hard feelings.' : 'Saved. Very purr-sonal.', 'phone');
            }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={19} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button
            className="np-like"
            onClick={() => openPlaylistManager()}
            aria-label="Add to playlist"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="np-scrub">
        <ScrubRow />
      </div>

      <div className="np-controls">
        <Playback />
      </div>

      <div className="np-volume">
        <span className="np-vol-icon">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M4 9.5v5h3.4l4.6 3.8V5.7L7.4 9.5Z" />
            <path d="M15.5 9.4a4 4 0 0 1 0 5.2" />
          </svg>
        </span>
        <input
          className="range range--np"
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          aria-label="Volume"
          style={{ '--pct': `${Math.round(volume * 100)}%` } as CSSProperties}
        />
      </div>

      <div className="np-foot">
        <button onClick={() => nav('phone', 'lyrics')}>
          <Quote size={19} />
          <span>Lyrics</span>
        </button>
        <button onClick={() => nav('phone', 'queue')}>
          <ListMusic size={19} />
          <span>Queue</span>
        </button>
        <a href={track.sourceUrl || 'https://audius.co'} target="_blank" rel="noreferrer">
          <ExternalLink size={19} />
          <span>Audius</span>
        </a>
      </div>
    </div>
  );
}

function Playback() {
  const { shuffle, setShuffle, repeat, cycleRepeat, prev, next, playing, toggle, toeBean } = useApp();
  return (
    <div className="np-controls-row">
      <button
        className={`np-ghost ${shuffle ? 'is-on' : ''}`}
        onClick={() => setShuffle(!shuffle)}
        aria-label="Shuffle"
        title="Shuffle"
      >
        <Shuffle size={19} />
      </button>
      <button className="np-skip" onClick={prev} aria-label="Previous track">
        <SkipPrev />
      </button>
      <button className="np-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pawse' : 'Play'}>
        {playing ? (
          <span className="np-pause">
            <i />
            <i />
            {toeBean && <span className="np-paw"><PawGlyph /></span>}
          </span>
        ) : (
          <Play size={26} fill="currentColor" />
        )}
      </button>
      <button className="np-skip" onClick={next} aria-label="Next track">
        <SkipFwd />
      </button>
      <button
        className={`np-ghost ${repeat !== 'off' ? 'is-on' : ''}`}
        onClick={cycleRepeat}
        aria-label={`Repeat ${repeat}`}
        title={`Repeat ${repeat}`}
      >
        {repeat === 'one' ? <span className="repeat-one">1</span> : <RepeatGlyph />}
      </button>
    </div>
  );
}

function SkipPrev() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" aria-hidden="true">
      <rect x="4.4" y="5.2" width="2.1" height="13.6" rx="1" />
      <path d="M19.5 6.1v11.8c0 1.1-1.2 1.7-2.1 1.1l-8.2-5.9a1.4 1.4 0 0 1 0-2.2l8.2-5.9c.9-.6 2.1 0 2.1 1.1Z" />
    </svg>
  );
}

function SkipFwd() {
  return (
    <svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" aria-hidden="true">
      <rect x="17.5" y="5.2" width="2.1" height="13.6" rx="1" />
      <path d="M4.5 6.1v11.8c0 1.1 1.2 1.7 2.1 1.1l8.2-5.9a1.4 1.4 0 0 0 0-2.2L6.6 5c-.9-.6-2.1 0-2.1 1.1Z" />
    </svg>
  );
}

function RepeatGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m17 2.8 3.2 3.2L17 9.2" />
      <path d="M3.8 11.2V9.6a3.6 3.6 0 0 1 3.6-3.6h12.6" />
      <path d="M7 21.2 3.8 18 7 14.8" />
      <path d="M20.2 12.8v1.6a3.6 3.6 0 0 1-3.6 3.6H4" />
    </svg>
  );
}

function PawGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="15.6" rx="4.9" ry="3.9" />
      <ellipse cx="6.3" cy="10.2" rx="1.9" ry="2.3" />
      <ellipse cx="9.8" cy="7.7" rx="1.9" ry="2.3" />
      <ellipse cx="14.2" cy="7.7" rx="1.9" ry="2.3" />
      <ellipse cx="17.7" cy="10.2" rx="1.9" ry="2.3" />
    </svg>
  );
}

/* ── Queue & Lyrics ───────────────────────────────────────────────────────── */

function QueueScreen() {
  const { queue, currentId, back, nav, removeFromQueue, clearQueue, toast, playing, toggle } = useApp();
  const currentIndex = queue.indexOf(currentId);
  const upNext = (currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue).filter((id) => id !== currentId);
  const track = trackById[currentId];

  return (
    <div className="ph-page ph-queue">
      <PhoneTop
        title="Queue"
        onBack={() => back('phone')}
        actions={
          <button
            className="ph-text-btn"
            onClick={() => {
              clearQueue();
              toast('Queue cleared. Fresh start.', 'phone');
            }}
          >
            Clear
          </button>
        }
      />

      <div className="ph-queue-context">
        <span className="eyebrow">Playing from</span>
        <button onClick={() => nav('phone', 'library')}>
          Your queue <ChevronRight size={13} />
        </button>
      </div>

      <h3 className="ph-queue-label">Now playing</h3>
      <div className="ph-qnow" style={artVars(track.palette)}>
        <Art palette={track.palette} variant={track.art} radius={12} image={track.image} />
        <div className="ph-qnow-copy">
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <Eq />
        <button className="ph-qnow-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>

      <div className="ph-sec-head ph-sec-head--tight">
        <h3>Up next</h3>
        <span className="ph-count">{upNext.length} queued</span>
      </div>

      {upNext.length === 0 ? (
        <EmptyState
          state="sleeping"
          title="Nothing’s next."
          body="A perfect time for a catnap. Or add something soft."
          action="Find music"
          onAction={() => nav('phone', 'search')}
        />
      ) : (
        <div className="ph-list">
          {upNext.map((id, i) => (
            <TrackRow
              key={`${id}-${i}`}
              trackId={id}
              index={i}
              platform="phone"
              variant="phone"
              onRemove={() => removeFromQueue(queue.indexOf(id))}
            />
          ))}
        </div>
      )}
      <p className="ph-signoff">A queue is a suggestion with manners.</p>
    </div>
  );
}

function LyricsScreen() {
  const { track, currentId, progress, seek, back, nav, toast } = useApp();
  const lines = lyrics[currentId];
  const activeIndex = lines
    ? lines.reduce((acc, l, i) => (progress >= l.t ? i : acc), 0)
    : -1;
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!lines || activeIndex < 0) return;
    const container = containerRef.current;
    const el = lineRefs.current[activeIndex];
    if (!container || !el) return;
    const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [activeIndex, lines]);

  return (
    <div className="ph-page ph-lyrics-page">
      <PhoneTop
        title="Lyrics"
        onBack={() => back('phone')}
        actions={
          <span />
        }
      />

      <button className="ph-lyrics-track" onClick={() => nav('phone', 'nowplaying')}>
        <Art palette={track.palette} variant={track.art} radius={10} image={track.image} />
        <span>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </span>
        <span className="ph-lyrics-badge">
          <Quote size={13} /> {lines ? 'Synced' : 'Not provided'}
        </span>
      </button>

      {!lines ? (
        <EmptyState
          state="sleeping"
          title="No lyrics for this one."
          body="Hum along. We won’t tell anyone."
          action="Back to player"
          onAction={() => nav('phone', 'nowplaying')}
        />
      ) : (
        <div className="lyrics-scroll" ref={containerRef}>
          <div className="lyrics-lines">
            {lines.map((l, i) => (
              <button
                key={`${l.t}-${i}`}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className={`lyric-line ${i === activeIndex ? 'is-active' : ''} ${i < activeIndex ? 'is-past' : ''}`}
                onClick={() => seek(l.t)}
              >
                {l.line}
              </button>
            ))}
            <div className="lyrics-end">
              <Mascot state="happy" size={52} />
              <span>Sung softly. Tap a line to jump.</span>
            </div>
          </div>
        </div>
      )}

      <div className="ph-lyrics-foot">
        <span>Lyrics by Mewzak Studio</span>
        <span className="ph-lyrics-credit">·</span>
        <span>{lines ? 'Synced with care' : 'Audius does not provide timed lyrics for this track.'}</span>
      </div>
    </div>
  );
}

/* ── Profile & Settings ───────────────────────────────────────────────────── */

function ProfileScreen() {
  const { nav, likedPlaylistIds, profile, userPlaylists, openPlaylistManager, recent } = useApp();
  const likedAlbums = useMemo(
    () =>
      Array.from(new Set(likedPlaylistIds.map((id) => trackById[id]?.albumId).filter(Boolean))).slice(0, 4) as string[],
    [likedPlaylistIds],
  );
  const name = profile?.name ?? 'Listener';
  const initials = displayNameFor(name).initials;
  const genres = profile?.genres?.length ? profile.genres : [];
  const artistCount = new Set(
    [...likedPlaylistIds, ...recent]
      .map((id) => trackById[id]?.artistId)
      .filter(Boolean),
  ).size;

  return (
    <div className="ph-page ph-profile">
      <header className="ph-page-head">
        <div>
          <span className="eyebrow">Your corner</span>
          <h1 className="display">Profile</h1>
        </div>
        <button className="icon-btn" onClick={() => nav('phone', 'settings')} aria-label="Settings">
          <SettingsIcon size={18} />
        </button>
      </header>

      <section className="ph-profile-card" style={artVars('plum')}>
        <div className="ph-profile-glow" aria-hidden="true" />
        <span className="ph-profile-avatar">{initials}</span>
        <h2 className="display">{name}</h2>
        <span className="ph-handle">{profile?.handle ?? '@listener'}</span>
        <span className="ph-plan-chip">
          <Sparkles size={11} /> On this device
        </span>
      </section>

      <div className="ph-stats">
        <div>
          <strong>{likedPlaylistIds.length}</strong>
          <span>Liked</span>
        </div>
        <div>
          <strong>{userPlaylists.length}</strong>
          <span>Playlists</span>
        </div>
        <div>
          <strong>{artistCount}</strong>
          <span>Artists</span>
        </div>
      </div>

      <section className="ph-card">
        <div className="ph-card-head">
          <div>
            <h3>Your taste</h3>
            <p>Chosen at the door. Still true.</p>
          </div>
          <span className="ph-count">Onboarding</span>
        </div>
        <div className="ph-chip-wrap">
          {genres.length ? (
            genres.map((genre) => (
              <span key={genre} className="chip chip--solid">
                {genre}
              </span>
            ))
          ) : (
            <p className="ph-profile-quiet">No genres picked. The whole room is open.</p>
          )}
        </div>
      </section>

      <section className="ph-section">
        <div className="ph-sec-head">
          <h3>Recently liked</h3>
          <button onClick={() => nav('phone', 'playlist', 'liked-songs')}>
            All <ChevronRight size={13} />
          </button>
        </div>
        {likedAlbums.length ? (
          <div className="ph-rail scroll-x">
            {likedAlbums.map((id) => (
              <div className="ph-rail-item" key={id}>
                <AlbumCard albumId={id} platform="phone" size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            state="sleeping"
            title="Nothing saved yet."
            body="Tap the heart on a track and it will land here."
            action="Find music"
            onAction={() => nav('phone', 'search')}
            size={92}
          />
        )}
      </section>

      <button className="ph-quiet-card" onClick={() => openPlaylistManager()}>
        <span className="ph-quiet-icon">
          <ListMusic size={17} />
        </span>
        <span>
          <strong>Your library is local</strong>
          <span>Likes, playlists and search history stay on this device.</span>
        </span>
        <ChevronRight size={16} />
      </button>

      <button className="btn btn--ghost ph-wide-btn" onClick={() => nav('phone', 'settings')}>
        <SettingsIcon size={15} /> Settings
      </button>
    </div>
  );
}

function SettingsScreen() {
  const {
    back,
    theme,
    setTheme,
    transparency,
    setTransparency,
    motion,
    setMotion,
    toeBean,
    setToeBean,
    toast,
    profile,
    clearCache,
    clearSearchHistory,
    signOut,
    deleteLocalData,
  } = useApp();

  return (
    <div className="ph-page ph-settings">
      <PhoneTop title="Settings" onBack={() => back('phone')} />

      <section className="ph-card">
        <h3 className="ph-card-title">Appearance</h3>
        <div className="ph-set-row">
          <div>
            <strong>Theme</strong>
            <span>Dark by default. Light when the sun’s out.</span>
          </div>
          <Seg
            value={theme}
            options={[
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
            onChange={setTheme}
          />
        </div>
        <div className="ph-set-row">
          <div>
            <strong>Reduced transparency</strong>
            <span>Turn off blur for maximum clarity.</span>
          </div>
          <Toggle
            checked={transparency === 'reduced'}
            onChange={(v) => setTransparency(v ? 'reduced' : 'full')}
            label="Reduced transparency"
          />
        </div>
        <div className="ph-set-row">
          <div>
            <strong>Reduce motion</strong>
            <span>Calmer transitions and a still mascot.</span>
          </div>
          <Toggle checked={!motion} onChange={(v) => setMotion(!v)} label="Reduce motion" />
        </div>
      </section>

      <section className="ph-card">
        <h3 className="ph-card-title">Playback</h3>
        <div className="ph-set-row">
          <div>
            <strong>Toe-bean pause</strong>
            <span>A little paw on the pause button.</span>
          </div>
          <Toggle checked={toeBean} onChange={setToeBean} label="Toe-bean pause icon" />
        </div>
        <div className="ph-set-row">
          <div>
            <strong>Audio quality</strong>
            <span>Audius standard stream · one quality, no fake tiers.</span>
          </div>
        </div>
        <a
          className="ph-set-row ph-set-row--button"
          href="https://audius.co"
          target="_blank"
          rel="noreferrer"
        >
          <div>
            <strong>Music source</strong>
            <span>Audius · open music streaming</span>
          </div>
          <ExternalLink size={16} />
        </a>
      </section>

      <section className="ph-card">
        <h3 className="ph-card-title">Offline & cache</h3>
        <div className="ph-set-row">
          <div>
            <strong>Your library is local</strong>
            <span>Likes, playlists and search history are saved on this device. Audio streams and is not downloaded.</span>
          </div>
        </div>
        <button
          className="ph-set-row ph-set-row--button"
          onClick={() => {
            clearCache();
            clearSearchHistory();
            toast('Session cache cleared. Your saved library is still here.', 'phone');
          }}
        >
          <div>
            <strong>Clear session cache</strong>
            <span>Removes artwork and search cache, not your saves.</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </section>

      <section className="ph-card">
        <h3 className="ph-card-title">Local profile</h3>
        <div className="ph-set-row">
          <div>
            <strong>{profile?.name ?? 'Listener'}</strong>
            <span>
              {profile?.email ? `${profile.email} · account on this device` : `${profile?.handle ?? '@listener'} · no account, no cloud`}
            </span>
          </div>
        </div>
        <button className="ph-set-row ph-set-row--button" onClick={signOut}>
          <div>
            <strong>Sign out</strong>
            <span>Return to onboarding. Saved library stays on this device.</span>
          </div>
          <ChevronRight size={16} />
        </button>
        <button
          className="ph-set-row ph-set-row--button ph-set-row--danger"
          onClick={() => {
            if (window.confirm('Delete your local profile, liked songs, playlists and settings? This cannot be undone.')) {
              deleteLocalData();
            }
          }}
        >
          <div>
            <strong>Delete local data</strong>
            <span>Profile, likes, playlists and settings. This cannot be undone.</span>
          </div>
          <ChevronRight size={16} />
        </button>
      </section>

      <div className="ph-about-version">
        <Logo size={17} />
        <span>Mewzak 0.3.0 · Phase 3</span>
        <span>Music streams from Audius.</span>
      </div>
    </div>
  );
}

/* ── Onboarding ───────────────────────────────────────────────────────────── */

const TASTE_CHIPS = ['Late night', 'Focus', 'Rainy days', 'Bedroom pop', 'Ambient', 'Piano', 'Lo-fi', 'Sunday'];

function OnboardingScreen({ os }: { os: 'ios' | 'android' }) {
  const { jump } = useApp();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  const finish = () => jump('phone', 'home');

  const toggleTaste = (t: string) => {
    setPicked((p) => {
      if (p.includes(t)) return p.filter((x) => x !== t);
      if (p.length >= 3) return p;
      return [...p, t];
    });
  };

  return (
    <div className="ph-onboard" data-theme="dark">
      <div className="ph-onboard-aurora" aria-hidden="true" />
      <header className="ph-onboard-head">
        <Logo size={20} />
        <button onClick={finish}>Skip for now</button>
      </header>

      <div className="ph-onboard-mascot">
        <span className="ph-onboard-halo" aria-hidden="true" />
        <Mascot state={step === 0 ? 'idle' : 'happy'} size={step === 0 ? 176 : 142} />
      </div>

      <div className="ph-onboard-copy">
        {step === 0 && (
          <>
            <span className="eyebrow">Welcome to the quiet side</span>
            <h1 className="display">Mewzak.</h1>
            <p>Music with soft paws. Calm surfaces, clear controls, and nothing shouting for attention.</p>
          </>
        )}
        {step === 1 && (
          <>
            <span className="eyebrow">Make it yours</span>
            <h1 className="display">Pick a few moods.</h1>
            <p>We’ll do the rest. Three is plenty — add more later.</p>
            <div className="ph-onboard-chips">
              {TASTE_CHIPS.map((t) => (
                <button
                  key={t}
                  className={`chip ${picked.includes(t) ? 'is-on' : ''}`}
                  onClick={() => toggleTaste(t)}
                  disabled={!picked.includes(t) && picked.length >= 3}
                >
                  {picked.includes(t) && <Check size={13} />}
                  {t}
                </button>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <span className="eyebrow">All warmed up</span>
            <h1 className="display">You’re all set.</h1>
            <p>Your ears are in good paws. Start with Late Night Purr, or find your own way in.</p>
          </>
        )}
      </div>

      <div className="ph-onboard-foot">
        <div className="ph-onboard-dots" aria-hidden="true">
          <i className={step === 0 ? 'is-on' : ''} />
          <i className={step === 1 ? 'is-on' : ''} />
          <i className={step === 2 ? 'is-on' : ''} />
        </div>
        {step === 0 && (
          <button className="ph-onboard-cta" onClick={() => setStep(1)}>
            Start purring <ChevronRight size={17} />
          </button>
        )}
        {step === 1 && (
          <button className="ph-onboard-cta" onClick={() => setStep(2)}>
            That’s me <Check size={17} />
          </button>
        )}
        {step === 2 && (
          <button className="ph-onboard-cta" onClick={finish}>
            Take me home <ChevronRight size={17} />
          </button>
        )}
        <span className="ph-onboard-legal">Android · iOS · macOS · Windows</span>
      </div>
    </div>
  );
}

/* ── App shell ────────────────────────────────────────────────────────────── */

const FULL_BLEED: ScreenName[] = ['nowplaying', 'onboarding', 'queue', 'lyrics'];
const TAB_NAMES: ScreenName[] = ['home', 'search', 'library'];

export function PhoneApp({ os = 'ios' }: { os?: 'ios' | 'android' }) {
  const { route, back, nav, jump, theme, mode } = useApp();
  // The product runs inside the user's real OS window. Drawing a second clock,
  // signal bar, notch or gesture pill there is duplicate chrome — the phone in
  // the design studio still gets the mock. On every platform (web, iOS,
  // Android, Windows, macOS, Linux) the real system already draws those.
  const product = mode === 'product';
  const screen = route('phone');
  const name = screen.name;
  const fullBleed = FULL_BLEED.includes(name);
  const onArt = name === 'nowplaying' || name === 'onboarding';
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setScrolled(false);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [name, screen.id]);

  const activeTab = TAB_NAMES.includes(name) ? (name as 'home' | 'search' | 'library') : null;

  let body: ReactNode = null;
  switch (name) {
    case 'onboarding':
      body = <OnboardingScreen os={os} />;
      break;
    case 'home':
      body = <HomeScreen />;
      break;
    case 'search':
      body = <SearchScreen />;
      break;
    case 'library':
      body = <LibraryScreen />;
      break;
    case 'playlist':
      body = <PlaylistScreen />;
      break;
    case 'album':
      body = <AlbumScreen />;
      break;
    case 'artist':
      body = <ArtistScreen />;
      break;
    case 'nowplaying':
      body = <NowPlayingSheet />;
      break;
    case 'queue':
      body = <QueueScreen />;
      break;
    case 'lyrics':
      body = <LyricsScreen />;
      break;
    case 'profile':
      body = <ProfileScreen />;
      break;
    case 'settings':
      body = <SettingsScreen />;
      break;
    default:
      body = <HomeScreen />;
  }

  return (
    <div
      className={`phone-screen ph os-${os} ${scrolled ? 'is-shrunk' : ''}`}
      data-theme={theme}
      data-screen={name}
    >
      {!product ? <StatusBar os={os} light={onArt} /> : null}
      {fullBleed ? (
        <div className="ph-fullbleed">{body}</div>
      ) : (
        <div
          className="ph-scroll"
          ref={scrollRef}
          onScroll={(e) => {
            const next = e.currentTarget.scrollTop > 28;
            if (next !== scrolled) setScrolled(next);
          }}
        >
          {body}
        </div>
      )}

      {!fullBleed && (
        <>
          <MiniPlayer />
          <PhoneTabBar active={activeTab} onTab={(s) => jump('phone', s)} />
        </>
      )}

      <ToastHost scope="phone" />
      {!product ? <HomeIndicator os={os} light={onArt} /> : null}
    </div>
  );
}
