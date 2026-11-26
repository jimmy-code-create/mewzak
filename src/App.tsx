import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Blocks,
  Cat,
  ChevronDown,
  LayoutGrid,
  Layers,
  MessageSquare,
  Minus,
  Monitor,
  Moon,
  Palette,
  PawPrint,
  Smartphone,
  Sparkles,
  Square,
  Sun,
  X,
} from 'lucide-react';
import { AppProvider, useApp, type PanelTab, type ScreenName } from './store';
import { PhoneApp } from './phone/PhoneApp';
import { DesktopApp } from './desktop/DesktopApp';
import { BrandView } from './views/BrandView';
import { TokensView } from './views/TokensView';
import { ComponentsView } from './views/ComponentsView';
import { MicrocopyView } from './views/MicrocopyView';
import { CatMark, Logo } from './components/Brand';
import { Phase2View } from './phase2/Phase2View';
import { DownloadMenu } from './phase2/ui';

type StudioTab = 'prototype' | 'phase2' | 'brand' | 'tokens' | 'components' | 'copy';
type StageView = 'both' | 'phone' | 'desktop';

const STUDIO_TABS: { id: StudioTab; label: string; icon: LucideIcon }[] = [
  { id: 'prototype', label: 'Prototype', icon: LayoutGrid },
  { id: 'phase2', label: 'Phase 2', icon: Sparkles },
  { id: 'brand', label: 'Brand kit', icon: Cat },
  { id: 'tokens', label: 'Tokens', icon: Palette },
  { id: 'components', label: 'Components', icon: Blocks },
  { id: 'copy', label: 'Microcopy', icon: MessageSquare },
];

type JumpOption = { value: ScreenName; label: string; id?: string };

const PHONE_SCREENS: JumpOption[] = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'home', label: 'Home' },
  { value: 'search', label: 'Search' },
  { value: 'library', label: 'Library' },
  { value: 'playlist', label: 'Playlist', id: 'late-night-purr' },
  { value: 'album', label: 'Album', id: 'slow-parade' },
  { value: 'artist', label: 'Artist', id: 'luna-vale' },
  { value: 'nowplaying', label: 'Now Playing' },
  { value: 'queue', label: 'Queue' },
  { value: 'lyrics', label: 'Lyrics' },
  { value: 'profile', label: 'Profile' },
  { value: 'settings', label: 'Settings' },
];

const DESKTOP_SCREENS: JumpOption[] = [
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'home', label: 'Home' },
  { value: 'search', label: 'Search' },
  { value: 'library', label: 'Library' },
  { value: 'playlist', label: 'Playlist', id: 'late-night-purr' },
  { value: 'album', label: 'Album', id: 'slow-parade' },
  { value: 'artist', label: 'Artist', id: 'luna-vale' },
  { value: 'profile', label: 'Profile' },
  { value: 'settings', label: 'Settings' },
];

const PANEL_OPTIONS: { value: PanelTab; label: string }[] = [
  { value: 'now', label: 'Now Playing' },
  { value: 'queue', label: 'Queue' },
  { value: 'lyrics', label: 'Lyrics' },
];

/* ── Device frames ─────────────────────────────────────────────────────────── */

