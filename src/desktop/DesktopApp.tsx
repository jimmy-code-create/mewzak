import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  AudioLines,
  Check,
  ChevronLeft,
  ChevronRight,
  CloudRain,
  Download,
  ExternalLink,
  Heart,
  Library,
  ListMusic,
  Mic2,
  MonitorSpeaker,
  MoreHorizontal,
  Music2,
  Pause,
  Play,
  Plus,
  Quote,
  RotateCw,
  Search,
  Settings as SettingsIcon,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  UserPlus,
  X,
  Moon,
  Focus,
  Waves,
  Bed,
  Piano,
  Car,
} from 'lucide-react';
import { useApp, type ScreenName } from '../store';
import {
  albumById,
  albums,
  artistById,
  artists,
  categories,
  displayNameFor,
  fmtTime,
  formatCount,
  lyrics,
  palettes,
  playlistById,
  playlists,
  totalLabel,
  trackById,
  tracks,
} from '../data';
import { useSourceSearch } from '../product/search';
import { CatMark, Logo, Mascot } from '../components/Brand';
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
  TransportControls,
  VolumeSlider,
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
  Car,
};

const DEFAULT_IDS: Partial<Record<ScreenName, string>> = {
  playlist: 'late-night-purr',
  album: 'slow-parade',
  artist: 'luna-vale',
};

/* ── Sidebar ──────────────────────────────────────────────────────────────── */

export function Sidebar() {
  const { route, jump, profile, openPlaylistManager } = useApp();
  const screen = route('desktop');

  const navItems = [
    { id: 'home' as ScreenName, label: 'Home', icon: HomeGlyph },
    { id: 'search' as ScreenName, label: 'Search', icon: SearchIconGlyph },
    { id: 'library' as ScreenName, label: 'Your library', icon: Library },
  ];

  return (
    <aside className="dk-side">
      <div className="dk-side-brand">
        <button onClick={() => jump('desktop', 'home')} aria-label="Mewzak home" className="dk-logo-btn">
          <Logo size={21} />
        </button>
        <button
          className="dk-side-search"
          onClick={() => jump('desktop', 'search')}
          aria-label="Search"
          title="Search"
        >
          <Search size={16} />
        </button>
      </div>

      <nav className="dk-nav" aria-label="Main">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            screen.name === item.id ||
            (item.id === 'library' && ['playlist', 'album', 'artist'].includes(screen.name));
          return (
            <button
              key={item.id}
              className={`dk-nav-item ${active ? 'is-on' : ''}`}
              onClick={() => jump('desktop', item.id)}
            >
              <Icon />
              <span>{item.label}</span>
              {item.id === 'search' && <span className="kbd dk-nav-kbd">⌘K</span>}
            </button>
          );
        })}
      </nav>

      <div className="dk-side-sec">
        <span>Your playlists</span>
        <button
          onClick={() => openPlaylistManager()}
          aria-label="Create playlist"
          title="Create playlist"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="dk-side-list">
        <button
          className={`dk-side-playlist is-liked ${screen.id === 'liked-songs' ? 'is-on' : ''}`}
          onClick={() => jump('desktop', 'playlist', 'liked-songs')}
        >
          <span className="dk-liked-mini">
            <Heart size={14} fill="currentColor" />
          </span>
          <span>Liked Songs</span>
        </button>
        {playlists
          .filter((p) => p.id !== 'liked-songs')
          .slice(0, 6)
          .map((p) => (
            <button
              key={p.id}
              className={`dk-side-playlist ${screen.name === 'playlist' && screen.id === p.id ? 'is-on' : ''}`}
              onClick={() => jump('desktop', 'playlist', p.id)}
            >
              <Art palette={p.palette} variant={p.art} radius={7} image={p.image} />
              <span>{p.title}</span>
            </button>
          ))}
      </div>

      <div className="dk-side-foot">
        <button className="dk-user" onClick={() => jump('desktop', 'profile')}>
          <span className="dk-user-avatar">{displayNameFor(profile?.name ?? 'Listener').initials}</span>
          <span>
            <strong>{profile?.name ?? 'Listener'}</strong>
            <span>Local profile · this device</span>
          </span>
        </button>
        <button
          className="ghost-icon"
          onClick={() => jump('desktop', 'settings')}
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon />
        </button>
      </div>
    </aside>
  );
}

function HomeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.6 12 3.6l8.5 7v8.1a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z" />
      <path d="M9.4 20.5v-6.2h5.2v6.2" />
    </svg>
  );
}

function SearchIconGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

/* ── Home ─────────────────────────────────────────────────────────────────── */

