import { useState, type ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  Disc3,
  Heart,
  ListMusic,
  ListPlus,
  Mic2,
  MoreHorizontal,
  PawPrint,
  Play,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { useApp } from '../store';
import { trackById } from '../data';
import { Logo, Mascot, MASCOT_STATES, SectionTitle } from '../components/Brand';
import {
  AlbumCard,
  Art,
  ArtistChip,
  EmptyState,
  PlayButton,
  PlaylistCard,
  ScrubBar,
  ScrubRow,
  SearchBar,
  Seg,
  Skeleton,
  Toggle,
  TrackMenu,
  TrackRow,
  TransportControls,
  VolumeSlider,
  artVars,
} from '../components/ui';
import { MiniPlayer, PhoneTabBar } from '../phone/PhoneApp';
import { Sidebar as DesktopSidebar } from '../desktop/DesktopApp';

function Demo({
  title,
  note,
  tag,
  children,
  span = false,
  tall = false,
}: {
  title: string;
  note: string;
  tag: string;
  children: ReactNode;
  span?: boolean;
  tall?: boolean;
}) {
  return (
    <section className={`comp-card ${span ? 'comp-card--span' : ''} ${tall ? 'comp-card--tall' : ''}`}>
      <header className="comp-card-head">
        <div>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        <span className="comp-tag">{tag}</span>
      </header>
      <div className="comp-preview">{children}</div>
    </section>
  );
}

function SearchDemo() {
  const [value, setValue] = useState('');
  return (
    <div className="demo-stack">
      <SearchBar value={value} onChange={setValue} hint="⌘K" />
      <span className="state-note">{value ? `Live query: “${value}”` : 'Idle. Clear button appears on input.'}</span>
    </div>
  );
}

function ScrubDemo() {
  const [value, setValue] = useState(38);
  return (
    <div className="demo-stack">
      <div className="demo-scrub-times">
        <span>0:38</span>
        <span>3:42</span>
      </div>
      <ScrubBar value={value} max={222} onChange={setValue} />
      <div className="demo-scrub-row">
        <span className="state-note">Drag</span>
        <button className="btn btn--ghost btn--sm" onClick={() => setValue(0)}>Reset</button>
        <span className="state-note">Thumb appears on hover/touch</span>
      </div>
    </div>
  );
}

function InputDemo() {
  const [seg, setSeg] = useState<'list' | 'grid'>('list');
  const [on, setOn] = useState(true);
  return (
    <div className="demo-primitives">
      <div className="demo-row">
        <button className="btn btn--primary"><Play size={14} /> Play all</button>
        <button className="btn">Add to queue</button>
        <button className="btn btn--soft">Save</button>
        <button className="btn btn--ghost">Cancel</button>
        <button className="btn" disabled>Disabled</button>
      </div>
      <div className="demo-row">
        <span className="chip">Default chip</span>
        <span className="chip is-on">Selected</span>
        <span className="chip chip--solid">Solid</span>
        <span className="chip is-on"><Check size={12} /> Checked</span>
      </div>
      <div className="demo-row">
        <Seg
          value={seg}
          options={[
            { value: 'list', label: 'List' },
            { value: 'grid', label: 'Grid' },
          ]}
          onChange={setSeg}
        />
        <Toggle checked={on} onChange={setOn} label="Demo toggle" />
        <span className="state-note">{on ? 'On' : 'Off'} · 42 × 25 · 40 px target</span>
      </div>
    </div>
  );
}

function SheetDemo() {
  const { track } = useApp();
  return (
    <div className="demo-sheet" data-theme="dark" style={artVars(track.palette)}>
      <div className="demo-sheet-head">
        <ChevronDown size={14} />
        <span>Playing from Late Night Purr</span>
        <MoreHorizontal size={14} />
      </div>
      <Art palette={track.palette} variant={track.art} radius={16} className="demo-sheet-art" />
      <div className="demo-sheet-meta">
        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <Heart size={15} />
      </div>
      <ScrubRow compact />
      <TransportControls />
    </div>
  );
}

function MenuDemo() {
  const track = trackById['slow-blink'];
  return (
    <div className="ctx-demo">
      <TrackMenu track={track} platform="desktop" onClose={() => undefined} />
    </div>
  );
}

function ToastDemo() {
  return (
    <div className="demo-toasts">
      <div className="toast">
        <span className="toast-paw"><PawPrint size={12} /></span>
        <span className="toast-msg">Saved. Very purr-sonal.</span>
        <button className="toast-action">Undo</button>
        <button className="toast-x"><X size={11} /></button>
      </div>
      <div className="toast toast--warn">
        <span className="toast-paw"><PawPrint size={12} /></span>
        <span className="toast-msg">No signal. Cached tracks still purr.</span>
        <button className="toast-x"><X size={11} /></button>
      </div>
      <div className="toast toast--accent">
        <span className="toast-paw"><PawPrint size={12} /></span>
        <span className="toast-msg">Downloaded. Paws off the Wi-Fi.</span>
        <button className="toast-x"><X size={11} /></button>
      </div>
    </div>
  );
}

function SkeletonDemo() {
  return (
    <div className="demo-skeleton">
      <div className="demo-skeleton-row">
        <Skeleton h={44} w={44} r={10} />
        <div>
          <Skeleton h={10} w="68%" />
          <Skeleton h={8} w="42%" />
        </div>
      </div>
      <div className="demo-skeleton-row">
        <Skeleton h={44} w={44} r={10} />
        <div>
          <Skeleton h={10} w="54%" />
          <Skeleton h={8} w="34%" />
        </div>
      </div>
      <div className="demo-skeleton-tiles">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <Skeleton h="auto" w="100%" r={12} className="skel-square" />
            <Skeleton h={9} w="72%" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComponentsView() {
  return (
    <div className="view">
      <header className="view-hero">
        <div className="view-hero-copy">
          <span className="eyebrow">Component library · Phase 1</span>
          <h1 className="display">Every piece, every state.</h1>
          <p>
            A working inventory, not a specimen sheet. The controls below are the controls in the
            prototype — press them, type in them, open a menu. Hover states use one timing family;
            every component respects reduced motion and reduced transparency.
          </p>
        </div>
        <div className="view-hero-card glass comp-hero-card">
          <div className="comp-hero-row">
            <span>18 components</span>
            <span className="comp-hero-pill">All states</span>
          </div>
          <div className="comp-hero-icons">
            <PawPrint />
            <Play />
            <Heart />
            <ListMusic />
            <Mic2 />
            <Search />
          </div>
          <div className="token-hero-foot">Lucide · 1.75 px stroke · 24 px box</div>
        </div>
      </header>

      <SectionTitle eyebrow="01 · Identity & controls" title="Brand surfaces">
        <span className="view-note">Four platforms, one visual grammar.</span>
      </SectionTitle>

      <div className="comp-grid">
        <Demo title="Logo" note="Mark, wordmark and lockup. Gradient only on the mark." tag="brand / 3 variants">
          <div className="demo-logos">
            <div className="demo-surface" data-theme="dark">
              <Logo size={25} />
              <span>Lockup · dark</span>
            </div>
            <div className="demo-surface" data-theme="light">
              <Logo size={25} />
              <span>Lockup · light</span>
            </div>
            <div className="demo-logo-row">
              <Logo variant="mark" size={34} />
              <Logo variant="wordmark" size={26} />
              <span className="state-note">Mark · wordmark</span>
            </div>
          </div>
        </Demo>

        <Demo title="Mascot" note="Line-art cat. Decoration only, never over artwork." tag="5 states">
          <div className="demo-mascots">
            {MASCOT_STATES.map((m) => (
              <div key={m.state}>
                <Mascot state={m.state} size={72} />
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </Demo>

        <Demo title="PlayButton" note="The one place the full gradient appears at rest. Pause stays two bars; the paw is a hover egg." tag="primary · sizes 38–68">
          <div className="demo-play-row">
            <div>
              <PlayButton size={38} />
              <span>sm</span>
            </div>
            <div>
              <PlayButton size={52} />
              <span>md</span>
            </div>
            <div>
              <PlayButton size={66} />
              <span>lg</span>
            </div>
            <div>
              <PlayButton size={44} plain />
              <span>plain</span>
            </div>
          </div>
          <p className="demo-hint">Pause has a paw badge on hover; the tooltip reads “Pawse”.</p>
        </Demo>

        <Demo title="TabBar" note="Phone primary navigation. Labels fade and the bar shrinks by 12 px after 28 px of scroll." tag="glass · 3 tabs">
          <div className="demo-dock demo-tabbar">
            <PhoneTabBar active="home" onTab={() => undefined} />
          </div>
        </Demo>

        <Demo title="MiniPlayer" note="Docked above the tab bar; progress uses the current artwork accent." tag="glass · docked">
          <div className="demo-dock demo-mini">
            <MiniPlayer />
          </div>
        </Demo>

        <Demo title="Sidebar" note="Desktop navigation, playlists and account. Collapses to an icon rail on tablet." tag="glass · desktop">
          <div className="demo-sidebar">
            <DesktopSidebar />
          </div>
        </Demo>

        <Demo title="NowPlayingSheet" note="Full-screen phone player. Artwork, metadata, scrub, transport and the lyrics / queue actions." tag="sheet · phone">
          <SheetDemo />
        </Demo>
      </div>

      <SectionTitle eyebrow="02 · Music objects" title="Rows, cards & people">
        <span className="view-note">Artwork and lists stay solid; only floating functional layers use glass.</span>
      </SectionTitle>

      <div className="comp-grid">
        <Demo
          title="TrackRow"
          note="Phone and desktop variants. Number or live equalizer, artwork, two-line metadata, like, duration and contextual menu."
          tag="row · all states"
          span
        >
          <div className="demo-row-split">
            <div className="demo-phone-panel">
              <span className="demo-panel-label">Phone</span>
              <TrackRow trackId="slow-blink" index={0} platform="phone" variant="phone" />
              <TrackRow trackId="paper-moon" index={1} platform="phone" variant="phone" />
              <TrackRow trackId="moth-hour" index={2} platform="phone" variant="phone" />
            </div>
            <div className="demo-desktop-panel">
              <span className="demo-panel-label">Desktop</span>
              <TrackRow trackId="slow-blink" index={0} platform="desktop" variant="desktop" />
              <TrackRow trackId="paper-moon" index={1} platform="desktop" variant="desktop" />
              <TrackRow trackId="moth-hour" index={2} platform="desktop" variant="desktop" />
            </div>
          </div>
        </Demo>

        <Demo title="AlbumCard" note="Solid artwork, hover lift, play affordance appears without taking over." tag="card · album">
          <div className="demo-card-strip">
            <AlbumCard albumId="slow-parade" platform="phone" />
            <AlbumCard albumId="glass-hour" platform="phone" />
            <AlbumCard albumId="catnap" platform="phone" />
          </div>
        </Demo>

        <Demo title="PlaylistCard" note="Curator and track count over the artwork. Hover raises the play chip." tag="card · playlist">
          <div className="demo-card-strip">
            <PlaylistCard playlistId="late-night-purr" platform="phone" />
            <PlaylistCard playlistId="sunday-loaf" platform="phone" />
            <PlaylistCard playlistId="rainy-window" platform="phone" />
          </div>
        </Demo>

        <Demo title="ArtistChip" note="Used in search, library and profile. Circle art keeps the artist recognisable in one row." tag="chip · artist">
          <div className="demo-artist-stack">
            <ArtistChip artistId="luna-vale" platform="phone" size={38} />
            <ArtistChip artistId="mira-chen" platform="phone" size={38} />
            <ArtistChip artistId="yuki-halo" platform="phone" size={38} />
          </div>
        </Demo>

        <Demo title="ContextMenu" note="Next, queue, like, go to, share and download. Same menu on right-click and the row’s ellipsis." tag="menu · track">
          <MenuDemo />
        </Demo>
      </div>

      <SectionTitle eyebrow="03 · Inputs & feedback" title="Small parts, honest states">
        <span className="view-note">A toast never carries required information. An error always offers a retry.</span>
      </SectionTitle>

      <div className="comp-grid">
        <Demo title="SearchBar" note="44 px phone, 46 px desktop. ⌘K hint desktop only; clear action respects focus." tag="input · search">
          <SearchDemo />
        </Demo>

        <Demo title="ScrubBar" note="Pointer and touch friendly. Hover reveals the thumb; player uses artwork accent." tag="range · scrub">
          <ScrubDemo />
        </Demo>

        <Demo title="VolumeSlider" note="Mute toggles to 72%. Same range primitive as the scrub bar." tag="range · volume">
          <div className="demo-stack">
            <VolumeSlider />
            <span className="state-note">Try the mute icon. Value persists across both platforms.</span>
          </div>
        </Demo>

        <Demo title="ContextMenu states" note="Destructive actions never live in this menu; removal from queue is a quiet text action." tag="menu · density">
          <div className="demo-menu-states">
            <div className="ctx-menu ctx-menu--static">
              <div className="ctx-head"><strong>Slow Blink</strong><span>Luna Vale</span></div>
              <button><ListPlus /> Play next</button>
              <button><ListMusic /> Add to queue</button>
              <button><Heart className="is-filled" /> Remove from Liked Songs</button>
              <div className="ctx-sep" />
              <button><SharingIcon /> Share</button>
            </div>
          </div>
        </Demo>

        <Demo title="Toast" note="Default, warning and confirmation tones. One line, auto-dismiss in 3.6 s, optional undo." tag="feedback · 3 tones">
          <ToastDemo />
        </Demo>

        <Demo title="EmptyState" note="Mascot earns its place here. Two lines max, then one action." tag="feedback · empty + error">
          <div className="demo-empties">
            <EmptyState
              state="sleeping"
              title="Nothing’s next."
              body="A perfect time for a catnap."
              size={88}
            />
            <EmptyState
              state="error"
              title="Search tripped."
              body="Give it another go."
              action="Retry"
              size={88}
            />
          </div>
        </Demo>

        <Demo title="Skeleton" note="Matches final layout; only after 400 ms of waiting. The screen stays usable while it loads." tag="loading · shimmer">
          <SkeletonDemo />
        </Demo>

        <Demo title="Primitives" note="Buttons, chips, segmented controls and switches. All share the 4 px scale and 1.75 px stroke." tag="foundation">
          <InputDemo />
        </Demo>
      </div>

      <SectionTitle eyebrow="04 · Composition note" title="How they hold together">
        <span className="view-note">If a component is not in this list, it probably shouldn’t exist yet.</span>
      </SectionTitle>
      <div className="comp-footer-note">
        <div className="comp-footer-icon"><PawPrint /></div>
        <div>
          <h3>One library, four shells</h3>
          <p>
            The controls are platform-neutral; only the shell changes. Phone composes a tab bar and
            docked mini player; tablet converts the sidebar to a rail and the sheet to an overlay;
            desktop adds a resizable right panel and a transport bar. The same TrackRow, cards, scrub
            bar and menus are reused everywhere, which is what keeps patterns predictable when the
            screen grows.
          </p>
        </div>
      </div>
    </div>
  );
}

function SharingIcon() {
  return <Share2 />;
}
