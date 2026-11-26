import tokens from '../../tokens/phase2.tokens.json';
import { P2Wordmark } from './ui';

const COLOR_TOKENS = [
  { label: 'Rust ground', key: '--p2-rust', value: tokens.color.rust },
  { label: 'Rust highlight', key: '--p2-rust-hi', value: tokens.color.rustHighlight },
  { label: 'Deep maroon', key: '--p2-deep', value: tokens.color.deepMaroon },
  { label: 'Cream', key: '--p2-cream', value: tokens.color.cream },
  { label: 'Page light', key: '--p2-page', value: tokens.color.pageLight },
  { label: 'Card light', key: '--p2-card', value: tokens.color.cardLight },
  { label: 'Ink', key: '--p2-ink', value: tokens.color.ink },
  { label: 'Dark button', key: '--p2-dark-btn', value: tokens.color.darkButton },
  { label: 'Dark surface', key: '--p2-dark-card', value: tokens.color.darkSurface },
  { label: 'Disabled', key: '--p2-disabled', value: tokens.color.disabled },
];

const RADII = [
  { label: 'Input', value: tokens.radius.input },
  { label: 'Card', value: tokens.radius.card },
  { label: 'Large card', value: tokens.radius.cardLarge },
  { label: 'Pill', value: tokens.radius.pill },
  { label: 'Circle', value: tokens.radius.circle },
];

