import { useState } from 'react';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { loadSession, OnboardingFlow, saveSession, type P2Session } from './Onboarding';
import { P2App } from './App';
import { SystemView } from './SystemView';
import { TokensView } from './TokensView';
import { DownloadMenu, P2Wordmark, classNames } from './ui';

type Phase2Mode = 'flow' | 'system' | 'tokens';
type StageWidth = '360' | '768' | 'full';
type FlowScreen = 'onboarding' | 'app';

const MODE_LABELS: { id: Phase2Mode; label: string }[] = [
  { id: 'flow', label: 'Flow & profile' },
  { id: 'system', label: 'Components' },
  { id: 'tokens', label: 'Tokens' },
];

export function Phase2View() {
  const [session, setSession] = useState<P2Session>(loadSession);
  const [screen, setScreen] = useState<FlowScreen>(session.completed ? 'app' : 'onboarding');
  const [mode, setMode] = useState<Phase2Mode>('flow');
  const [width, setWidth] = useState<StageWidth>('full');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [replay, setReplay] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const startReplay = () => {
    setReplay(true);
    setScreen('onboarding');
    setMode('flow');
    setReplayKey((k) => k + 1);
  };

  const updateSession = (next: P2Session) => {
    saveSession(next);
    setSession(next);
  };

  const complete = (next: P2Session) => {
    saveSession(next);
    setSession(next);
    setReplay(false);
    setScreen('app');
  };

  return (
    <section className="p2-scope" data-p2-theme={theme} aria-label="Mewzak Phase 2">
      <div className="p2-view">
        <div className="p2-view-head">
          <div className="p2-view-intro">
            <div>
              <span className="p2-eyebrow">
                <i /> Phase 2 · design system + onboarding + profile
              </span>
              <h1>
                A warmer room. <em>Same cat.</em>
              </h1>
              <p>
                One responsive codebase for phone, tablet and desktop. The onboarding background is
                persistent while the steps move over it; the profile melts its mesh into cream; the shell
                shares one active pill from tab bar to sidebar. Phase 1 is untouched in the Prototype tab.
              </p>
            </div>
            <div className="p2-view-side">
              <strong>What’s inside</strong>
              <p>8-step onboarding with resumable progress, a profile surface, a 5-tab shell and a full component library.</p>
              <p>Download options cover macOS, Windows, iOS and Android; installers are intentionally not included in this design prototype.</p>
            </div>
          </div>

          <div className="p2-view-nav">
            <div className="p2-subtabs" role="tablist" aria-label="Phase 2 views">
              {MODE_LABELS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  role="tab"
                  aria-selected={mode === m.id}
                  className={classNames('p2-subtab', mode === m.id && 'is-on')}
                  onClick={() => setMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p2-view-tools">
              {mode === 'flow' ? (
                <div className="p2-subtabs" role="tablist" aria-label="Flow screen">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={screen === 'onboarding'}
                    className={classNames('p2-subtab', screen === 'onboarding' && 'is-on')}
                    onClick={() => setScreen('onboarding')}
                  >
                    Onboarding
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={screen === 'app'}
                    className={classNames('p2-subtab', screen === 'app' && 'is-on')}
                    onClick={() => setScreen('app')}
                  >
                    Profile + shell
                  </button>
                </div>
              ) : null}

              <span className="p2-view-label">Width</span>
              <div className="p2-widths" role="group" aria-label="Preview width">
                {([
                  ['360', '360'],
                  ['768', '768'],
                  ['full', 'Full'],
                ] as [StageWidth, string][]).map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    className={width === id ? 'is-on' : ''}
                    onClick={() => setWidth(id)}
                    aria-pressed={width === id}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <DownloadMenu />

              <button
                type="button"
                className="p2-view-bar-btn"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              {mode === 'flow' ? (
                <button
                  type="button"
                  className="p2-view-bar-btn"
                  onClick={startReplay}
                  aria-label="Replay onboarding"
                  title="Replay onboarding"
                >
                  <RotateCcw size={14} />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="p2-view-body">
          <div className={classNames('p2-stage-shell')} data-width={width}>
            <div className="p2-stage-frame">
              <div className="p2-stage">
                {mode === 'flow' ? (
                  screen === 'onboarding' ? (
                    <OnboardingFlow
                      key={replayKey}
                      initial={session}
                      replay={replay}
                      onComplete={complete}
                    />
                  ) : (
                    <P2App
                      session={session}
                      onSessionChange={updateSession}
                      onReplay={startReplay}
                      theme={theme}
                      onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    />
                  )
                ) : null}
                {mode === 'system' ? <SystemView /> : null}
                {mode === 'tokens' ? <TokensView /> : null}
              </div>
            </div>
            <div className="p2-stage-caption">
              <span>
                <i /> Live at {width === 'full' ? '1440+' : `${width}px`}
              </span>
              <span className="p2-stage-note">
                Container queries · mobile &lt;640 · tablet 640–1023 · desktop ≥1024
              </span>
            </div>
          </div>
        </div>

        <div className="p2-view-foot" style={{ margin: '0 34px 24px' }}>
          <P2Wordmark size={17} />
          <span>Phase 1 preserved · Phase 2 additive · one responsive codebase</span>
        </div>
      </div>
    </section>
  );
}
