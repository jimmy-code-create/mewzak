import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  ListMusic,
  Moon,
  Pause,
  Pencil,
  Play,
  Repeat,
  Search,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { useApp } from '../store';
import {
  artists,
  fmtTime,
  palettes,
  playlistById,
  playlists,
  tracks,
  trackById,
  type Artist,
  type PaletteKey,
} from '../data';
import { Art } from '../components/ui';
import { CREATE_PROFILE, PROFILE, SHELL, VIBE } from './copy';
import type { P2Session } from './Onboarding';
import {
  DownloadMenu,
  P2Avatar,
  P2Button,
  P2Field,
  P2IconButton,
  P2TabBar,
  P2Wordmark,
  SHELL_TABS,
  SkeletonRows,
  StatusPill,
  classNames,
  handleFor,
  haptic,
  type ShellTab,
} from './ui';

const PAGE_TITLES: Record<ShellTab, string> = {
  home: SHELL.home,
  search: SHELL.search,
  library: SHELL.library,
  player: SHELL.player,
  profile: SHELL.profile,
};

const SHELF_TABS = [PROFILE.tabs[0], PROFILE.tabs[1], PROFILE.tabs[2]] as const;
type ShelfTab = 0 | 1 | 2;

function eqFill(progress: number, duration: number): CSSProperties {
  return { '--fill': `${Math.min(100, Math.max(0, (progress / Math.max(1, duration)) * 100))}%` } as CSSProperties;
}