export function TokensView() {
  return (
    <div className="p2-gallery">
      <div className="p2-view p2-view--gallery">
        <header className="p2-view-head">
          <div className="p2-view-intro">
            <div>
              <span className="p2-eyebrow">
                <i /> Design tokens · single source
              </span>
              <h1>
                Retheme it <em>in one file.</em>
              </h1>
              <p>
                Phase 2 consumes a scoped token contract. Change a value in the JSON, mirror it in the
                two CSS custom-property blocks, and the onboarding, profile and shell follow. Phase 1’s
                tokens stay exactly where they were.
              </p>
            </div>
            <div className="p2-view-side">
              <strong>Contract file</strong>
              <code style={{ fontSize: 9, wordBreak: 'break-all' }}>tokens/phase2.tokens.json</code>
              <p>
                Colors, type, spacing, radii, motion and breakpoints. Dark and light switch through the
                same names.
              </p>
            </div>
          </div>
        </header>

        <div className="p2-view-body">
          <div className="p2-tokens">
            <div className="p2-token-hero">
              <div>
                <span className="p2-eyebrow">
                  <i /> Warm editorial · v{tokens.meta.version}
                </span>
                <h2>Rust, cream and one hot gradient.</h2>
                <p>
                  A page that feels handled rather than rendered. Warm neutrals do the talking; the gradient
                  is reserved for the moment the room asks you to move.
                </p>
              </div>
              <div className="p2-token-file">
                <strong>tokens/phase2.tokens.json</strong>
                <span>{tokens.meta.scope}</span>
                <span>Phase 1 tokens remain in tokens/tokens.json.</span>
              </div>
            </div>

            <section>
              <div className="p2-demo-section-head">
                <h2>Color</h2>
                <span>10 primitives + gradient + mesh</span>
              </div>
              <div className="p2-token-grid" style={{ marginTop: 14 }}>
                {COLOR_TOKENS.map((token) => (
                  <div className="p2-swatch" key={token.key}>
                    <div
                      className="p2-swatch-chip"
                      style={{
                        background: token.value,
                        boxShadow:
                          token.value.startsWith('rgba') ? 'inset 0 0 0 1px rgba(23,19,16,.12)' : undefined,
                      }}
                    />
                    <div className="p2-swatch-info">
                      <strong>{token.label}</strong>
                      <code>{token.key}</code>
                      <code>{token.value}</code>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="p2-token-panels">
              <div className="p2-token-panel">
                <h3>
                  Gradient <span>Primary CTA</span>
                </h3>
                <div className="p2-token-gradient" />
                <div className="p2-token-list">
                  {Object.entries(tokens.color.gradient)
                    .filter(([key]) => key !== 'value')
                    .map(([key, value]) => (
                      <div className="p2-token-line" key={key}>
                        <span>{key}</span>
                        <code>{value}</code>
                      </div>
                    ))}
                </div>
              </div>

              <div className="p2-token-panel">
                <h3>
                  Profile mesh <span>Derived from the avatar</span>
                </h3>
                <div className="p2-token-mesh" />
                <div className="p2-token-list">
                  {tokens.color.mesh.map((value, i) => (
                    <div className="p2-token-line" key={value}>
                      <span>mesh.{i + 1}</span>
                      <code>{value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p2-token-panels">
              <div className="p2-token-panel">
                <h3>
                  Type <span>Editorial serif + quiet sans</span>
                </h3>
                <div className="p2-type-sample">
                  <div className="p2-type-row">
                    <span className="p2-type-serif">No rush in the room.</span>
                    <code>Fraunces · 500</code>
                  </div>
                  <div className="p2-type-row">
                    <span className="p2-type-sans">A player for slow evenings and clean windows.</span>
                    <code>DM Sans · 400</code>
                  </div>
                  <div className="p2-type-row">
                    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                      A small label
                    </span>
                    <code>DM Sans · 600</code>
                  </div>
                </div>
              </div>

              <div className="p2-token-panel">
                <h3>
                  Radius <span>Soft, not round</span>
                </h3>
                <div className="p2-token-radius">
                  {RADII.map((r) => (
                    <div key={r.label}>
                      <span style={{ borderRadius: r.value }} />
                      <strong>{r.label}</strong>
                      <code>{r.value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p2-token-panels">
              <div className="p2-token-panel">
                <h3>
                  Spacing <span>4px base</span>
                </h3>
                <div className="p2-token-list">
                  {Object.entries(tokens.spacing).map(([key, value]) => (
                    <div className="p2-token-line" key={key}>
                      <span>space.{key}</span>
                      <code>{value}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p2-token-panel">
                <h3>
                  Motion <span>Transform + opacity only</span>
                </h3>
                <div className="p2-token-list">
                  {Object.entries(tokens.motion).map(([key, value]) => (
                    <div className="p2-token-line" key={key}>
                      <span>{key}</span>
                      <code>{value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p2-token-panels">
              <div className="p2-token-panel">
                <h3>
                  Breakpoints <span>Container, not viewport</span>
                </h3>
                <div className="p2-token-list">
                  {Object.entries(tokens.breakpoints).map(([key, value]) => (
                    <div className="p2-token-line" key={key}>
                      <span>{key}</span>
                      <code>{value === 0 ? '0px' : `${value}px`}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p2-token-panel">
                <h3>
                  Layout <span>The column knows its width</span>
                </h3>
                <div className="p2-token-list">
                  {Object.entries(tokens.layout).map(([key, value]) => (
                    <div className="p2-token-line" key={key}>
                      <span>{key}</span>
                      <code>{value}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p2-token-panels">
              <div className="p2-token-panel">
                <h3>
                  Accessibility <span>Non-negotiable</span>
                </h3>
                <div className="p2-token-list">
                  {Object.entries(tokens.accessibility).map(([key, value]) => (
                    <div className="p2-token-line" key={key}>
                      <span>{key}</span>
                      <code style={{ maxWidth: '58%', textAlign: 'right', whiteSpace: 'normal' }}>{value}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p2-token-panel">
                <h3>
                  Themes <span>Same names, different light</span>
                </h3>
                <div className="p2-tag-row" style={{ marginBottom: 12 }}>
                  <span className="p2-small-tag">[data-p2-theme=&quot;light&quot;]</span>
                  <span className="p2-small-tag">[data-p2-theme=&quot;dark&quot;]</span>
                </div>
                <p style={{ fontSize: 10.5, lineHeight: 1.6, color: 'var(--p2-muted)' }}>
                  Every shell surface reads from the same semantic names. The onboarding atmosphere is
                  deliberately independent: rust and maroon are part of the welcome, not the app chrome.
                </p>
              </div>
            </div>

            <div className="p2-view-foot">
              <P2Wordmark size={16} />
              <span>
                {tokens.meta.name} · {tokens.meta.source}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