function PhoneDevice() {
  const { route, jump } = useApp();
  const [os, setOs] = useState<'ios' | 'android'>('ios');
  const screen = route('phone');

  return (
    <div className="device device--phone">
      <div className="device-head">
        <span className="device-label">
          <i className="dot" />
          Phone <em>· {os === 'ios' ? 'iOS' : 'Android'}</em>
        </span>
        <div className="device-tools">
          <div className="chrome-seg" aria-label="Phone platform">
            <button className={os === 'ios' ? 'is-on' : ''} onClick={() => setOs('ios')} title="iOS chrome">
              iOS
            </button>
            <button
              className={os === 'android' ? 'is-on' : ''}
              onClick={() => setOs('android')}
              title="Android chrome"
            >
              Android
            </button>
          </div>
          <label className="screen-jump">
            <select
              value={screen.name}
              onChange={(e) => {
                const next = PHONE_SCREENS.find((o) => o.value === e.target.value);
                if (next) jump('phone', next.value, next.id);
              }}
              aria-label="Jump to phone screen"
            >
              {PHONE_SCREENS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown />
          </label>
        </div>
      </div>

      <div className="phone-frame">
        <div className="phone-shell">
          <span className="side-btn" aria-hidden="true" />
          <PhoneApp os={os} />
        </div>
      </div>
    </div>
  );
}

function DesktopChrome({ os }: { os: 'mac' | 'win' }) {
  if (os === 'win') {
    return (
      <div className="win-chrome win-chrome--win">
        <div className="win-app-title">
          <CatMark size={14} />
          <span>Mewzak</span>
        </div>
        <div className="win-controls" aria-hidden="true">
          <span><Minus /></span>
          <span><Square /></span>
          <span><X /></span>
        </div>
      </div>
    );
  }
  return (
    <div className="win-chrome win-chrome--mac">
      <div className="win-lights" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <span className="win-title">Mewzak</span>
      <span className="win-right" aria-hidden="true" />
    </div>
  );
}

function DesktopDevice() {
  const { route, jump, panelTab, setPanelTab } = useApp();
  const [os, setOs] = useState<'mac' | 'win'>('mac');
  const [panelWidth, setPanelWidth] = useState(312);
  const screen = route('desktop');

  return (
    <div className="device device--desktop">
      <div className="device-head">
        <span className="device-label">
          <i className="dot" />
          Desktop <em>· {os === 'mac' ? 'macOS' : 'Windows'}</em>
        </span>
        <div className="device-tools">
          <div className="chrome-seg" aria-label="Desktop window chrome">
            <button className={os === 'mac' ? 'is-on' : ''} onClick={() => setOs('mac')} title="macOS chrome">
              macOS
            </button>
            <button className={os === 'win' ? 'is-on' : ''} onClick={() => setOs('win')} title="Windows chrome">
              Windows
            </button>
          </div>
          <label className="screen-jump">
            <select
              value={screen.name}
              onChange={(e) => {
                const next = DESKTOP_SCREENS.find((o) => o.value === e.target.value);
                if (next) jump('desktop', next.value, next.id);
              }}
              aria-label="Jump to desktop screen"
            >
              {DESKTOP_SCREENS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown />
          </label>
          <label className="screen-jump screen-jump--panel">
            <select
              value={panelTab}
              onChange={(e) => setPanelTab(e.target.value as PanelTab)}
              aria-label="Jump to panel"
            >
              {PANEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown />
          </label>
        </div>
      </div>

      <div className="desktop-frame">
        <div className="desk-shell">
          <DesktopChrome os={os} />
          <DesktopApp panelWidth={panelWidth} setPanelWidth={setPanelWidth} />
        </div>
      </div>
    </div>
  );
}

function PrototypeView({ view, setView }: { view: StageView; setView: (v: StageView) => void }) {
  return (
    <section className="stage" data-view={view}>
      <div className="stage-intro">
        <div>
          <p className="eyebrow">Phase 1 · clickable prototype</p>
          <h1>
            Two rooms, <em>one record.</em>
          </h1>
          <p className="stage-sub">
            Phone and desktop, side by side. Playback, likes and the queue are shared — press play in
            one room and the other listens. Tap anything; the screen picker is just a shortcut.
          </p>
        </div>
        <div className="stage-tools">
          <div className="view-toggle" role="tablist" aria-label="Stage layout">
            <button className={view === 'both' ? 'is-on' : ''} onClick={() => setView('both')}>
              <LayoutGrid /> Both
            </button>
            <button className={view === 'phone' ? 'is-on' : ''} onClick={() => setView('phone')}>
              <Smartphone /> Phone
            </button>
            <button className={view === 'desktop' ? 'is-on' : ''} onClick={() => setView('desktop')}>
              <Monitor /> Desktop
            </button>
          </div>
        </div>
      </div>

      <div className="devices">
        <PhoneDevice />
        <DesktopDevice />
      </div>

      <div className="stage-hint">
        <span><PawPrint /> Playback is synced across both frames</span>
        <span className="sep" />
        <span>Try the toe-bean pause, the shrinking tab bar, and the resizable desktop panel</span>
        <span className="sep" />
        <span>Space toggles play unless you’re typing</span>
      </div>
    </section>
  );
}

/* ── Studio ────────────────────────────────────────────────────────────────── */

function Studio() {
  const { theme, setTheme, transparency, setTransparency, motion, setMotion } = useApp();
  const [tab, setTab] = useState<StudioTab>('prototype');
  const [view, setView] = useState<StageView>('both');

  return (
    <div
      className="studio"
      data-theme={theme}
      data-transparency={transparency}
      data-motion={motion ? 'on' : 'off'}
    >
      <div className="studio-bg" aria-hidden="true" />

      <header className="studio-bar glass">
        <div className="studio-brand">
          <Logo size={23} />
          <div className="studio-brand-meta">
            <strong>Mewzak</strong>
            <span>Design studio · Phase 1 + 2</span>
          </div>
        </div>

        <nav className="studio-nav" aria-label="Studio sections">
          {STUDIO_TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={tab === t.id ? 'is-on' : ''}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                <Icon />
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="studio-spacer" />

        <div className="studio-controls">
          <div className="p2-scope studio-download" data-p2-theme={theme}>
            <DownloadMenu compact />
          </div>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-label="Switch theme"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button
            className={`icon-btn ${transparency === 'reduced' ? 'is-on' : ''}`}
            onClick={() => setTransparency(transparency === 'reduced' ? 'full' : 'reduced')}
            title="Toggle reduced transparency"
            aria-label="Toggle reduced transparency"
            aria-pressed={transparency === 'reduced'}
          >
            <Layers />
          </button>
          <button
            className={`icon-btn ${!motion ? 'is-on' : ''}`}
            onClick={() => setMotion(!motion)}
            title="Toggle reduced motion"
            aria-label="Toggle reduced motion"
            aria-pressed={!motion}
          >
            <Sparkles />
          </button>
          <span className="studio-version">
            <i /> v0.2 · Phase 1 + 2
          </span>
        </div>
      </header>

      <main className="studio-main">
        {tab === 'prototype' && <PrototypeView view={view} setView={setView} />}
        {tab === 'phase2' && <Phase2View />}
        {tab === 'brand' && <BrandView />}
        {tab === 'tokens' && <TokensView />}
        {tab === 'components' && <ComponentsView />}
        {tab === 'copy' && <MicrocopyView />}
      </main>

      <footer className="studio-foot">
        <span className="mini-logo">
          <CatMark size={18} gradient />
          <span className="wordmark">mewzak</span>
          <span>· design studio</span>
        </span>
        <span>The studio is design only — no audio, no backend, no accounts.</span>
        <span>Android · iOS · macOS · Windows · download menu included</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Studio />
    </AppProvider>
  );
}
