import { useState, type ReactNode } from 'react';
import {
  Bookmark,
  Check,
  Heart,
  ListMusic,
  Pause,
  Play,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { trackById } from '../data';
import { PROFILE, SHELL, VIBE } from './copy';
import {
  DateWheel,
  DownloadMenu,
  P2Avatar,
  P2AvatarStack,
  P2Back,
  P2Button,
  P2Chip,
  P2Dots,
  P2Field,
  P2IconButton,
  P2Skip,
  P2Spinner,
  P2TabBar,
  P2Wordmark,
  SHELL_TABS,
  SkeletonRows,
  StatusPill,
  classNames,
  type ShellTab,
} from './ui';

function DemoCard({
  title,
  note,
  tag,
  children,
  span = false,
  dark = false,
  warm = false,
  flush = false,
}: {
  title: string;
  note: string;
  tag?: string;
  children: ReactNode;
  span?: boolean;
  dark?: boolean;
  warm?: boolean;
  flush?: boolean;
}) {
  return (
    <article className={classNames('p2-demo-card', span && 'p2-demo-card--span')}>
      <div className="p2-demo-head">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        {tag ? <span className="p2-demo-tag">{tag}</span> : null}
      </div>
      <div
        className={classNames(
          'p2-demo-canvas',
          dark && 'p2-demo-canvas--dark',
          warm && 'p2-demo-canvas--warm',
          flush && 'p2-demo-canvas--flush',
        )}
      >
        {children}
      </div>
    </article>
  );
}

function SectionHead({ title, count }: { title: string; count: string }) {
  return (
    <div className="p2-demo-section-head">
      <h2>{title}</h2>
      <span>{count}</span>
    </div>
  );
}

function CreatorDemo() {
  const [following, setFollowing] = useState(false);
  const [gone, setGone] = useState(false);
  if (gone) {
    return (
      <div className="p2-demo-stack" style={{ alignItems: 'center' }}>
        <p className="p2-demo-note">Dismissed. The rail gets quieter.</p>
        <P2Button variant="dark" onClick={() => setGone(false)}>
          Bring it back
        </P2Button>
      </div>
    );
  }
  return (
    <article className="p2-creator p2-demo-creator">
      <button type="button" className="p2-creator-x" onClick={() => setGone(true)} aria-label="Dismiss creator">
        <X size={12} />
      </button>
      <div className="p2-creator-top">
        <P2Avatar name="Yuki Halo" seed="Yuki Halo" size={44} />
        <div className="p2-creator-copy">
          <strong>
            Yuki Halo
            <Sparkles size={13} aria-hidden="true" />
          </strong>
          <span>Ceramics, choirs, weather</span>
        </div>
      </div>
      <button
        type="button"
        className={classNames('p2-creator-follow', following && 'is-on')}
        onClick={() => setFollowing((f) => !f)}
        aria-pressed={following}
      >
        {following ? PROFILE.following : PROFILE.follow}
      </button>
    </article>
  );
}

function SidebarDemo() {
  const [active, setActive] = useState<ShellTab>('home');
  return (
    <div className="p2-demo-side">
      <aside className="p2-sidebar">
        <div className="p2-sidebar-head">
          <P2Wordmark size={20} />
          <span className="p2-sidebar-collapse" aria-hidden="true" style={{ display: 'grid' }}>
            ‹
          </span>
        </div>
        <nav className="p2-nav" aria-label="Sidebar demo">
          {SHELL_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                className={classNames('p2-nav-item', active === t.id && 'is-on')}
                onClick={() => setActive(t.id)}
              >
                <Icon />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p2-sidebar-sep" />
        <span className="p2-sidebar-label">Your playlists</span>
        <div className="p2-side-playlists">
          {['Late Night Purr', 'Sunday Loaf', 'Focus Paws'].map((p) => (
            <span className="p2-side-playlist" key={p}>
              <i style={{ background: 'linear-gradient(135deg, #cf6bc5, #f2532c)' }} />
              {p}
            </span>
          ))}
        </div>
        <div className="p2-sidebar-user">
          <P2Avatar name="Mina Park" seed="Mina" size={28} grain={false} />
          <span>
            <strong>Mina Park</strong>
            <small>@mewmina</small>
          </span>
        </div>
      </aside>
    </div>
  );
}

export function SystemView() {
  const [field, setField] = useState('Mina Park');
  const [day, setDay] = useState(12);
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(1998);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['indie pop', 'jazz', 'ambient']);
  const [dot, setDot] = useState(1);
  const [tab, setTab] = useState<ShellTab>('profile');
  const [toast, setToast] = useState('Saved. Very purr-sonal.');

  const demoGenres = VIBE.genres.slice(0, 10);

  return (
    <div className="p2-gallery">
      <div className="p2-view p2-view--gallery">
        <header className="p2-view-head">
          <div className="p2-view-intro">
            <div>
              <span className="p2-eyebrow">
                <i /> Component library · all states
              </span>
              <h1>
                Warm editorial, <em>in parts.</em>
              </h1>
              <p>
                Every control used across onboarding, the profile and the shell. Press, disable and load
                them here before wiring a screen. Nothing here is a screenshot; it is the same code.
              </p>
            </div>
            <div className="p2-view-side">
              <strong>8 primitives · 18 states</strong>
              <p>Pill buttons, fields, wheels, chips, avatars, pills, tabs and rails.</p>
              <p>Try Follow, the download menu, both navigation patterns and the bottom tabs.</p>
            </div>
          </div>
        </header>

        <div className="p2-view-body">
          <div className="p2-system">
            <section>
              <SectionHead title="Buttons with manners" count="01 / Actions" />
              <div className="p2-demo-grid">
                <DemoCard
                  title="Pill family"
                  note="Gradient is the one big move per screen. Cream is the warm default."
                  tag="Interactive"
                >
                  <P2Button variant="gradient" icon={<Sparkles size={14} />}>
                    I’m ready
                  </P2Button>
                  <P2Button variant="cream">Continue with Google</P2Button>
                  <P2Button variant="dark">Find your next purr</P2Button>
                  <P2Button variant="quiet">Not now</P2Button>
                  <P2Button variant="gradient" disabled>
                    Disabled
                  </P2Button>
                  <P2Button variant="gradient" loading>
                    Saving
                  </P2Button>
                  <P2IconButton label="Play">
                    <Play size={17} />
                  </P2IconButton>
                  <P2IconButton label="Pause">
                    <Pause size={17} />
                  </P2IconButton>
                </DemoCard>

                <DemoCard
                  title="Loading, disabled, armed"
                  note="Disabled melts into gradient when the form becomes valid, then collapses into a spinner."
                  tag="States"
                  dark
                >
                  <div className="p2-demo-stack">
                    <P2Button variant="gradient" disabled block>
                      Continue
                    </P2Button>
                    <P2Button variant="gradient" armed block>
                      Continue
                    </P2Button>
                    <P2Button variant="gradient" loading block>
                      Continue
                    </P2Button>
                    <P2Spinner />
                  </div>
                </DemoCard>

                <DemoCard
                  title="Social squares"
                  note="Only the providers Phase 1 supports. Dark, square, quiet."
                  tag="Auth"
                  dark
                >
                  <button type="button" className="p2-social-square" aria-label="Continue with Google">
                    <span>G</span>
                  </button>
                  <button type="button" className="p2-social-square" aria-label="Continue with phone">
                    <Plus size={20} />
                  </button>
                  <button type="button" className="p2-social-square" aria-label="Continue with Google" disabled style={{ opacity: 0.4 }}>
                    <span>G</span>
                  </button>
                </DemoCard>

                <DemoCard
                  title="Back, skip, spinner"
                  note="The quiet navigation. Pink arc on a warm ground."
                  tag="Chrome"
                  warm
                >
                  <P2Back onClick={() => setToast('Back. Where you came from.')} />
                  <P2Skip onClick={() => setToast('Skip. No hard feelings.')} />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,246,236,.7)', fontSize: 10 }}>
                    <P2Spinner />
                    working on it
                  </span>
                </DemoCard>
              </div>
            </section>

            <section>
              <SectionHead title="Inputs & wheels" count="02 / Forms" />
              <div className="p2-demo-grid">
                <DemoCard
                  title="Floating label"
                  note="Translucent dark input, label lifts on focus or when filled."
                  tag="Field"
                  warm
                >
                  <div className="p2-demo-input">
                    <P2Field label="Your name" value={field} onChange={setField} placeholder="Mina Park" />
                  </div>
                </DemoCard>

                <DemoCard
                  title="Wheel date picker"
                  note="Three columns, pink underlines, snap and haptic ticks. Keyboard arrows work."
                  tag="Birthday"
                  dark
                  span
                >
                  <div className="p2-demo-wheel">
                    <DateWheel
                      day={day}
                      month={month}
                      year={year}
                      onDay={setDay}
                      onMonth={(m) => {
                        setMonth(m);
                        setDay((d) => Math.min(d, new Date(year, m + 1, 0).getDate()));
                      }}
                      onYear={(y) => {
                        setYear(y);
                        setDay((d) => Math.min(d, new Date(y, month + 1, 0).getDate()));
                      }}
                    />
                  </div>
                </DemoCard>
              </div>
            </section>

            <section>
              <SectionHead title="Chips & avatars" count="03 / Taste" />
              <div className="p2-demo-grid">
                <DemoCard
                  title="Genre chips"
                  note="Translucent dark at rest, cream when chosen, with a small check."
                  tag="Multi-select"
                  warm
                  span
                >
                  <div className="p2-chip-cloud" style={{ justifyContent: 'center' }}>
                    {demoGenres.map((genre) => (
                      <P2Chip
                        key={genre}
                        on={selectedGenres.includes(genre)}
                        onClick={() =>
                          setSelectedGenres((current) =>
                            current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
                          )
                        }
                      >
                        {genre}
                      </P2Chip>
                    ))}
                  </div>
                </DemoCard>

                <DemoCard
                  title="Marbled avatars"
                  note="Generated from a name hash. The pencil badge is the only affordance."
                  tag="Identity"
                >
                  <div className="p2-demo-avatars">
                    <P2Avatar name="Mina Park" seed="Mina Park" size={48} />
                    <P2Avatar name="Luna Vale" seed="Luna Vale" size={62} />
                    <P2Avatar name="Yuki Halo" seed="Yuki Halo" size={76} editable onEdit={() => setToast('New marble, same you.')} />
                  </div>
                </DemoCard>

                <DemoCard
                  title="Stack & dots"
                  note="The stack is social proof without numbers. Dots stretch, not shout."
                  tag="Navigation"
                >
                  <P2AvatarStack names={['Mina Park', 'Luna Vale', 'Yuki Halo', 'Sable']} size={32} />
                  <P2Dots count={3} active={dot} onChange={setDot} />
                  <span className="p2-demo-note">0{dot + 1} / 03</span>
                </DemoCard>
              </div>
            </section>

            <section>
              <SectionHead title="Status, navigation & content" count="04 / Shell" />
              <div className="p2-demo-grid">
                <DemoCard
                  title="Floating status pill"
                  note="One pill, three jobs: a toast, a loading murmur, and now-playing."
                  tag="Morphing"
                  dark
                  span
                >
                  <div className="p2-demo-stack">
                    <StatusPill mode="toast" message={toast} />
                    <StatusPill mode="loading" message={SHELL.searchPlaceholder} />
                    <StatusPill
                      mode="playing"
                      trackTitle={trackById['slow-blink'].title}
                      trackArtist={trackById['slow-blink'].artist}
                      palette={trackById['slow-blink'].palette}
                      art={trackById['slow-blink'].art}
                      progress={64}
                      onOpen={() => setToast('Opening the player.')}
                    />
                  </div>
                </DemoCard>

                <DemoCard
                  title="Bottom tab bar"
                  note="Active tab is a cream pill. Same geometry on every breakpoint."
                  tag="Mobile"
                  dark
                  flush
                >
                  <P2TabBar active={tab} onChange={setTab} className="p2-demo-tabbar" />
                </DemoCard>

                <DemoCard
                  title="Desktop sidebar"
                  note="A full 248px rail that collapses to icons. Same active pill as the tab bar."
                  tag="Desktop"
                  flush
                  span
                >
                  <SidebarDemo />
                </DemoCard>

                <DemoCard
                  title="Creator card"
                  note="Verified mark, follow, and a small X to make room for someone else."
                  tag="Profile"
                >
                  <CreatorDemo />
                </DemoCard>

                <DemoCard
                  title="Skeleton rows"
                  note="The only honest placeholder. No fake names, no fake counts."
                  tag="Loading"
                >
                  <div style={{ width: '100%' }}>
                    <SkeletonRows rows={3} />
                  </div>
                </DemoCard>

                <DemoCard
                  title="Empty shelf"
                  note="A tidy empty state with one clear way out."
                  tag="Empty"
                  span
                >
                  <div className="p2-empty" style={{ width: '100%' }}>
                    <span className="p2-empty-icon" aria-hidden="true">
                      <Bookmark size={18} />
                    </span>
                    <strong>{PROFILE.emptyTitle}</strong>
                    <p>{PROFILE.emptyBody}</p>
                    <P2Button variant="dark" onClick={() => setToast(PROFILE.emptyAction)}>
                      {PROFILE.emptyAction}
                    </P2Button>
                  </div>
                </DemoCard>
              </div>
            </section>

            <section>
              <SectionHead title="Download, four ways in" count="05 / Distribution" />
              <div className="p2-demo-grid">
                <DemoCard
                  title="Platform menu"
                  note="One button, four honest choices. The prototype labels installers as preview-only; it does not fake a binary."
                  tag="Menu"
                  dark
                  span
                >
                  <div style={{ minHeight: 390, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%', paddingTop: 12 }}>
                    <DownloadMenu />
                  </div>
                </DemoCard>
              </div>
            </section>

            <div className="p2-view-foot">
              <P2Wordmark size={16} />
              <span>Buttons · social · fields · wheel · chips · avatars · dots · status · tabs · sidebar · creator · skeleton · download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