function Eq({ paused = false }: { paused?: boolean }) {
  return (
    <span className={classNames('p2-eq', paused && 'is-paused')} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/* ── Shared little pieces ─────────────────────────────────────────────────── */

function TrackList({
  ids,
  empty,
  limit = 6,
}: {
  ids: string[];
  empty?: string;
  limit?: number;
}) {
  const { currentId, playing, playTrack } = useApp();
  if (!ids.length) {
    return <p className="p2-demo-note">{empty ?? PROFILE.emptyBody}</p>;
  }
  return (
    <div className="p2-track-list">
      {ids.slice(0, limit).map((id) => {
        const t = trackById[id];
        if (!t) return null;
        const active = currentId === id;
        return (
          <button type="button" key={id} className={classNames('p2-track', active && 'is-active')} onClick={() => playTrack(id)}>
            <span className="p2-track-art">
              <Art palette={t.palette} variant={t.art} radius={10} />
            </span>
            <span className="p2-track-copy">
              <strong>{t.title}</strong>
              <small>
                {t.artist} · {t.album}
              </small>
            </span>
            {active ? <Eq paused={!playing} /> : null}
            <span className="p2-track-time">{fmtTime(t.duration)}</span>
          </button>
        );
      })}
    </div>
  );
}

function MediaCard({
  playlistId,
  onOpen,
}: {
  playlistId: string;
  onOpen: () => void;
}) {
  const p = playlistById[playlistId];
  if (!p) return null;
  return (
    <button type="button" className="p2-media-card" onClick={onOpen}>
      <span className="p2-media-art">
        <Art palette={p.palette} variant={p.art} radius={14} />
      </span>
      <strong>{p.title}</strong>
      <small>
        {p.trackIds.length} {SHELL.songs}
      </small>
    </button>
  );
}

function EmptyShelf({
  title = PROFILE.emptyTitle,
  body = PROFILE.emptyBody,
  onAction,
}: {
  title?: string;
  body?: string;
  onAction: () => void;
}) {
  return (
    <div className="p2-empty">
      <span className="p2-empty-icon" aria-hidden="true">
        <Sparkles size={19} />
      </span>
      <strong>{title}</strong>
      <p>{body}</p>
      <P2Button variant="dark" onClick={onAction}>
        {PROFILE.emptyAction}
      </P2Button>
    </div>
  );
}

/* ── Home ─────────────────────────────────────────────────────────────────── */

function HomeScreen({
  firstName,
  onOpenPlayer,
}: {
  firstName: string;
  onOpenPlayer: () => void;
}) {
  const { track, playing, toggle, playTrack } = useApp();
  const homeIds = ['late-night-purr', 'sunday-loaf', 'golden-hour-tail', 'focus-paws'];

  return (
    <div className="p2-page">
      <div className="p2-page-head">
        <div>
          <span className="p2-eyebrow">
            <i /> {SHELL.homeEyebrow}
          </span>
          <h1>{SHELL.homeTitle.replace('Mina', firstName)}</h1>
          <p>{SHELL.homeBody}</p>
        </div>
        <span className="p2-demo-badge is-live">{SHELL.homeContinue}</span>
      </div>

      <section className="p2-home-hero" aria-label={SHELL.homeContinue}>
        <div>
          <span className="p2-eyebrow" style={{ color: 'rgba(249,241,232,.58)' }}>
            <i /> {SHELL.playerNow}
          </span>
          <h1>{track.title}</h1>
          <small>
            {track.artist} · {track.album}
          </small>
          <div className="p2-home-hero-row">
            <P2Button
              variant="gradient"
              icon={playing ? <Pause size={14} /> : <Play size={14} />}
              onClick={toggle}
            >
              {playing ? 'Pause' : SHELL.playAll}
            </P2Button>
            <P2Button variant="quiet" onClick={onOpenPlayer} icon={<ChevronRight size={14} />}>
              {SHELL.homeOpenPlayer}
            </P2Button>
          </div>
        </div>
        <div className="p2-home-hero-art">
          <Art palette={track.palette} variant={track.art} radius={20} />
        </div>
      </section>

      <section className="p2-section">
        <div className="p2-section-head">
          <div>
            <h2>{SHELL.homeForYou}</h2>
            <p>{SHELL.homeBody}</p>
          </div>
        </div>
        <div className="p2-card-grid">
          {homeIds.map((id) => {
            const p = playlistById[id];
            return (
              <MediaCard
                key={id}
                playlistId={id}
                onOpen={() => {
                  if (p) {
                    playTrack(p.trackIds[0]);
                    onOpenPlayer();
                  }
                }}
              />
            );
          })}
        </div>
      </section>

      <section className="p2-section">
        <div className="p2-section-head">
          <div>
            <h2>{SHELL.homeRecent}</h2>
            <p>{SHELL.libraryBody}</p>
          </div>
        </div>
        <TrackList ids={tracks.slice(0, 5).map((t) => t.id)} />
      </section>
    </div>
  );
}

/* ── Search ───────────────────────────────────────────────────────────────── */

function SearchScreen({
  query,
  setQuery,
  onOpenPlayer,
}: {
  query: string;
  setQuery: (v: string) => void;
  onOpenPlayer: () => void;
}) {
  const { playTrack } = useApp();
  const q = query.trim().toLowerCase();
  const trackResults = q
    ? tracks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.artist.toLowerCase().includes(q) ||
            t.album.toLowerCase().includes(q),
        )
        .slice(0, 5)
    : [];
  const artistResults = q
    ? artists.filter((a) => a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const playlistResults = q
    ? playlists.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)).slice(0, 4)
    : [];
  const noResults = q && !trackResults.length && !artistResults.length && !playlistResults.length;

  const suggestions = ['Luna Vale', 'Mira Chen', 'Slow Parade', 'Catnap'];

  return (
    <div className="p2-page">
      <div className="p2-page-head">
        <div>
          <span className="p2-eyebrow">
            <i /> Find the next thing
          </span>
          <h1>{SHELL.search}</h1>
          <p>{SHELL.searchHint}</p>
        </div>
      </div>

      <label className="p2-search-field">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={SHELL.searchPlaceholder}
          aria-label={SHELL.searchPlaceholder}
          autoComplete="off"
        />
        <span className="p2-search-kbd">⌘ K</span>
      </label>

      {!q ? (
        <div style={{ marginTop: 22 }}>
          <div className="p2-search-group">
            <h3>Start somewhere</h3>
            <div className="p2-demo-row">
              {suggestions.map((s) => (
                <button type="button" className="p2-chip" key={s} onClick={() => setQuery(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="p2-section">
            <div className="p2-section-head">
              <div>
                <h2>{SHELL.homeForYou}</h2>
                <p>{SHELL.searchEmptyBody}</p>
              </div>
            </div>
            <div className="p2-card-grid">
              {['late-night-purr', 'rainy-window', 'soft-launch', 'golden-hour-tail'].map((id) => (
                <MediaCard
                  key={id}
                  playlistId={id}
                  onOpen={() => {
                    const p = playlistById[id];
                    if (p) {
                      playTrack(p.trackIds[0]);
                      onOpenPlayer();
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {noResults ? (
        <div style={{ marginTop: 22 }}>
          <EmptyShelf title={SHELL.searchEmptyTitle} body={SHELL.searchEmptyBody} onAction={() => setQuery('')} />
        </div>
      ) : null}

      {q ? (
        <div className="p2-search-groups">
          {trackResults.length ? (
            <div className="p2-search-group">
              <h3>{SHELL.resultsTracks}</h3>
              <TrackList ids={trackResults.map((t) => t.id)} limit={5} />
            </div>
          ) : null}

          {artistResults.length ? (
            <div className="p2-search-group">
              <h3>{SHELL.resultsArtists}</h3>
              <div className="p2-search-artist-row">
                {artistResults.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    className="p2-search-artist"
                    onClick={() => {
                      playTrack(a.topTracks[0]);
                      onOpenPlayer();
                    }}
                  >
                    <P2Avatar name={a.name} seed={a.name} size={24} grain={false} />
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {playlistResults.length ? (
            <div className="p2-search-group">
              <h3>{SHELL.resultsPlaylists}</h3>
              <div className="p2-card-grid">
                {playlistResults.map((p) => (
                  <MediaCard
                    key={p.id}
                    playlistId={p.id}
                    onOpen={() => {
                      playTrack(p.trackIds[0]);
                      onOpenPlayer();
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/* ── Library ──────────────────────────────────────────────────────────────── */

function LibraryScreen({
  onOpenPlayer,
  following,
  onProfile,
}: {
  onOpenPlayer: () => void;
  following: Record<string, boolean>;
  onProfile: () => void;
}) {
  const { liked, playTrack } = useApp();
  const [libTab, setLibTab] = useState<ShelfTab>(0);
  const likedIds = tracks.filter((t) => liked[t.id]).map((t) => t.id);
  const followed = artists.filter((a) => following[a.id]);

  return (
    <div className="p2-page">
      <div className="p2-page-head">
        <div>
          <span className="p2-eyebrow">
            <i /> Saved, not shouted
          </span>
          <h1>{SHELL.libraryTitle}</h1>
          <p>{SHELL.libraryBody}</p>
        </div>
      </div>

      <div className="p2-library-tabs" role="tablist" aria-label="Library sections">
        {SHELF_TABS.map((label, i) => (
          <button
            type="button"
            role="tab"
            aria-selected={libTab === i}
            key={label}
            className={libTab === i ? 'is-on' : ''}
            onClick={() => setLibTab(i as ShelfTab)}
          >
            {label}
          </button>
        ))}
      </div>

      {libTab === 0 ? (
        likedIds.length ? (
          <TrackList ids={likedIds} limit={12} />
        ) : (
          <EmptyShelf onAction={onProfile} />
        )
      ) : null}

      {libTab === 1 ? (
        <div className="p2-card-grid">
          {playlists.slice(0, 6).map((p) => (
            <MediaCard
              key={p.id}
              playlistId={p.id}
              onOpen={() => {
                playTrack(p.trackIds[0]);
                onOpenPlayer();
              }}
            />
          ))}
        </div>
      ) : null}

      {libTab === 2 ? (
        followed.length ? (
          <div className="p2-artist-grid">
            {followed.map((a) => (
              <button
                type="button"
                key={a.id}
                className="p2-artist-card"
                onClick={() => {
                  playTrack(a.topTracks[0]);
                  onOpenPlayer();
                }}
              >
                <P2Avatar name={a.name} seed={a.name} size={58} />
                <strong>{a.name}</strong>
                <small>{a.tagline}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="p2-empty">
            <span className="p2-empty-icon" aria-hidden="true">
              <Sparkles size={19} />
            </span>
            <strong>{PROFILE.noGenres}</strong>
            <p>{PROFILE.creatorsBody}</p>
            <P2Button variant="dark" onClick={onProfile}>
              {PROFILE.edit}
            </P2Button>
          </div>
        )
      ) : null}
    </div>
  );
}

/* ── Player ───────────────────────────────────────────────────────────────── */

function PlayerScreen() {
  const {
    track,
    playing,
    progress,
    toggle,
    next,
    prev,
    seek,
    shuffle,
    setShuffle,
    repeat,
    cycleRepeat,
    liked,
    toggleLike,
    queue,
  } = useApp();

  return (
    <div className="p2-page p2-page--player">
      <div className="p2-page-head">
        <div>
          <span className="p2-eyebrow">
            <i /> {SHELL.playerNow}
          </span>
          <h1>{SHELL.player}</h1>
        </div>
        <span className="p2-demo-badge is-live">
          <Eq paused={!playing} /> Playing from your library
        </span>
      </div>

      <div className="p2-player">
        <div className="p2-player-art">
          <Art palette={track.palette} variant={track.art} radius={24} />
        </div>
        <div className="p2-player-meta">
          <span className="p2-eyebrow">
            <i /> {SHELL.playerNow}
          </span>
          <h1>{track.title}</h1>
          <span>
            {track.artist} · {track.album}
          </span>

          <div className="p2-scrub">
            <input
              type="range"
              min={0}
              max={track.duration}
              value={Math.round(progress)}
              className="p2-range"
              style={eqFill(progress, track.duration)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek in track"
            />
            <div className="p2-scrub-times">
              <span>{fmtTime(progress)}</span>
              <span>{fmtTime(track.duration)}</span>
            </div>
          </div>

          <div className="p2-player-controls">
            <button
              type="button"
              className={shuffle ? 'is-on' : ''}
              aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
              aria-pressed={shuffle}
              onClick={() => setShuffle(!shuffle)}
            >
              <Shuffle size={17} />
            </button>
            <button type="button" onClick={prev} aria-label="Previous track">
              <SkipBack size={20} />
            </button>
            <button type="button" className="p2-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: 2 }} />}
            </button>
            <button type="button" onClick={next} aria-label="Next track">
              <SkipForward size={20} />
            </button>
            <button
              type="button"
              className={repeat !== 'off' ? 'is-on' : ''}
              aria-label={`Repeat ${repeat}`}
              onClick={cycleRepeat}
            >
              <Repeat size={17} />
            </button>
          </div>

          <div className="p2-player-side-actions">
            <button
              type="button"
              className="p2-text-link"
              onClick={() => {
                toggleLike(track.id);
                haptic(5);
              }}
            >
              <Heart size={14} fill={liked[track.id] ? 'currentColor' : 'none'} />{' '}
              {liked[track.id] ? 'Saved' : 'Save'}
            </button>
            <span className="p2-text-link">
              <ListMusic size={14} /> {queue.length} in queue
            </span>
          </div>
        </div>
      </div>

      <section className="p2-player-queue">
        <h2>{SHELL.playerQueue}</h2>
        <TrackList ids={queue} limit={6} />
      </section>
    </div>
  );
}

/* ── Edit modal ───────────────────────────────────────────────────────────── */

function EditProfileModal({
  session,
  onClose,
  onSave,
  onReplay,
}: {
  session: P2Session;
  onClose: () => void;
  onSave: (next: P2Session) => void;
  onReplay: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [genres, setGenres] = useState(session.genres);
  const [seed, setSeed] = useState(session.avatarSeed);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const save = () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    haptic(8);
    timer.current = window.setTimeout(() => {
      setSaving(false);
      onSave({
        ...session,
        name: name.trim(),
        handle: handleFor(name),
        genres,
        avatarSeed: seed,
        completed: true,
      });
    }, 520);
  };

  return (
    <div className="p2-modal-scrim" role="presentation" onClick={onClose}>
      <div
        className="p2-modal p2-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-label={PROFILE.editTitle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p2-modal-top">
          <span className="p2-eyebrow">
            <i /> Your corner
          </span>
          <button type="button" onClick={onClose} aria-label="Close edit profile">
            <X size={16} />
          </button>
        </div>
        <h3>{PROFILE.editTitle}</h3>
        <p>{PROFILE.editBody}</p>

        <div className="p2-avatar-stage">
          <P2Avatar
            name={name || session.name}
            seed={seed}
            size={78}
            editable
            onEdit={() => {
              setSeed(`${name || 'mew'}-${Date.now()}`);
              haptic(6);
            }}
          />
        </div>

        <P2Field label={CREATE_PROFILE.label} value={name} onChange={setName} placeholder={CREATE_PROFILE.placeholder} maxLength={48} />
        <p className="p2-handle-hint" style={{ color: 'rgba(255,246,236,.48)' }}>
          {CREATE_PROFILE.handleHint} <b style={{ color: 'rgba(255,246,236,.8)' }}>{handleFor(name)}</b>
        </p>

        <div className="p2-edit-genres">
          <span className="p2-view-label" style={{ color: 'rgba(255,246,236,.45)' }}>
            {PROFILE.genresLabel}
          </span>
          <div className="p2-chip-cloud">
            {VIBE.genres.map((genre) => (
              <button
                type="button"
                key={genre}
                className={classNames('p2-chip', genres.includes(genre) && 'is-on')}
                aria-pressed={genres.includes(genre)}
                onClick={() =>
                  setGenres((current) =>
                    current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
                  )
                }
                style={{ animationDelay: '0ms, 0ms' }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <P2Button variant="gradient" block loading={saving} onClick={save} disabled={!name.trim()}>
          {PROFILE.save}
        </P2Button>
        <div className="p2-modal-foot">
          <button type="button" onClick={onReplay}>
            {PROFILE.replay}
          </button>
          <button type="button" onClick={onClose}>
            {PROFILE.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Profile ──────────────────────────────────────────────────────────────── */

function CreatorCard({
  artist,
  followed,
  onFollow,
  onDismiss,
  onPlay,
}: {
  artist: Artist;
  followed: boolean;
  onFollow: () => void;
  onDismiss: () => void;
  onPlay: () => void;
}) {
  return (
    <article className="p2-creator">
      <button type="button" className="p2-creator-x" onClick={onDismiss} aria-label={`${PROFILE.dismiss} ${artist.name}`}>
        <X size={12} />
      </button>
      <div className="p2-creator-top">
        <button
          type="button"
          onClick={onPlay}
          aria-label={`Play ${artist.name}`}
          style={{ border: 0, padding: 0, background: 'transparent', lineHeight: 0, borderRadius: '50%' }}
        >
          <P2Avatar name={artist.name} seed={artist.name} size={44} />
        </button>
        <div className="p2-creator-copy">
          <strong>
            {artist.name}
            <BadgeCheck size={13} aria-label="Verified artist" />
          </strong>
          <span>{artist.tagline}</span>
        </div>
      </div>
      <button
        type="button"
        className={classNames('p2-creator-follow', followed && 'is-on')}
        onClick={onFollow}
        aria-pressed={followed}
      >
        {followed ? PROFILE.following : PROFILE.follow}
      </button>
    </article>
  );
}

function ProfileScreen({
  session,
  toast,
  onOpenPlayer,
  onEdit,
  onNotify,
  following,
  onToggleFollow,
}: {
  session: P2Session;
  toast: string | null;
  onOpenPlayer: () => void;
  onEdit: () => void;
  onNotify: (msg: string) => void;
  following: Record<string, boolean>;
  onToggleFollow: (id: string) => void;
}) {
  const { track, playing, liked, playTrack } = useApp();
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [shelfTab, setShelfTab] = useState<ShelfTab>(0);
  const [loading, setLoading] = useState(true);
  const creators = artists.filter((a) => !dismissed[a.id]).slice(0, 5);
  const followedArtists = artists.filter((a) => following[a.id]);
  const likedIds = tracks.filter((t) => liked[t.id]).map((t) => t.id);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 620);
    return () => window.clearTimeout(timer);
  }, []);

  const shelfContent = () => {
    if (shelfTab === 0) {
      return likedIds.length ? (
        <TrackList ids={likedIds} limit={6} />
      ) : (
        <EmptyShelf onAction={() => setShelfTab(1)} />
      );
    }
    if (shelfTab === 1) {
      return (
        <div className="p2-card-grid">
          {playlists.slice(0, 4).map((p) => (
            <MediaCard
              key={p.id}
              playlistId={p.id}
              onOpen={() => {
                playTrack(p.trackIds[0]);
                onOpenPlayer();
              }}
            />
          ))}
        </div>
      );
    }
    return followedArtists.length ? (
      <div className="p2-artist-grid">
        {followedArtists.map((a) => (
          <button
            type="button"
            className="p2-artist-card"
            key={a.id}
            onClick={() => {
              playTrack(a.topTracks[0]);
              onOpenPlayer();
            }}
          >
            <P2Avatar name={a.name} seed={a.name} size={52} />
            <strong>{a.name}</strong>
            <small>{PROFILE.following}</small>
          </button>
        ))}
      </div>
    ) : (
      <EmptyShelf onAction={() => setShelfTab(0)} />
    );
  };

  return (
    <div className="p2-profile">
      <div className="p2-profile-hero">
        <div className="p2-mesh" aria-hidden="true">
          <span className="p2-mesh-blob" />
          <span className="p2-mesh-blob" />
          <span className="p2-mesh-blob" />
          <span className="p2-mesh-blob" />
          <span className="p2-mesh-grain" />
        </div>
        <div className="p2-status-float">
          <StatusPill
            mode={toast ? 'toast' : 'playing'}
            message={toast ?? undefined}
            trackTitle={track.title}
            trackArtist={track.artist}
            palette={track.palette}
            art={track.art}
            onOpen={onOpenPlayer}
          />
        </div>
      </div>

      <div className="p2-profile-inner">
        <div className="p2-profile-identity">
          <P2Avatar name={session.name} seed={session.avatarSeed} size={92} />
          <div className="p2-profile-name">
            <h1>{session.name}</h1>
            <span>{session.handle}</span>
          </div>
          <button type="button" className="p2-profile-edit" onClick={onEdit}>
            <Pencil size={13} /> {PROFILE.edit}
          </button>
        </div>

        <div className="p2-profile-meta">
          {session.genres.length ? (
            session.genres.slice(0, 4).map((genre) => (
              <span className="p2-chip is-on" key={genre}>
                {genre}
              </span>
            ))
          ) : (
            <span className="p2-chip is-on">{PROFILE.noGenres}</span>
          )}
          {session.genres.length > 4 ? <span className="p2-chip">+{session.genres.length - 4}</span> : null}
        </div>

        <div className="p2-profile-content">
          <button type="button" className="p2-complete-card" onClick={onEdit}>
            <span className="p2-complete-icon" aria-hidden="true">
              <Sparkles size={17} />
            </span>
            <span className="p2-complete-copy">
              <strong>{PROFILE.completeTitle}</strong>
              <small>{PROFILE.completeBody}</small>
            </span>
            <span className="p2-complete-step">{PROFILE.completeStep}</span>
          </button>

          {creators.length ? (
            <section aria-label={PROFILE.creatorsTitle}>
              <div className="p2-section-head">
                <div>
                  <h2>{PROFILE.creatorsTitle}</h2>
                  <p>{PROFILE.creatorsBody}</p>
                </div>
              </div>
              <div className="p2-creators">
                {creators.map((artist) => (
                  <CreatorCard
                    key={artist.id}
                    artist={artist}
                    followed={Boolean(following[artist.id])}
                    onFollow={() => {
                      onToggleFollow(artist.id);
                      onNotify(following[artist.id] ? 'Following removed. Still welcome.' : PROFILE.followed);
                    }}
                    onDismiss={() => {
                      setDismissed((d) => ({ ...d, [artist.id]: true }));
                      onNotify(PROFILE.dismissed);
                    }}
                    onPlay={() => {
                      playTrack(artist.topTracks[0]);
                      onOpenPlayer();
                    }}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="p2-shelf" aria-label={PROFILE.shelfTitle}>
            <div className="p2-section-head">
              <div>
                <h2>{PROFILE.shelfTitle}</h2>
                <p>{PROFILE.shelfBody}</p>
              </div>
            </div>
            <div className="p2-shelf-tabs" role="tablist" aria-label="Profile shelf">
              {SHELF_TABS.map((label, i) => (
                <button
                  type="button"
                  role="tab"
                  key={label}
                  aria-selected={shelfTab === i}
                  className={shelfTab === i ? 'is-on' : ''}
                  onClick={() => setShelfTab(i as ShelfTab)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p2-shelf-body">
              {loading ? (
                <>
                  <span className="p2-view-label">{PROFILE.skeletons}</span>
                  <SkeletonRows rows={3} />
                </>
              ) : (
                shelfContent()
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────────────────────── */

export function P2App({
  session,
  onSessionChange,
  onReplay,
  theme,
  onToggleTheme,
}: {
  session: P2Session;
  onSessionChange: (next: P2Session) => void;
  onReplay: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) {
  const {
    track,
    playing,
    toggle,
    playTrack,
    progress,
    seek,
    next,
    prev,
    shuffle,
    setShuffle,
    liked,
    toggleLike,
    volume,
    setVolume,
  } = useApp();
  const [tab, setTab] = useState<ShellTab>('profile');
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstName = session.name.split(/\s+/)[0] || 'friend';

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    return () => {
      if (toastRef.current) window.clearTimeout(toastRef.current);
    };
  }, []);

  const notify = (msg: string) => {
    setToast(msg);
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => setToast(null), 2800);
  };

  const toggleFollow = (id: string) => {
    setFollowing((f) => ({ ...f, [id]: !f[id] }));
    haptic(5);
  };

  const openPlayer = () => setTab('player');
  const openSearch = () => setTab('search');

  const navItems = SHELL_TABS.map((t) => {
    const Icon = t.icon;
    return (
      <button
        type="button"
        key={t.id}
        className={classNames('p2-nav-item', tab === t.id && 'is-on')}
        onClick={() => setTab(t.id)}
        aria-current={tab === t.id ? 'page' : undefined}
      >
        <Icon />
        <span>{t.label}</span>
      </button>
    );
  });

  return (
    <div className="p2-app">
      <div className="p2-app-shell">
        <aside className={classNames('p2-sidebar', collapsed && 'is-collapsed')} aria-label="Primary navigation">
          <div className="p2-sidebar-head">
            <P2Wordmark size={21} />
            <button
              type="button"
              className="p2-sidebar-collapse"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? SHELL.collapsedSidebar : SHELL.expandedSidebar}
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>
          <nav className="p2-nav" aria-label="Sections">
            {navItems}
          </nav>
          <div className="p2-sidebar-sep" />
          <span className="p2-sidebar-label">Your playlists</span>
          <div className="p2-side-playlists">
            {playlists.slice(0, 5).map((p) => (
              <button
                type="button"
                key={p.id}
                className="p2-side-playlist"
                onClick={() => {
                  playTrack(p.trackIds[0]);
                  setTab('player');
                }}
              >
                <i style={{ background: `linear-gradient(135deg, ${palettes[p.palette].colors[0]}, ${palettes[p.palette].colors[2]})` }} />
                {p.title}
              </button>
            ))}
          </div>
          <button type="button" className="p2-sidebar-user" onClick={() => setTab('profile')}>
            <P2Avatar name={session.name} seed={session.avatarSeed} size={30} grain={false} />
            <span>
              <strong>{session.name}</strong>
              <small>{session.handle}</small>
            </span>
          </button>
        </aside>

        <div className="p2-main-wrap">
          <header className="p2-topbar">
            <div className="p2-topbar-left">
              <span className="p2-topbar-title">{PAGE_TITLES[tab]}</span>
            </div>
            <label className="p2-topbar-search">
              <Search size={14} aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setTab('search');
                }}
                placeholder={SHELL.searchPlaceholder}
                aria-label={SHELL.searchPlaceholder}
              />
            </label>
            <div className="p2-topbar-right">
              <DownloadMenu compact />
              <button type="button" className="p2-view-bar-btn" onClick={onToggleTheme} aria-label="Switch Phase 2 theme">
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>
              <button type="button" className="p2-view-bar-btn" onClick={() => setTab('profile')} aria-label="Open profile">
                <P2Avatar name={session.name} seed={session.avatarSeed} size={26} grain={false} />
              </button>
            </div>
          </header>

          <header className="p2-mobilehead">
            <P2Wordmark size={19} />
            <div className="p2-mobilehead-actions">
              <DownloadMenu compact />
              <P2IconButton label="Switch Phase 2 theme" onClick={onToggleTheme}>
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
              </P2IconButton>
              <button type="button" onClick={() => setTab('profile')} aria-label="Open profile" style={{ borderRadius: '50%' }}>
                <P2Avatar name={session.name} seed={session.avatarSeed} size={30} grain={false} />
              </button>
            </div>
          </header>

          <main className="p2-main" ref={mainRef}>
            {tab === 'home' ? <HomeScreen firstName={firstName} onOpenPlayer={openPlayer} /> : null}
            {tab === 'search' ? (
              <SearchScreen query={query} setQuery={setQuery} onOpenPlayer={openPlayer} />
            ) : null}
            {tab === 'library' ? (
              <LibraryScreen onOpenPlayer={openPlayer} following={following} onProfile={() => setTab('profile')} />
            ) : null}
            {tab === 'player' ? <PlayerScreen /> : null}
            {tab === 'profile' ? (
              <ProfileScreen
                session={session}
                toast={toast}
                onOpenPlayer={openPlayer}
                onEdit={() => setEditOpen(true)}
                onNotify={notify}
                following={following}
                onToggleFollow={toggleFollow}
              />
            ) : null}
          </main>

          {tab === 'profile' ? (
            <button type="button" className="p2-float-cta" onClick={openSearch}>
              {PROFILE.cta} <ChevronRight size={14} />
            </button>
          ) : null}

          <div className="p2-mini">
            <span className="p2-mini-art">
              <Art palette={track.palette} variant={track.art} radius={10} />
            </span>
            <button type="button" className="p2-mini-copy" onClick={openPlayer} aria-label="Open player">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </button>
            <button type="button" className="p2-mini-btn" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button type="button" className="p2-mini-btn" onClick={next} aria-label="Next track">
              <SkipForward size={17} />
            </button>
            <span className="p2-mini-progress" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (progress / Math.max(1, track.duration)) * 100)}%` }} />
            </span>
          </div>

          <P2TabBar active={tab} onChange={setTab} />
        </div>
      </div>

      <div className="p2-nowbar">
        <div className="p2-nowbar-track">
          <span className="p2-nowbar-art">
            <Art palette={track.palette} variant={track.art} radius={10} />
          </span>
          <div className="p2-nowbar-copy">
            <strong>{track.title}</strong>
            <small>{track.artist} · {track.album}</small>
          </div>
          <button
            type="button"
            className="p2-mini-btn"
            onClick={() => {
              toggleLike(track.id);
              haptic(4);
            }}
            aria-label={liked[track.id] ? 'Unlike' : 'Like'}
          >
            <Heart size={15} fill={liked[track.id] ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p2-nowbar-mid">
          <div className="p2-nowbar-buttons">
            <button type="button" className={shuffle ? 'is-on' : ''} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle">
              <Shuffle size={14} />
            </button>
            <button type="button" onClick={prev} aria-label="Previous track">
              <SkipBack size={16} />
            </button>
            <button type="button" className="p2-nowbar-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button type="button" onClick={next} aria-label="Next track">
              <SkipForward size={16} />
            </button>
            <button type="button" onClick={() => setTab('player')} aria-label="Open queue">
              <ListMusic size={15} />
            </button>
          </div>
          <div className="p2-nowbar-scrub">
            <span>{fmtTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={track.duration}
              value={Math.round(progress)}
              className="p2-range"
              style={eqFill(progress, track.duration)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek in track"
            />
            <span>-{fmtTime(Math.max(0, track.duration - progress))}</span>
          </div>
        </div>

        <div className="p2-nowbar-right">
          <button type="button" className={volume === 0 ? 'is-on' : ''} onClick={() => setVolume(volume === 0 ? 0.72 : 0)} aria-label="Mute">
            <Volume2 size={16} />
          </button>
          <button type="button" onClick={() => setTab('player')} aria-label="Open player">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {editOpen ? (
        <EditProfileModal
          session={session}
          onClose={() => setEditOpen(false)}
          onSave={(nextSession) => {
            onSessionChange(nextSession);
            setEditOpen(false);
            notify(PROFILE.saved);
          }}
          onReplay={() => {
            setEditOpen(false);
            onReplay();
          }}
        />
      ) : null}
    </div>
  );
}