function HomePage() {
  const { track, playing, nav, jump, toast, profile, playCollection } = useApp();
  const [loading] = useState(false);
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
  const recent = albums.slice(0, 8).map((album) => album.id);
  const repeatTracks = tracks.slice(0, 8).map((item) => item.id);
  const sunday = playlistById['sunday-loaf'];
  const firstAlbum = albums[0];

  return (
    <div className="dk-page dk-home">
      <header className="dk-page-head">
        <div>
          <span className="eyebrow">
            {now.toLocaleDateString(undefined, { weekday: 'long' })} ·{' '}
            {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
          <h1 className="display">{greeting}, {first}.</h1>
          <p className="dk-page-sub">Real music from Audius, picked softly.</p>
        </div>
        <div className="dk-head-actions">
          <button className="dk-command" onClick={() => jump('desktop', 'search')}>
            <Search size={15} />
            <span>Search Mewzak</span>
            <span className="kbd">⌘K</span>
          </button>
          <button className="dk-head-avatar" onClick={() => jump('desktop', 'profile')} aria-label="Profile">
            {initials}
          </button>
        </div>
      </header>

      <div className="dk-hero-grid">
        <section
          className="dk-feature"
          style={artVars(track.palette)}
          onClick={() => nav('desktop', 'nowplaying')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') nav('desktop', 'nowplaying');
          }}
        >
          <div className="dk-feature-glow" aria-hidden="true" />
          <div className="dk-feature-copy">
            <span className="eyebrow dk-feature-eyebrow">
              <i className={`dk-live-dot ${playing ? 'is-playing' : ''}`} />
              {playing ? 'Continue listening' : 'Pick up where you left off'}
            </span>
            <h2 className="display">{track.title}</h2>
            <p>{track.artist} · From your queue</p>
            <div className="dk-feature-actions">
              <PlayButton size={48} />
              <button
                className="btn btn--ghost btn--sm"
                onClick={(e) => {
                  e.stopPropagation();
                  nav('desktop', 'nowplaying');
                }}
              >
                <ListMusic size={14} /> Open player
              </button>
              <span className="dk-feature-duration">{track.genre ?? 'Audius'} · real stream</span>
            </div>
          </div>
          <div className="dk-feature-art">
            <Art palette={track.palette} variant={track.art} radius={22} image={track.image} />
            <span className="dk-feature-plinth" aria-hidden="true" />
          </div>
          <div className="dk-feature-meta">
            <span className="eyebrow">Mewzak picks</span>
            <span>For slow evenings and clean windows.</span>
          </div>
        </section>

        <button
          className="dk-mini-tile"
          onClick={() => {
            if (sunday) {
              playCollection(sunday.trackIds);
              toast('Sunday Loaf. Playing from Audius.', 'desktop');
            } else {
              jump('desktop', 'library');
            }
          }}
        >
          <Art palette={sunday?.palette ?? 'cream'} variant={sunday?.art ?? 4} radius={14} image={sunday?.image} />
          <span className="dk-mini-tile-copy">
            <span className="eyebrow">Playlist</span>
            <strong>{sunday?.title ?? 'Your library'}</strong>
            <span>Warm, unhurried, nothing to prove.</span>
          </span>
          <span className="dk-tile-play">
            <Play size={14} fill="currentColor" />
          </span>
        </button>

        {firstAlbum && (
          <button className="dk-mini-tile" onClick={() => jump('desktop', 'album', firstAlbum.id)}>
            <Art palette={firstAlbum.palette} variant={firstAlbum.art} radius={14} image={firstAlbum.image} />
            <span className="dk-mini-tile-copy">
              <span className="eyebrow">Release</span>
              <strong>{firstAlbum.title}</strong>
              <span>{firstAlbum.artist} · {firstAlbum.year}</span>
            </span>
            <span className="dk-tile-play">
              <Play size={14} fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <section className="dk-section">
        <div className="dk-section-head">
          <div>
            <h2>Made for you</h2>
            <p>Playlists that stay out of the way.</p>
          </div>
          <button onClick={() => jump('desktop', 'library')}>
            All playlists <ArrowRight size={14} />
          </button>
        </div>
        {loading ? (
          <div className="dk-card-grid dk-card-grid--4">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="dk-card-grid dk-card-grid--4">
            {madeForYou.map((id) => (
              <PlaylistCard key={id} playlistId={id} platform="desktop" showCurator />
            ))}
          </div>
        )}
      </section>

      <section className="dk-section">
        <div className="dk-section-head">
          <div>
            <h2>Jump back in</h2>
            <p>Your last few rooms.</p>
          </div>
          <button onClick={() => jump('desktop', 'library')}>
            Library <ArrowRight size={14} />
          </button>
        </div>
        <div className="dk-card-grid dk-card-grid--4">
          {recent.map((id) => (
            <AlbumCard key={id} albumId={id} platform="desktop" />
          ))}
        </div>
      </section>

      <section className="dk-section dk-section--last">
        <div className="dk-section-head">
          <div>
            <h2>Fresh from Audius</h2>
            <p>Songs from the source, ready to play.</p>
          </div>
          <button onClick={() => jump('desktop', 'search')}>
            Search <ArrowUpDown size={14} />
          </button>
        </div>
        <div className="dk-table">
          <div className="dk-table-head">
            <span>#</span>
            <span />
            <span>Title</span>
            <span>Album</span>
            <span />
            <span>Time</span>
            <span />
          </div>
          {repeatTracks.map((id, i) => (
            <TrackRow key={id} trackId={id} index={i} platform="desktop" variant="desktop" contextIds={repeatTracks} />
          ))}
        </div>
      </section>

      <p className="dk-signoff">Soft paws, all day. Music from Audius.</p>
    </div>
  );
}

/* ── Search ───────────────────────────────────────────────────────────────── */

function SearchPage() {
  const { jump, mode, searchHistory, clearSearchHistory, recent } = useApp();
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const remote = useSourceSearch(q, mode === 'product');

  const trackResults = useMemo(() => {
    if (mode === 'product') return remote.results.slice(0, 8);
    return tracks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.artist.toLowerCase().includes(term) ||
          t.album.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [mode, remote.results, term]);
  const artistResults = artists
    .filter((a) => a.name.toLowerCase().includes(term) || a.tagline.toLowerCase().includes(term))
    .slice(0, 3);
  const playlistResults = playlists
    .filter((p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
    .slice(0, 4);
  const hasResults = trackResults.length + artistResults.length + playlistResults.length > 0;
  const searching = mode === 'product' && remote.loading;
  const searchError = mode === 'product' ? remote.error : null;

  return (
    <div className="dk-page dk-search-page">
      <header className="dk-page-head">
        <div>
          <span className="eyebrow">Find your next purr</span>
          <h1 className="display">Search</h1>
          <p className="dk-page-sub">Songs, artists, moods — or a feeling you can’t name.</p>
        </div>
      </header>

      <div className="dk-search-hero">
        <SearchBar value={q} onChange={setQ} hint="⌘K" />
        <span className="dk-search-hint">
          {q ? (
            <>
              <kbd className="kbd">Esc</kbd> to clear
            </>
          ) : (
            'Search the Audius catalogue'
          )}
        </span>
      </div>

      {!q.trim() ? (
        <>
          <div className="dk-section-head dk-section-head--tight">
            <div>
              <h2>Browse all</h2>
              <p>Start with a mood, then go where it takes you.</p>
            </div>
          </div>
          <div className="dk-cat-grid">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.icon] ?? Moon;
              const colors = palettes[c.palette].colors;
              return (
                <button
                  key={`${c.name}-${c.playlist}`}
                  className="dk-cat"
                  onClick={() => jump('desktop', 'playlist', c.playlist)}
                  style={{ background: `linear-gradient(140deg, ${colors[0]}, ${colors[1]})` }}
                >
                  <span className="art-grain" />
                  <span className="dk-cat-name">{c.name}</span>
                  <span className="dk-cat-icon">
                    <Icon size={18} />
                  </span>
                </button>
              );
            })}
          </div>
          <section className="dk-section dk-section--last">
            <div className="dk-section-head">
              <div>
                <h2>Recent searches</h2>
              </div>
              {searchHistory.length > 0 && <button onClick={clearSearchHistory}>Clear</button>}
            </div>
            <div className="dk-chip-row">
              {searchHistory.length ? (
                searchHistory.map((r) => (
                  <button key={r} className="chip" onClick={() => setQ(r)}>
                    {r}
                  </button>
                ))
              ) : (
                <span className="dk-search-source">Search history will appear here.</span>
              )}
            </div>
            <div className="dk-quiet-shelf">
              {recent.slice(0, 4).map((id) =>
                trackById[id] ? (
                  <ArtistChip
                    key={id}
                    artistId={trackById[id].artistId}
                    platform="desktop"
                    size={42}
                    sub={trackById[id].artist}
                  />
                ) : null,
              )}
            </div>
            <p className="dk-search-source">Streaming catalogue supplied by Audius. No results are faked.</p>
          </section>
        </>
      ) : searching ? (
        <div className="dk-search-loading" role="status" aria-live="polite">
          <Skeleton h={64} r={14} />
          <Skeleton h={64} r={14} />
          <Skeleton h={64} r={14} />
          <span>Searching Audius…</span>
        </div>
      ) : searchError ? (
        <EmptyState
          state="error"
          title="Search tripped over its tail."
          body="Audius did not answer. Nothing was lost; try the same words again."
          action="Try again"
          onAction={remote.retry}
          size={160}
        />
      ) : !hasResults ? (
        <EmptyState
          state="sleeping"
          title="No matches. Cats are picky; we’re not."
          body={`Nothing for “${q.trim()}” yet. Try a mood, an artist, or a single good word.`}
          action="Clear search"
          onAction={() => setQ('')}
          size={160}
        />
      ) : (
        <div className="dk-results">
          <div className="dk-results-col">
            {artistResults.length > 0 && (
              <section>
                <h2 className="dk-result-title">Artists</h2>
                <div className="dk-artist-chips">
                  {artistResults.map((a) => (
                    <ArtistChip
                      key={a.id}
                      artistId={a.id}
                      platform="desktop"
                      size={52}
                      sub={a.followers != null ? `${formatCount(a.followers)} followers on Audius` : 'On Audius'}
                    />
                  ))}
                </div>
              </section>
            )}
            {playlistResults.length > 0 && (
              <section>
                <h2 className="dk-result-title">Playlists</h2>
                <div className="dk-card-grid dk-card-grid--3">
                  {playlistResults.map((p) => (
                    <PlaylistCard key={p.id} playlistId={p.id} platform="desktop" />
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="dk-results-col dk-results-col--wide">
            {trackResults.length > 0 && (
              <section>
                <h2 className="dk-result-title">Songs</h2>
                <div className="dk-table dk-table--plain">
                  {trackResults.map((t, i) => (
                    <TrackRow
                      key={t.id}
                      trackId={t.id}
                      index={i}
                      platform="desktop"
                      variant="desktop"
                      contextIds={trackResults.map((item) => item.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Library ──────────────────────────────────────────────────────────────── */

function LibraryPage() {
  const { jump, openPlaylistManager } = useApp();
  const [tab, setTab] = useState<'playlists' | 'artists' | 'albums'>('playlists');
  const [sort, setSort] = useState(false);
  const library = playlists.filter((p) => p.id !== 'liked-songs');
  const ordered = sort
    ? [...library].sort((a, b) => a.title.localeCompare(b.title))
    : library;

  return (
    <div className="dk-page dk-library-page">
      <header className="dk-page-head">
        <div>
          <span className="eyebrow">Everything you kept</span>
          <h1 className="display">Your library</h1>
          <p className="dk-page-sub">A small room with good light. Nothing you didn’t choose.</p>
        </div>
        <div className="dk-head-actions">
          <button className="btn btn--ghost btn--sm" onClick={() => setSort(!sort)}>
            <SlidersHorizontal size={14} /> {sort ? 'Recent' : 'Alphabetical'}
          </button>
          <button className="btn btn--soft btn--sm" onClick={() => openPlaylistManager()}>
            <Plus size={14} /> Manage playlists
          </button>
        </div>
      </header>

      <div className="dk-library-tools">
        <Seg
          value={tab}
          options={[
            { value: 'playlists', label: 'Playlists' },
            { value: 'artists', label: 'Artists' },
            { value: 'albums', label: 'Albums' },
          ]}
          onChange={setTab}
        />
        <span className="dk-library-count">
          {tab === 'playlists' && `${library.length + 1} collections`}
          {tab === 'artists' && `${artists.length} artists`}
          {tab === 'albums' && `${albums.length} releases`}
        </span>
      </div>

      {tab === 'playlists' && (
        <div className="dk-library-body">
          <button className="dk-liked-banner" onClick={() => jump('desktop', 'playlist', 'liked-songs')}>
            <span className="dk-liked-heart">
              <Heart size={22} fill="currentColor" />
            </span>
            <span className="dk-liked-copy">
              <strong>Liked Songs</strong>
              <span>
                {playlistById['liked-songs']?.trackIds.length ?? 0}{' '}
                {(playlistById['liked-songs']?.trackIds.length ?? 0) === 1 ? 'song' : 'songs'} · kept warm
              </span>
            </span>
            <span className="dk-liked-open">
              Open <ChevronRight size={14} />
            </span>
          </button>
          <div className="dk-card-grid dk-card-grid--4">
            {ordered.map((p) => (
              <PlaylistCard key={p.id} playlistId={p.id} platform="desktop" size="md" showCurator />
            ))}
          </div>
        </div>
      )}

      {tab === 'artists' && (
        <div className="dk-artist-grid">
          {artists.map((a) => (
            <button key={a.id} className="dk-artist-card" onClick={() => jump('desktop', 'artist', a.id)}>
              <Avatar name={a.name} palette={a.palette} variant={a.art} size={122} className="dk-artist-card-avatar" image={a.image} />
              <strong>{a.name}</strong>
              <span>
                Artist · {a.followers != null ? `${formatCount(a.followers)} followers` : 'on Audius'}
              </span>
            </button>
          ))}
        </div>
      )}

      {tab === 'albums' && (
        <div className="dk-card-grid dk-card-grid--5">
          {albums.map((a) => (
            <AlbumCard key={a.id} albumId={a.id} platform="desktop" />
          ))}
        </div>
      )}

    </div>
  );
}

/* ── Detail pages ─────────────────────────────────────────────────────────── */

function BackRow({ label }: { label: string }) {
  const { back } = useApp();
  return (
    <button className="dk-back" onClick={() => back('desktop')}>
      <ChevronLeft size={15} /> {label}
    </button>
  );
}

function PlaylistPage() {
  const { route, nav, toast, openPlaylistManager } = useApp();
  const pl = playlistById[route('desktop').id ?? 'late-night-purr'] ?? playlists[0];
  const list = pl.trackIds.map((id) => trackById[id]).filter(Boolean);
  const lead = list[0];
  const leadArtist = lead ? artistById[lead.artistId] : undefined;

  return (
    <div className="dk-page dk-detail-page">
      <BackRow label="Library" />
      <section className="dk-detail-hero" style={artVars(pl.palette)}>
        <div className="dk-detail-glow" aria-hidden="true" />
        <Art palette={pl.palette} variant={pl.art} radius={24} className="dk-detail-art" alt={`${pl.title} cover`} image={pl.image} />
        <div className="dk-detail-copy">
          <span className="eyebrow">{pl.curator === 'Mewzak' ? 'Mewzak playlist' : 'Your playlist'}</span>
          <h1 className="display">{pl.title}</h1>
          <p>{pl.description}</p>
          <span className="dk-detail-meta">
            {pl.curator} · {pl.trackIds.length} songs · {totalLabel(pl.trackIds)} · {pl.updated}
          </span>
          <div className="dk-detail-actions">
            <PlayCollectionButton trackIds={pl.trackIds} size={54} />
            <button
              className="dk-action"
              onClick={() => toast('Shuffled. Order is a suggestion.', 'desktop')}
              aria-label="Shuffle"
            >
              <Shuffle size={17} />
            </button>
            <button
              className="dk-action"
              onClick={async () => {
                if (!lead?.sourceUrl) return;
                if (navigator.share) {
                  await navigator.share({ title: `${lead.title} — ${lead.artist}`, url: lead.sourceUrl }).catch(() => undefined);
                } else {
                  await navigator.clipboard?.writeText(lead.sourceUrl).catch(() => undefined);
                  toast('Link copied.', 'desktop');
                }
              }}
              aria-label="Share"
            >
              <Quote size={17} />
            </button>
            <button
              className="dk-action"
              onClick={() => openPlaylistManager(pl.user ? pl.id : undefined)}
              aria-label="Add to playlist"
            >
              <Plus size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="dk-table dk-table--tracks">
        <div className="dk-table-head">
          <span>#</span>
          <span />
          <span>Title</span>
          <span>Album</span>
          <span />
          <span>Time</span>
          <span />
        </div>
        {list.map((t, i) => (
          <TrackRow
            key={t.id}
            trackId={t.id}
            index={i}
            platform="desktop"
            variant="desktop"
            contextIds={pl.trackIds}
          />
        ))}
      </div>

      <div className="dk-detail-foot">
        <p>
          {pl.user ? (
            <button onClick={() => openPlaylistManager(pl.id)}>Manage this playlist</button>
          ) : leadArtist ? (
            <>Curated by <button onClick={() => nav('desktop', 'artist', leadArtist.id)}>Mewzak, with {leadArtist.name}</button></>
          ) : (
            'Curated by Mewzak.'
          )}
        </p>
        <p>Streamed from Audius.</p>
      </div>
    </div>
  );
}

function AlbumPage() {
  const { route, nav, toast, openPlaylistManager } = useApp();
  const album = albumById[route('desktop').id ?? 'slow-parade'] ?? albums[0];
  const list = album.trackIds.map((id) => trackById[id]).filter(Boolean);
  const artist = artistById[album.artistId];
  const lead = list[0];

  return (
    <div className="dk-page dk-detail-page">
      <BackRow label="Library" />
      <section className="dk-detail-hero dk-album-hero" style={artVars(album.palette)}>
        <div className="dk-detail-glow" aria-hidden="true" />
        <Art palette={album.palette} variant={album.art} radius={24} className="dk-detail-art" alt={`${album.title} cover`} image={album.image} />
        <div className="dk-detail-copy">
          <span className="eyebrow">Collection · {album.year}</span>
          <h1 className="display">{album.title}</h1>
          <button className="dk-artist-link" onClick={() => nav('desktop', 'artist', album.artistId)}>
            <Avatar name={album.artist} palette={album.palette} variant={album.art} size={22} image={artist?.image} />
            {album.artist}
          </button>
          <p className="dk-detail-sub">{album.blurb}</p>
          <span className="dk-detail-meta">
            {album.trackIds.length} songs · {totalLabel(album.trackIds)} · Audius
          </span>
          <div className="dk-detail-actions">
            <PlayCollectionButton trackIds={album.trackIds} size={54} />
            <button className="dk-action" onClick={() => openPlaylistManager()} aria-label="Add to playlist">
              <Plus size={17} />
            </button>
            <button
              className="dk-action"
              onClick={async () => {
                if (!lead?.sourceUrl) return;
                if (navigator.share) {
                  await navigator.share({ title: `${album.title} — ${album.artist}`, url: lead.sourceUrl }).catch(() => undefined);
                } else {
                  await navigator.clipboard?.writeText(lead.sourceUrl).catch(() => undefined);
                  toast('Link copied.', 'desktop');
                }
              }}
              aria-label="Share"
            >
              <Quote size={17} />
            </button>
            {lead?.sourceUrl && (
              <a className="dk-action" href={lead.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open on Audius">
                <ExternalLink size={17} />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="dk-detail-body">
        <div className="dk-table dk-table--tracks">
          <div className="dk-table-head">
            <span>#</span>
            <span />
            <span>Title</span>
            <span>Album</span>
            <span />
            <span>Time</span>
            <span />
          </div>
          {list.map((t, i) => (
            <TrackRow
              key={t.id}
              trackId={t.id}
              index={i}
              platform="desktop"
              variant="desktop"
              contextIds={album.trackIds}
            />
          ))}
        </div>
        <aside className="dk-about-card">
          <span className="eyebrow">About this collection</span>
          <p>{album.blurb}</p>
          <dl>
            <dt>Released</dt>
            <dd>{album.year}</dd>
            <dt>Length</dt>
            <dd>{totalLabel(album.trackIds)}</dd>
            <dt>Source</dt>
            <dd>Audius</dd>
            <dt>Playback</dt>
            <dd>Streaming</dd>
          </dl>
          {artist && (
            <button className="dk-about-artist" onClick={() => nav('desktop', 'artist', artist.id)}>
              <Avatar name={artist.name} palette={artist.palette} variant={artist.art} size={38} image={artist.image} />
              <span>
                <span className="eyebrow">Artist</span>
                <strong>{artist.name}</strong>
              </span>
              <ChevronRight size={15} />
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}

function ArtistPage() {
  const { route, jump, nav, toast, playCollection, setShuffle } = useApp();
  const artist = artistById[route('desktop').id ?? 'luna-vale'] ?? artists[0];
  const [following, setFollowing] = useState(false);
  const discography = albums.filter((a) => a.artistId === artist.id);
  const top = artist.topTracks.map((id) => trackById[id]).filter(Boolean);
  const genres = Array.from(new Set(top.map((item) => item.genre).filter(Boolean))).slice(0, 3);

  return (
    <div className="dk-page dk-detail-page">
      <BackRow label="Artists" />
      <section className="dk-artist-hero" style={artVars(artist.palette)}>
        <div className="dk-detail-glow" aria-hidden="true" />
        <Avatar name={artist.name} palette={artist.palette} variant={artist.art} size={168} className="dk-artist-big" image={artist.image} />
        <div className="dk-detail-copy">
          <span className="eyebrow">Artist · Audius</span>
          <h1 className="display">{artist.name}</h1>
          <p className="dk-artist-tagline">{artist.tagline}</p>
          <span className="dk-detail-meta">
            {artist.followers != null ? `${formatCount(artist.followers)} followers on Audius` : 'Streaming from Audius'}
          </span>
          <div className="dk-detail-actions">
            <PlayCollectionButton trackIds={artist.topTracks} size={54} />
            <button
              className={`dk-follow ${following ? 'is-on' : ''}`}
              onClick={() => {
                setFollowing(!following);
                toast(following ? 'Unfollowed. We’ll keep it quiet.' : 'Following. Whiskers on the pulse.', 'desktop');
              }}
            >
              {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              className="dk-action"
              onClick={() => {
                setShuffle(true);
                playCollection(top.map((item) => item.id));
                toast('Artist radio, shuffled. Real tracks from Audius.', 'desktop');
              }}
              aria-label="Shuffle artist"
            >
              <Shuffle size={17} />
            </button>
          </div>
        </div>
      </section>

      <div className="dk-artist-body">
        <section className="dk-artist-tracks">
          <div className="dk-section-head">
            <div>
              <h2>Popular</h2>
              <p>Start here, or start anywhere.</p>
            </div>
            <button onClick={() => nav('desktop', 'nowplaying')}>
              Play all <ArrowRight size={14} />
            </button>
          </div>
          <div className="dk-table dk-table--plain">
            <div className="dk-table-head">
              <span>#</span>
              <span />
              <span>Title</span>
              <span>Album</span>
              <span />
              <span>Time</span>
              <span />
            </div>
            {top.map((t, i) => (
              <TrackRow
                key={t.id}
                trackId={t.id}
                index={i}
                platform="desktop"
                variant="desktop"
                contextIds={artist.topTracks}
              />
            ))}
          </div>
        </section>
        <aside className="dk-about-card">
          <span className="eyebrow">About</span>
          <p>{artist.bio}</p>
          <div className="dk-genre-row">
            {(genres.length ? genres : [artist.tagline]).map((g) => (
              <span key={g as string} className="chip chip--solid">
                {g}
              </span>
            ))}
          </div>
          <div className="dk-inline-stats">
            <div>
              <strong>{artist.followers != null ? formatCount(artist.followers) : '—'}</strong>
              <span>Followers on Audius</span>
            </div>
            <div>
              <strong>{discography.length}</strong>
              <span>Releases</span>
            </div>
          </div>
        </aside>
      </div>

      <section className="dk-section dk-section--last">
        <div className="dk-section-head">
          <div>
            <h2>Discography</h2>
            <p>Start with {discography[0]?.title}.</p>
          </div>
          <button onClick={() => jump('desktop', 'library')}>
            Library <ArrowRight size={14} />
          </button>
        </div>
        <div className="dk-card-grid dk-card-grid--4">
          {discography.map((a) => (
            <AlbumCard key={a.id} albumId={a.id} platform="desktop" />
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Profile & Settings ───────────────────────────────────────────────────── */

function ProfilePage() {
  const { jump, likedPlaylistIds, profile, userPlaylists, openPlaylistManager, recent } = useApp();
  const likedAlbums = useMemo(
    () =>
      Array.from(new Set(likedPlaylistIds.map((id) => trackById[id]?.albumId).filter(Boolean))).slice(0, 4) as string[],
    [likedPlaylistIds],
  );
  const name = profile?.name ?? 'Listener';
  const initials = displayNameFor(name).initials;
  const genres = profile?.genres?.length ? profile.genres : [];
  const artistIds = Array.from(
    new Set(
      [...likedPlaylistIds, ...recent]
        .map((id) => trackById[id]?.artistId)
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, 8);

  return (
    <div className="dk-page dk-profile-page">
      <header className="dk-page-head">
        <div>
          <span className="eyebrow">Your corner</span>
          <h1 className="display">Profile</h1>
          <p className="dk-page-sub">A small, local room. No listening statistics invented.</p>
        </div>
        <button className="btn btn--ghost btn--sm" onClick={() => jump('desktop', 'settings')}>
          <SettingsIcon size={14} /> Settings
        </button>
      </header>

      <div className="dk-profile-grid">
        <section className="dk-profile-main">
          <div className="dk-profile-avatar">{initials}</div>
          <div>
            <h2 className="display">{name}</h2>
            <span className="dk-handle">
              {profile?.handle ?? '@listener'}
              {profile?.email ? ` · ${profile.email}` : ' · on this device'}
            </span>
            <div className="dk-profile-chips">
              <span className="ph-plan-chip">
                <Sparkles size={11} /> Local profile
              </span>
              <span className="chip chip--solid">
                <Check size={12} /> No account needed
              </span>
            </div>
          </div>
          <div className="dk-profile-stats">
            <div>
              <strong>{likedPlaylistIds.length}</strong>
              <span>Liked</span>
            </div>
            <div>
              <strong>{userPlaylists.length}</strong>
              <span>Playlists</span>
            </div>
            <div>
              <strong>{artistIds.length}</strong>
              <span>Artists</span>
            </div>
            <div>
              <strong>{recent.length}</strong>
              <span>Recent</span>
            </div>
          </div>
        </section>

        <section className="dk-card dk-clock-card">
          <div className="dk-card-head">
            <div>
              <h3>Your taste</h3>
              <p>Chosen at onboarding. Still true.</p>
            </div>
            <span className="dk-meta-chip">Onboarding</span>
          </div>
          <div className="dk-genre-row">
            {genres.length ? (
              genres.slice(0, 8).map((genre) => (
                <span key={genre} className="chip chip--solid">
                  {genre}
                </span>
              ))
            ) : (
              <p className="dk-profile-quiet">No genres picked. The whole room is open.</p>
            )}
          </div>
        </section>

        <section className="dk-card">
          <div className="dk-card-head">
            <h3>On this device</h3>
            <span className="dk-meta-chip">Local-first</span>
          </div>
          <p className="dk-profile-note-copy">
            Likes, playlists, queue and search history are saved locally. Audio streams from Audius and is
            never downloaded or stored.
          </p>
          <button className="dk-link" onClick={() => openPlaylistManager()}>
            Manage playlists <ArrowRight size={13} />
          </button>
        </section>

        <section className="dk-card dk-profile-note">
          <div className="dk-card-head">
            <h3>A quiet library</h3>
            <Sparkles size={16} />
          </div>
          <p>
            {likedPlaylistIds.length
              ? `${likedPlaylistIds.length} liked songs, kept on this device.`
              : 'Nothing liked yet. Tap a heart and it stays here.'}
          </p>
          <button className="dk-link" onClick={() => jump('desktop', 'search')}>
            Find something <ArrowRight size={13} />
          </button>
        </section>
      </div>

      <section className="dk-section">
        <div className="dk-section-head">
          <div>
            <h2>Recently liked</h2>
            <p>Pressed with intent, not by accident.</p>
          </div>
          <button onClick={() => jump('desktop', 'playlist', 'liked-songs')}>
            Liked Songs <ArrowRight size={14} />
          </button>
        </div>
        {likedAlbums.length ? (
          <div className="dk-card-grid dk-card-grid--4">
            {likedAlbums.map((id) => (
              <AlbumCard key={id} albumId={id} platform="desktop" />
            ))}
          </div>
        ) : (
          <EmptyState
            state="sleeping"
            title="Nothing saved yet."
            body="Tap the heart on a real track and it will land here."
            action="Find music"
            onAction={() => jump('desktop', 'search')}
            size={120}
          />
        )}
      </section>

      {artistIds.length > 0 && (
        <section className="dk-section dk-section--last">
          <div className="dk-section-head">
            <div>
              <h2>Artists in your orbit</h2>
              <p>From the songs you saved and played.</p>
            </div>
          </div>
          <div className="dk-chip-row">
            {artistIds.map((id) => (
              <ArtistChip key={id} artistId={id} platform="desktop" size={40} sub="" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SettingsPage() {
  const {
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
    likedPlaylistIds,
    userPlaylists,
    clearCache,
    clearSearchHistory,
    signOut,
    deleteLocalData,
  } = useApp();
  const name = profile?.name ?? 'Listener';
  const initials = displayNameFor(name).initials;

  return (
    <div className="dk-page dk-settings-page">
      <header className="dk-page-head">
        <div>
          <span className="eyebrow">Make it fit</span>
          <h1 className="display">Settings</h1>
          <p className="dk-page-sub">Fewer knobs, better defaults. Everything here is wired.</p>
        </div>
      </header>

      <div className="dk-settings-grid">
        <section className="dk-card">
          <div className="dk-card-head">
            <h3>Appearance</h3>
            <span className="dk-meta-chip">This device</span>
          </div>
          <div className="dk-set-row">
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
          <div className="dk-set-row">
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
          <div className="dk-set-row">
            <div>
              <strong>Reduce motion</strong>
              <span>Calmer transitions and a still mascot.</span>
            </div>
            <Toggle checked={!motion} onChange={(v) => setMotion(!v)} label="Reduce motion" />
          </div>
        </section>

        <section className="dk-card">
          <div className="dk-card-head">
            <h3>Playback</h3>
          </div>
          <div className="dk-set-row">
            <div>
              <strong>Toe-bean pause</strong>
              <span>A little paw on the pause button.</span>
            </div>
            <Toggle checked={toeBean} onChange={setToeBean} label="Toe-bean pause icon" />
          </div>
          <div className="dk-set-row">
            <div>
              <strong>Audio quality</strong>
              <span>Audius standard stream · one honest quality.</span>
            </div>
          </div>
          <a className="dk-set-row dk-set-row--button" href="https://audius.co" target="_blank" rel="noreferrer">
            <div>
              <strong>Music source</strong>
              <span>Audius · open music streaming</span>
            </div>
            <ExternalLink size={16} />
          </a>
        </section>

        <section className="dk-card">
          <div className="dk-card-head">
            <h3>Library & cache</h3>
          </div>
          <div className="dk-set-row">
            <div>
              <strong>Saved on this device</strong>
              <span>
                {likedPlaylistIds.length} liked songs · {userPlaylists.length} playlists · local search history
              </span>
            </div>
          </div>
          <p className="dk-profile-note-copy">
            Audio streams from Audius and is never downloaded or persisted. Artwork and search responses live in
            the session cache only.
          </p>
          <button
            className="dk-set-row dk-set-row--button"
            onClick={() => {
              clearCache();
              clearSearchHistory();
              toast('Session cache cleared. Your saved library is still here.', 'desktop');
            }}
          >
            <div>
              <strong>Clear session cache</strong>
              <span>Keep likes and playlists, drop cached artwork and searches.</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </section>

        <section className="dk-card">
          <div className="dk-card-head">
            <h3>Local profile</h3>
            <span className="dk-meta-chip">No cloud</span>
          </div>
          <div className="dk-account-row">
            <span className="dk-user-avatar">{initials}</span>
            <div>
              <strong>{name}</strong>
              <span>
                {profile?.email ? `${profile.email} · on this device` : `${profile?.handle ?? '@listener'} · no account, no sync`}
              </span>
            </div>
          </div>
          <p className="dk-profile-note-copy">
            Accounts and cross-device sync are not wired in this build. Nothing here pretends otherwise.
          </p>
          <div className="dk-set-row dk-set-row--two">
            <button className="btn btn--ghost btn--sm" onClick={signOut}>
              Sign out
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                if (window.confirm('Delete your local profile, liked songs, playlists and settings? This cannot be undone.')) {
                  deleteLocalData();
                }
              }}
            >
              Delete local data
            </button>
          </div>
        </section>

        <section className="dk-card dk-about-card">
          <div className="dk-card-head">
            <h3>About Mewzak</h3>
          </div>
          <div className="dk-about-brand">
            <Logo size={22} />
            <span>Version 0.3.0 · Phase 3</span>
          </div>
          <p>Music with soft paws. One React codebase, built for Android, iOS, macOS and Windows.</p>
          <div className="dk-about-links">
            <a className="dk-link" href="https://audius.co" target="_blank" rel="noreferrer">
              Music by Audius
            </a>
            <a className="dk-link" href="https://audius.co/documents/ApiTerms.pdf" target="_blank" rel="noreferrer">
              Source terms
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Right panel ──────────────────────────────────────────────────────────── */

function PanelQueueRow({
  id,
  index,
  onRemove,
}: {
  id: string;
  index?: number;
  onRemove?: () => void;
}) {
  const { playTrack, currentId, playing } = useApp();
  const t = trackById[id];
  if (!t) return null;
  const current = id === currentId;
  return (
    <div className={`dk-pq-row ${current ? 'is-current' : ''}`} onClick={() => playTrack(id)} role="button" tabIndex={0}>
      <span className="dk-pq-lead">
        {current && playing ? <Eq /> : index !== undefined ? String(index + 1).padStart(2, '0') : '—'}
      </span>
      <Art palette={t.palette} variant={t.art} radius={8} image={t.image} />
      <span className="dk-pq-copy">
        <strong>{t.title}</strong>
        <span>{t.artist}</span>
      </span>
      <span className="dk-pq-time">{fmtTime(t.duration)}</span>
      {onRemove && (
        <button
          className="dk-pq-x"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove from queue"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function PanelQueue() {
  const { queue, currentId, removeFromQueue, clearQueue, toast, jump } = useApp();
  const currentIndex = queue.indexOf(currentId);
  const upNext = (currentIndex >= 0 ? queue.slice(currentIndex + 1) : queue).filter((id) => id !== currentId);

  return (
    <div className="dk-panel-scroll">
      <div className="dk-panel-section-head">
        <div>
          <span className="eyebrow">Playing from your queue</span>
          <h3>Queue</h3>
        </div>
        <button
          className="dk-text-action"
          onClick={() => {
            clearQueue();
            toast('Queue cleared. Fresh start.', 'desktop');
          }}
        >
          Clear
        </button>
      </div>

      <div className="dk-panel-label">Now playing</div>
      <PanelQueueRow id={currentId} />

      <div className="dk-panel-label">
        Up next <span>{upNext.length}</span>
      </div>
      {upNext.length === 0 ? (
        <EmptyState
          state="sleeping"
          title="Nothing’s next."
          body="A perfect time for a catnap."
          action="Find music"
          onAction={() => jump('desktop', 'search')}
          size={100}
        />
      ) : (
        <div className="dk-pq-list">
          {upNext.map((id, i) => (
            <PanelQueueRow
              key={`${id}-${i}`}
              id={id}
              index={i}
              onRemove={() => removeFromQueue(queue.indexOf(id))}
            />
          ))}
        </div>
      )}
      <p className="dk-panel-fine">A queue is a suggestion with manners.</p>
    </div>
  );
}

function PanelLyrics() {
  const { track, currentId, progress, seek, setPanelTab } = useApp();
  const lines = lyrics[currentId];
  const activeIndex = lines ? lines.reduce((acc, l, i) => (progress >= l.t ? i : acc), 0) : -1;
  const scrollRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const container = scrollRef.current;
    const el = refs.current[activeIndex];
    if (!container || !el) return;
    container.scrollTo({
      top: Math.max(0, el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2),
      behavior: 'smooth',
    });
  }, [activeIndex]);

  return (
    <div className="dk-panel-lyrics">
      <div className="dk-panel-lyric-head">
        <Art palette={track.palette} variant={track.art} radius={10} image={track.image} />
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <span className="dk-sync-badge">
          <Quote size={11} /> {lines ? 'Synced' : 'Not provided'}
        </span>
      </div>

      {!lines ? (
        <EmptyState
          state="sleeping"
          title="No lyrics for this one."
          body="Hum along. We won’t tell."
          action="Back to player"
          onAction={() => setPanelTab('now')}
          size={96}
        />
      ) : (
        <div className="dk-lyrics-scroll" ref={scrollRef}>
          <div className="dk-lyrics-inner">
            {lines.map((l, i) => (
              <button
                key={`${l.t}-${i}`}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`dk-lyric ${i === activeIndex ? 'is-active' : ''} ${i < activeIndex ? 'is-past' : ''}`}
                onClick={() => seek(l.t)}
              >
                {l.line}
              </button>
            ))}
            <div className="dk-lyrics-end">
              <Mascot state="happy" size={48} />
              <span>Tap a line to jump.</span>
            </div>
          </div>
        </div>
      )}
      {lines && <div className="dk-lyrics-foot">Lyrics supplied with the track · tap a line to jump</div>}
    </div>
  );
}

function PanelNow() {
  const { track, liked, toggleLike, toast, setPanelTab, nav, openPlaylistManager } = useApp();
  const isLiked = !!liked[track.id];
  const { queue, currentId } = useApp();
  const idx = queue.indexOf(currentId);
  const upNext = (idx >= 0 ? queue.slice(idx + 1) : queue).filter((id) => id !== currentId).slice(0, 3);

  return (
    <div className="dk-panel-scroll dk-panel-now" style={artVars(track.palette)}>
      <div className="dk-panel-now-top">
        <span className="eyebrow">Playing from your queue</span>
        <button
          className="ghost-icon"
          onClick={async () => {
            if (navigator.share) {
              await navigator
                .share({ title: `${track.title} — ${track.artist}`, url: track.sourceUrl })
                .catch(() => undefined);
            } else if (track.sourceUrl) {
              await navigator.clipboard?.writeText(track.sourceUrl).catch(() => undefined);
              toast('Link copied.', 'desktop');
            }
          }}
          aria-label="Share track"
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="dk-panel-artwrap">
        <Art
          palette={track.palette}
          variant={track.art}
          radius={20}
          className="dk-panel-art"
          alt={`Artwork for ${track.title}`}
          image={track.image}
        />
      </div>

      <div className="dk-panel-meta">
        <div>
          <button className="dk-panel-title" onClick={() => nav('desktop', 'album', track.albumId)}>
            {track.title}
          </button>
          <button className="dk-panel-artist" onClick={() => nav('desktop', 'artist', track.artistId)}>
            {track.artist}
          </button>
        </div>
        <div className="dk-panel-meta-actions">
          <button
            className={`dk-panel-icon ${isLiked ? 'is-liked' : ''}`}
            onClick={() => {
              toggleLike(track.id);
              toast(isLiked ? 'Removed. No hard feelings.' : 'Saved. Very purr-sonal.', 'desktop');
            }}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          </button>
          <button className="dk-panel-icon" onClick={() => openPlaylistManager()} aria-label="Add to playlist">
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="dk-panel-scrub">
        <ScrubRow compact />
      </div>

      <TransportControls size="md" />

      <div className="dk-panel-mini-actions">
        <button onClick={() => setPanelTab('lyrics')}>
          <Mic2 size={16} /> Lyrics
        </button>
        <button onClick={() => setPanelTab('queue')}>
          <ListMusic size={16} /> Queue
        </button>
        <button
          onClick={async () => {
            if (navigator.share) {
              await navigator
                .share({ title: `${track.title} — ${track.artist}`, url: track.sourceUrl })
                .catch(() => undefined);
            } else if (track.sourceUrl) {
              await navigator.clipboard?.writeText(track.sourceUrl).catch(() => undefined);
              toast('Link copied.', 'desktop');
            }
          }}
        >
          <ExternalLink size={16} /> Share
        </button>
      </div>

      <div className="dk-panel-divider" />

      <div className="dk-panel-label">
        Up next <span>{upNext.length}</span>
      </div>
      <div className="dk-pq-list">
        {upNext.map((id, i) => (
          <PanelQueueRow key={`${id}-${i}`} id={id} />
        ))}
      </div>
      <button className="dk-panel-more" onClick={() => setPanelTab('queue')}>
        Open queue <ArrowRight size={13} />
      </button>
    </div>
  );
}

function NowPanel({ panelWidth, setPanelWidth }: { panelWidth: number; setPanelWidth: (n: number) => void }) {
  const { panelTab, setPanelTab, track } = useApp();
  const appRef = useRef<HTMLDivElement>(null);

  const startResize = (e: ReactPointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = panelWidth;
    const app = e.currentTarget.closest('.dk-app') as HTMLElement | null;
    const width = app?.getBoundingClientRect().width ?? 1280;
    const scale = width / 1280 || 1;
    const move = (ev: PointerEvent) => {
      const delta = (startX - ev.clientX) / scale;
      setPanelWidth(Math.round(Math.min(430, Math.max(288, startW + delta))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    document.body.style.cursor = 'col-resize';
  };

  return (
    <aside className="dk-panel" ref={appRef} style={{ width: panelWidth }}>
      <div className="dk-panel-tabs">
        <button className={panelTab === 'now' ? 'is-on' : ''} onClick={() => setPanelTab('now')}>
          <AudioLines size={14} /> Playing
        </button>
        <button className={panelTab === 'queue' ? 'is-on' : ''} onClick={() => setPanelTab('queue')}>
          <ListMusic size={14} /> Queue
        </button>
        <button className={panelTab === 'lyrics' ? 'is-on' : ''} onClick={() => setPanelTab('lyrics')}>
          <Quote size={14} /> Lyrics
        </button>
        <button
          className="dk-panel-close"
          onClick={() => setPanelWidth(288)}
          title="Compact panel"
          aria-label="Compact panel"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <span
        className="dk-resize"
        onPointerDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize now playing panel"
      />
      {panelTab === 'now' && <PanelNow />}
      {panelTab === 'queue' && <PanelQueue />}
      {panelTab === 'lyrics' && <PanelLyrics />}
    </aside>
  );
}

/* ── Transport ────────────────────────────────────────────────────────────── */

function Transport({ onPanelWidth, panelWidth }: { onPanelWidth: (n: number) => void; panelWidth: number }) {
  const { track, progress, seek, liked, toggleLike, toast, setPanelTab, panelTab } = useApp();
  const isLiked = !!liked[track.id];

  return (
    <footer className="dk-transport glass">
      <div className="dk-transport-now">
        <Art palette={track.palette} variant={track.art} radius={10} image={track.image} />
        <div className="dk-transport-copy">
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <button
          className={`ghost-icon dk-transport-like ${isLiked ? 'is-liked' : ''}`}
          onClick={() => {
            toggleLike(track.id);
            toast(isLiked ? 'Removed. No hard feelings.' : 'Saved. Very purr-sonal.', 'desktop');
          }}
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="dk-transport-center">
        <TransportControls />
        <div className="dk-transport-scrub">
          <span>{fmtTime(progress)}</span>
          <ScrubBar value={progress} max={track.duration} onChange={seek} label="Seek in track" />
          <span>-{fmtTime(Math.max(0, track.duration - progress))}</span>
        </div>
      </div>

      <div className="dk-transport-right">
        <button
          className={`ghost-icon ${panelTab === 'lyrics' ? 'is-on' : ''}`}
          onClick={() => setPanelTab('lyrics')}
          aria-label="Lyrics"
          title="Lyrics"
        >
          <Mic2 />
        </button>
        <button
          className={`ghost-icon ${panelTab === 'queue' ? 'is-on' : ''}`}
          onClick={() => setPanelTab('queue')}
          aria-label="Queue"
          title="Queue"
        >
          <ListMusic />
        </button>
        <VolumeSlider compact />

      </div>
    </footer>
  );
}

/* ── Onboarding ───────────────────────────────────────────────────────────── */

const TASTES = ['Late night', 'Focus', 'Rainy days', 'Bedroom pop', 'Ambient', 'Piano', 'Lo-fi', 'Sunday'];

function DesktopOnboarding() {
  const { jump } = useApp();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);

  const finish = () => jump('desktop', 'home');
  const toggleTaste = (t: string) => {
    setPicked((p) => {
      if (p.includes(t)) return p.filter((x) => x !== t);
      if (p.length >= 3) return p;
      return [...p, t];
    });
  };

  return (
    <div className="dk-onboard" data-theme="dark">
      <div className="dk-onboard-art">
        <div className="dk-onboard-grain" aria-hidden="true" />
        <div className="dk-onboard-brand">
          <Logo size={25} />
          <span className="dk-onboard-live">
            <i /> Phase 1
          </span>
        </div>

        <div className="dk-onboard-visual">
          <span className="dk-onboard-halo" aria-hidden="true" />
          <Mascot state={step === 0 ? 'idle' : 'happy'} size={280} />
          <span className="dk-onboard-orbit orbit-a" aria-hidden="true" />
          <span className="dk-onboard-orbit orbit-b" aria-hidden="true" />
        </div>

        <div className="dk-onboard-quote">
          <p className="display">Music with<br />soft paws.</p>
          <span>Calm surfaces. Clear controls. Nothing shouting for attention.</span>
        </div>

        <div className="dk-onboard-platforms">
          <span>Android</span>
          <span>iOS</span>
          <span>macOS</span>
          <span>Windows</span>
        </div>
      </div>

      <div className="dk-onboard-panel">
        <button className="dk-onboard-skip" onClick={finish}>
          Skip for now
        </button>

        <div className="dk-onboard-card">
          <div className="dk-onboard-dots" aria-hidden="true">
            <i className={step === 0 ? 'is-on' : ''} />
            <i className={step === 1 ? 'is-on' : ''} />
            <i className={step === 2 ? 'is-on' : ''} />
          </div>

          {step === 0 && (
            <>
              <span className="eyebrow">Welcome to the quiet side</span>
              <h1 className="display">Mewzak.</h1>
              <p className="dk-onboard-lede">
                A music player for people who like their rooms a little quieter. Set up takes three taps.
              </p>
              <div className="dk-onboard-points">
                <span><Check size={14} /> No clutter. Music first.</span>
                <span><Check size={14} /> Controls in one predictable place.</span>
                <span><Check size={14} /> A cat, used sparingly.</span>
              </div>
              <button className="dk-onboard-cta" onClick={() => setStep(1)}>
                Start purring <ArrowRight size={17} />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <span className="eyebrow">Make it yours</span>
              <h1 className="display">Pick a few moods.</h1>
              <p className="dk-onboard-lede">We’ll do the rest. Three is plenty — add more later.</p>
              <div className="dk-onboard-chips">
                {TASTES.map((t) => (
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
              <button className="dk-onboard-cta" onClick={() => setStep(2)}>
                That’s me <Check size={17} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <span className="eyebrow">All warmed up</span>
              <h1 className="display">You’re all set.</h1>
              <p className="dk-onboard-lede">
                Your ears are in good paws. Start with Late Night Purr, or find your own way in.
              </p>
              <div className="dk-onboard-summary">
                <div>
                  <strong>{picked.length || 3}</strong>
                  <span>Moods picked</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>Quiet hours</span>
                </div>
                <div>
                  <strong>1</strong>
                  <span>Polite cat</span>
                </div>
              </div>
              <button className="dk-onboard-cta" onClick={finish}>
                Take me home <ArrowRight size={17} />
              </button>
            </>
          )}

          <div className="dk-onboard-fine">
            By continuing you agree to listen softly. No data is collected in this prototype.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── App ──────────────────────────────────────────────────────────────────── */

function MainRouter() {
  const { route } = useApp();
  const name = route('desktop').name;
  switch (name) {
    case 'search':
      return <SearchPage />;
    case 'library':
      return <LibraryPage />;
    case 'playlist':
      return <PlaylistPage />;
    case 'album':
      return <AlbumPage />;
    case 'artist':
      return <ArtistPage />;
    case 'profile':
      return <ProfilePage />;
    case 'settings':
      return <SettingsPage />;
    case 'home':
    default:
      return <HomePage />;
  }
}

export function DesktopApp({
  panelWidth,
  setPanelWidth,
}: {
  panelWidth: number;
  setPanelWidth: (n: number) => void;
}) {
  const { route } = useApp();
  const screen = route('desktop');

  if (screen.name === 'onboarding') return <DesktopOnboarding />;

  return (
    <div className="dk-app" style={{ '--panel-w': `${panelWidth}px` } as CSSProperties}>
      <Sidebar />
      <main className="dk-main">
        <div className="dk-scroll" key={`${screen.name}-${screen.id ?? ''}`}>
          <MainRouter />
        </div>
      </main>
      <NowPanel panelWidth={panelWidth} setPanelWidth={setPanelWidth} />
      <Transport panelWidth={panelWidth} onPanelWidth={setPanelWidth} />
      <ToastHost scope="desktop" />
    </div>
  );
}
