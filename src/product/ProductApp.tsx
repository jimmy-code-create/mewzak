import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, ListMusic, Plus, Trash2, X } from 'lucide-react';
import { OnboardingFlow, loadSession, type P2Session } from '../phase2/Onboarding';
import { CatMark } from '../components/Brand';
import { DesktopApp } from '../desktop/DesktopApp';
import { PhoneApp } from '../phone/PhoneApp';
import { AppProvider, useApp, type AppProfile } from '../store';
import { installCatalogue, mergeSourceCatalogue, trackById } from '../data';
import { loadLibrary } from './library';
import { loadLocalAccount } from './account';
import { buildCatalogue, fetchTracksByIds, fetchTrending } from './source';

type BootState = 'loading' | 'ready' | 'error';

function toProfile(session: P2Session): AppProfile {
  return {
    name: session.name,
    handle: session.handle,
    email: loadLocalAccount()?.email,
    genres: session.genres,
    avatarSeed: session.avatarSeed,
    birthday: session.birthday,
  };
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

function BootScreen({ state, message, onRetry }: { state: BootState; message?: string; onRetry: () => void }) {
  return (
    <div className="product-boot">
      <div className="product-boot-glow" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="product-boot-grain" aria-hidden="true" />
      <main className="product-boot-splash">
        <div className="product-boot-brand">
          <span className="product-boot-mark">
            <CatMark size={46} gradient />
          </span>
          <span className="product-boot-wordmark">mewzak</span>
          <p className="product-boot-tagline">Soft paws. Real music.</p>
        </div>

        {state === 'loading' ? (
          <div className="product-boot-loading" role="status" aria-live="polite">
            <span className="product-spinner" />
            <span>Tuning the room</span>
            <i className="product-boot-dots" aria-hidden="true">
              <b />
              <b />
              <b />
            </i>
          </div>
        ) : (
          <div className="product-boot-error" role="alert">
            <p className="product-eyebrow">The shelf is quiet</p>
            <h1>{message || 'The music source did not answer. Nothing was lost; try again.'}</h1>
            <div className="product-boot-actions">
              <button className="product-primary" onClick={onRetry}>
                Try again
              </button>
              <a className="product-text-link" href="?studio=1">
                Open the design studio
              </a>
            </div>
          </div>
        )}

        <p className="product-boot-note">
          Streaming from Audius · your library stays on this device.
        </p>
      </main>
    </div>
  );
}

function PlaylistManager() {
  const {
    playlistManagerOpen,
    closePlaylistManager,
    userPlaylists,
    managedPlaylistId,
    selectManagedPlaylist,
    createPlaylist,
    renamePlaylist,
    deletePlaylist,
    addCurrentToPlaylist,
    removePlaylistTrack,
    movePlaylistTrack,
    currentId,
    track,
  } = useApp();
  const [newTitle, setNewTitle] = useState('');
  const [title, setTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const selected = userPlaylists.find((item) => item.id === managedPlaylistId) ?? null;
  const selectedTracks = useMemo(
    () => (selected?.trackIds ?? []).map((id) => trackById[id]).filter(Boolean),
    [selected],
  );

  useEffect(() => {
    setTitle(selected?.title ?? '');
    setConfirmDelete(false);
  }, [selected?.id, selected?.title]);

  if (!playlistManagerOpen) return null;

  return (
    <div className="product-modal-backdrop" onMouseDown={closePlaylistManager}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Playlist manager"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="product-modal-head">
          <div>
            <span className="product-eyebrow">On this device</span>
            <h2>Your playlists</h2>
          </div>
          <button className="product-icon-btn" onClick={closePlaylistManager} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="product-playlist-layout">
          <aside className="product-playlist-list">
            {userPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                className={`product-playlist-pick ${playlist.id === selected?.id ? 'is-on' : ''}`}
                onClick={() => selectManagedPlaylist(playlist.id)}
              >
                <ListMusic size={15} />
                <span>
                  <strong>{playlist.title}</strong>
                  <span>{playlist.trackIds.length} songs</span>
                </span>
              </button>
            ))}
            <form
              className="product-playlist-new"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newTitle.trim()) return;
                createPlaylist(newTitle);
                setNewTitle('');
              }}
            >
              <label className="product-visually-hidden" htmlFor="new-playlist-name">
                New playlist name
              </label>
              <input
                id="new-playlist-name"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="New playlist"
                maxLength={60}
              />
              <button type="submit" aria-label="Create playlist" disabled={!newTitle.trim()}>
                <Plus size={16} />
              </button>
            </form>
          </aside>

          <div className="product-playlist-detail">
            {selected ? (
              <>
                <form
                  className="product-playlist-title"
                  onSubmit={(event) => {
                    event.preventDefault();
                    renamePlaylist(selected.id, title);
                  }}
                >
                  <label className="product-visually-hidden" htmlFor="playlist-name">
                    Playlist name
                  </label>
                  <input
                    id="playlist-name"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={() => renamePlaylist(selected.id, title)}
                    maxLength={60}
                  />
                  <button type="submit" disabled={!title.trim() || title === selected.title} aria-label="Save name">
                    <Check size={16} />
                  </button>
                </form>
                <p className="product-modal-note">Only the IDs live on this device. Audio always streams from Audius.</p>

                <div className="product-modal-actions">
                  <button
                    className="product-secondary"
                    onClick={() => addCurrentToPlaylist(selected.id)}
                    disabled={selected.trackIds.includes(currentId)}
                  >
                    <Plus size={15} />
                    {selected.trackIds.includes(currentId) ? 'Now playing is in this playlist' : `Add “${track.title}”`}
                  </button>
                </div>

                {selectedTracks.length ? (
                  <ol className="product-playlist-tracks">
                    {selectedTracks.map((item, index) => (
                      <li key={`${item.id}-${index}`}>
                        <span className="product-playlist-number">{String(index + 1).padStart(2, '0')}</span>
                        <span className="product-playlist-track-copy">
                          <strong>{item.title}</strong>
                          <span>{item.artist}</span>
                        </span>
                        <span className="product-track-actions">
                          <button
                            onClick={() => movePlaylistTrack(selected.id, index, index - 1)}
                            disabled={index === 0}
                            aria-label={`Move ${item.title} up`}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => movePlaylistTrack(selected.id, index, index + 1)}
                            disabled={index === selectedTracks.length - 1}
                            aria-label={`Move ${item.title} down`}
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => removePlaylistTrack(selected.id, item.id)}
                            aria-label={`Remove ${item.title}`}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="product-modal-empty">
                    <p>This playlist is empty.</p>
                    <span>Add the track that is playing, or save tracks from anywhere in the app.</span>
                  </div>
                )}

                <div className="product-modal-danger">
                  {confirmDelete ? (
                    <>
                      <span>Delete “{selected.title}” and its order?</span>
                      <button className="product-danger" onClick={() => deletePlaylist(selected.id)}>
                        Delete playlist
                      </button>
                      <button className="product-text-link" onClick={() => setConfirmDelete(false)}>
                        Keep it
                      </button>
                    </>
                  ) : (
                    <button className="product-text-link product-text-link--danger" onClick={() => setConfirmDelete(true)}>
                      <Trash2 size={14} /> Delete playlist
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="product-modal-empty">
                <h3>No playlists yet.</h3>
                <p>Make one on the left, then add the song that is playing.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function AudioNotice() {
  const { audioError, retryAudio, track } = useApp();
  if (!audioError) return null;
  return (
    <div className="product-audio-notice" role="alert">
      <span>
        <strong>Playback stopped.</strong> {audioError}
      </span>
      <button onClick={retryAudio}>Retry “{track.title}”</button>
    </div>
  );
}

function ProductShell() {
  const { theme } = useApp();
  const desktop = useMediaQuery('(min-width: 1100px)');
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = Number(window.localStorage.getItem('mewzak.panelWidth'));
    return Number.isFinite(saved) && saved >= 288 && saved <= 430 ? saved : 312;
  });
  const os: 'ios' | 'android' =
    /Android/i.test(navigator.userAgent) ? 'android' : 'ios';

  useEffect(() => {
    window.localStorage.setItem('mewzak.panelWidth', String(panelWidth));
  }, [panelWidth]);

  useEffect(() => {
    document.documentElement.dataset.product = 'true';
    return () => {
      delete document.documentElement.dataset.product;
    };
  }, []);

  return (
    <div className={`product-app ${desktop ? 'product-desktop' : 'product-phone'}`} data-theme={theme}>
      <div className="product-stage">
        {desktop ? (
          <DesktopApp panelWidth={panelWidth} setPanelWidth={setPanelWidth} />
        ) : (
          <PhoneApp os={os} />
        )}
      </div>
      <AudioNotice />
      <PlaylistManager />
    </div>
  );
}

export function ProductApp() {
  const [boot, setBoot] = useState<BootState>('loading');
  const [bootError, setBootError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState<P2Session>(() => loadSession());

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 26000);
    setBoot('loading');
    setBootError(undefined);
    (async () => {
      try {
        const { tracks, sources } = await fetchTrending(controller.signal);
        const catalogue = buildCatalogue(tracks, sources);
        installCatalogue(catalogue);

        // Saved playlists keep IDs only. Re-read any tracks that are not in the
        // fresh trending shelf from Audius instead of persisting source metadata.
        const library = loadLibrary();
        const savedIds = Array.from(
          new Set([
            ...library.liked,
            ...library.playlists.flatMap((playlist) => playlist.trackIds),
            ...library.queue,
            ...(library.currentId ? [library.currentId] : []),
          ]),
        );
        const missing = savedIds
          .filter((id) => id.startsWith('au-track-') && !trackById[id])
          .map((id) => id.slice('au-track-'.length));
        if (missing.length) {
          const hydrated = await fetchTracksByIds(missing, controller.signal);
          if (hydrated.tracks.length) {
            const extra = buildCatalogue(hydrated.tracks, hydrated.sources);
            mergeSourceCatalogue({
              tracks: extra.tracks,
              artists: extra.artists,
              albums: extra.albums,
            });
          }
        }
        setBoot('ready');
      } catch (error) {
        if (controller.signal.aborted) {
          setBootError('The music source took too long to answer. Check the connection and try again.');
        } else {
          setBootError(error instanceof Error ? error.message : 'The music source did not answer.');
        }
        setBoot('error');
      } finally {
        window.clearTimeout(timer);
      }
    })();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [attempt]);

  if (boot !== 'ready') {
    return <BootScreen state={boot} message={bootError} onRetry={() => setAttempt((value) => value + 1)} />;
  }

  return (
    <AppProvider mode="product" profile={toProfile(session)}>
      <ProductShell />
      {session.completed ? null : (
        <div className="p2-scope product-onboarding product-onboarding--overlay">
          <OnboardingFlow
            initial={session}
            localOnly
            onProgress={setSession}
            onComplete={(next) => {
              setSession(next);
              setBoot('ready');
            }}
          />
        </div>
      )}
    </AppProvider>
  );
}

