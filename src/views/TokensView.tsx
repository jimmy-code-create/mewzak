import { CopyChip, Skeleton } from '../components/ui';
import { SectionTitle } from '../components/Brand';

const colorRows = [
  { name: 'bg', dark: '#0B0B0F', light: '#F6F4FB', role: 'App background' },
  { name: 'bgDeep', dark: '#08080B', light: '#EFEAF8', role: 'Window / behind glass' },
  { name: 'surface1', dark: '#14141A', light: '#FFFFFF', role: 'Cards, sidebar, raised' },
  { name: 'surface2', dark: '#1B1B23', light: '#F2EEFA', role: 'Hover, nested surfaces' },
  { name: 'surface3', dark: '#24242E', light: '#E8E2F5', role: 'Pressed, controls' },
  { name: 'line', dark: 'rgba(245,245,247,.08)', light: 'rgba(26,20,48,.09)', role: 'Hairline border' },
  { name: 'text', dark: '#F5F5F7', light: '#14121A', role: 'Primary text' },
  { name: 'text2', dark: '#A1A1AA', light: '#5B5868', role: 'Secondary text' },
  { name: 'text3', dark: '#85858F', light: '#7C7889', role: 'Metadata, timestamps' },
  { name: 'accent', dark: '#B79CFF', light: '#6B47E4', role: 'Active, focus, brand' },
  { name: 'peach', dark: '#FFB48A', light: '#EC9A72', role: 'Gradient partner only' },
  { name: 'onGradient', dark: '#171021', light: '#180F2C', role: 'Ink on gradient controls' },
  { name: 'glassBg', dark: 'rgba(20,20,27,.58)', light: 'rgba(255,255,255,.58)', role: 'Functional glass' },
  { name: 'glassSolid', dark: '#17171F', light: '#FFFFFF', role: 'Reduced-transparency fallback' },
];

const typeRows = [
  { name: 'displayXL', font: 'Bricolage', size: '34 / 36', tracking: '−0.04em', weight: '600' },
  { name: 'displayL', font: 'Bricolage', size: '28 / 31', tracking: '−0.035em', weight: '600' },
  { name: 'title1', font: 'Bricolage', size: '22 / 26', tracking: '−0.025em', weight: '600' },
  { name: 'title2', font: 'Bricolage', size: '17 / 22', tracking: '−0.015em', weight: '600' },
  { name: 'body', font: 'Instrument', size: '14 / 21', tracking: '−0.005em', weight: '400' },
  { name: 'bodyStrong', font: 'Instrument', size: '13 / 19', tracking: '−0.005em', weight: '600' },
  { name: 'caption', font: 'Instrument', size: '11.5 / 16', tracking: '0', weight: '500' },
  { name: 'eyebrow', font: 'Instrument', size: '10.5 / 14', tracking: '+0.12em', weight: '650' },
];

export function TokensView() {
  return (
    <div className="view">
      <header className="view-hero">
        <div className="view-hero-copy">
          <span className="eyebrow">Design tokens · Phase 1</span>
          <h1 className="display">One set of rules, four platforms.</h1>
          <p>
            Semantic tokens only. Components ask for a role (text.secondary), never a raw scale value.
            The same names ship to Flutter, CSS, SwiftUI and WinUI in phase 2 via the JSON in{' '}
            <code>tokens/tokens.json</code>.
          </p>
        </div>
        <div className="view-hero-card glass tokens-hero-card">
          <div className="token-hero-row">
            <span className="token-hero-dot" />
            <span>Semantic first</span>
            <span className="token-hero-pill">v0.1</span>
          </div>
          <div className="token-hero-code">
            <span><i style={{ background: '#B79CFF' }} /> --accent</span>
            <span><i style={{ background: '#FFB48A' }} /> --peach</span>
            <span><i style={{ background: '#0B0B0F', border: '1px solid rgba(255,255,255,.2)' }} /> --bg</span>
            <span><i style={{ background: 'rgba(255,255,255,.22)' }} /> --glass</span>
          </div>
          <div className="token-hero-foot">CSS variables are the reference implementation.</div>
        </div>
      </header>

      <section className="view-section">
        <SectionTitle eyebrow="01 · Color" title="Semantic color">
          <span className="view-note">Both themes are complete. Dark is the default.</span>
        </SectionTitle>
        <div className="token-table token-color-table">
          <div className="token-table-head">
            <span>Token</span>
            <span>Dark</span>
            <span>Light</span>
            <span>Role</span>
          </div>
          {colorRows.map((row) => (
            <div className="token-row" key={row.name}>
              <code>{row.name}</code>
              <span className="token-color-cell">
                <i style={{ background: row.dark }} />
                <em>{row.dark}</em>
              </span>
              <span className="token-color-cell">
                <i style={{ background: row.light }} />
                <em>{row.light}</em>
              </span>
              <span className="token-role">{row.role}</span>
            </div>
          ))}
        </div>
        <div className="token-foot" style={{ marginTop: 12 }}>
          <span className="view-note">
            Contrast measured against <code>bg</code>: text 18.0:1 · secondary 7.7:1 · accent 8.6:1 ·
            ink on accent 8.1:1. Light accent 5.3:1.
          </span>
          <CopyChip value="tokens/tokens.json" />
        </div>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="02 · Type" title="Scale & families">
          <span className="view-note">Bricolage Grotesque · Instrument Sans · tabular numerals</span>
        </SectionTitle>
        <div className="token-table token-type-table">
          <div className="token-table-head">
            <span>Token</span>
            <span>Family</span>
            <span>Size / line</span>
            <span>Tracking</span>
            <span>Weight</span>
          </div>
          {typeRows.map((row) => (
            <div className="token-row" key={row.name}>
              <code>{row.name}</code>
              <span>{row.font}</span>
              <span>{row.size}</span>
              <span>{row.tracking}</span>
              <span>{row.weight}</span>
            </div>
          ))}
        </div>
        <p className="view-note" style={{ marginTop: 10 }}>
          Numeric values (durations, percentages) always use tabular figures. No text below 11 px at
          phone scale; 9 px is reserved for decorative eyebrows in the desktop sidebar only.
        </p>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="03 · Form" title="Radius, space, glass">
          <span className="view-note">Soft, concentric, and legible when the blur is gone.</span>
        </SectionTitle>
        <div className="token-form-grid">
          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Radius</h3>
              <span>inner = outer − inset</span>
            </div>
            <div className="token-radius-row">
              {[
                ['xs', '6', '6px'],
                ['sm', '10', '10px'],
                ['md', '14', '14px'],
                ['lg', '20', '20px'],
                ['xl', '26', '26px'],
                ['pill', '999', '999px'],
              ].map(([name, r, px]) => (
                <div key={name}>
                  <span
                    style={{
                      width: name === 'pill' ? 58 : 46,
                      height: 46,
                      borderRadius: name === 'pill' ? 999 : Math.min(Number(r), 26),
                    }}
                  />
                  <strong>{name}</strong>
                  <em>{px}</em>
                </div>
              ))}
            </div>
            <p className="brand-fine">
              Cards use <code>--r-xl</code> (26) for heroes and <code>--r-lg</code> (20) for panels.
              Rows settle at 14; menus 14; inputs 10. Never mix radii inside one visual layer.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Spacing</h3>
              <span>4 px base</span>
            </div>
            <div className="token-space-list">
              {[4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((v) => (
                <div key={v}>
                  <code>s-{v}</code>
                  <span className="token-space-bar" style={{ width: v * 2.2 }} />
                  <em>{v}</em>
                </div>
              ))}
            </div>
            <p className="brand-fine">
              Phone gutters 20 px, desktop page gutters 32 px, section rhythm 24–30. A screen never
              needs a new spacing value.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Glass</h3>
              <span>Functional layer only</span>
            </div>
            <div className="glass-specimen">
              <span className="glass-specimen-bg" aria-hidden="true" />
              <div className="glass glass-specimen-card">
                <strong>Docked controls</strong>
                <span>blur(26px) saturate(1.6)</span>
              </div>
            </div>
            <div className="code-block">
              <code>background: rgba(20,20,27,.58)</code>
              <code>backdrop-filter: blur(26px) saturate(160%)</code>
              <code>border: 1px solid rgba(255,255,255,.10)</code>
              <code>box-shadow: inset 0 1px 0 rgba(255,255,255,.07)</code>
            </div>
            <p className="brand-fine">
              Applied to tab bar, docked mini player, desktop sidebar, transport, sheets, menus and
              toasts. Artwork, track rows and content lists stay solid. Reduced transparency swaps to
              <code> --glass-solid</code> and removes blur — no other layout change.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Accessibility rules</h3>
              <span>Non-negotiable</span>
            </div>
            <ul className="rules-list rules-list--roomy">
              <li><span className="rule-dot" /> Every control ≥ 40 × 40 px touch target (44 recommended).</li>
              <li><span className="rule-dot" /> Body and control text ≥ 4.5:1; large text ≥ 3:1.</li>
              <li><span className="rule-dot" /> Never encode playing/selected state with color alone — add icon, weight or bar.</li>
              <li><span className="rule-dot" /> Pause remains two bars. The paw is a hover/reduced-motion-safe garnish.</li>
              <li><span className="rule-dot" /> All animations collapse under reduced motion; glass collapses under reduced transparency.</li>
              <li><span className="rule-dot" /> Focus visible: 2 px accent ring, 2 px offset, never removed.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="04 · Motion & layout" title="Timing, breakpoints, behavior">
          <span className="view-note">Phone → tablet → desktop is a layout change, not a zoom level.</span>
        </SectionTitle>
        <div className="token-motion-layout">
          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Motion tokens</h3>
              <span>cubic-bezier(.22,.85,.25,1)</span>
            </div>
            <div className="token-motion-list">
              <div><code>fast</code><span>120 ms</span><Skeleton h={4} r={2} /></div>
              <div><code>base</code><span>180 ms</span><Skeleton h={4} r={2} /></div>
              <div><code>slow</code><span>280 ms</span><Skeleton h={4} r={2} /></div>
              <div><code>scene</code><span>460 ms</span><Skeleton h={4} r={2} /></div>
            </div>
            <p className="brand-fine">
              Spring is reserved for the play button, tab selection, cover hover and sheets. Everything
              else uses standard ease.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Breakpoints</h3>
              <span>0 · 768 · 1024 · 1440</span>
            </div>
            <div className="breakpoint-list">
              <div>
                <span className="breakpoint-icon">390</span>
                <div>
                  <strong>Phone</strong>
                  <p>3-tab bar shrinks on scroll; mini player docks above it; full-screen sheets for Now Playing, Queue, Lyrics.</p>
                </div>
              </div>
              <div>
                <span className="breakpoint-icon">834</span>
                <div>
                  <strong>Tablet</strong>
                  <p>Sidebar becomes an 88 px icon rail or a collapsible drawer; 2–3 column cards; Now Playing opens as a right overlay or sheet; transport stays docked.</p>
                </div>
              </div>
              <div>
                <span className="breakpoint-icon">1280</span>
                <div>
                  <strong>Desktop</strong>
                  <p>Sidebar + main + resizable Now Playing panel (288–430 px) + 88 px transport. Native window chrome per OS.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="view-section view-section--last">
        <SectionTitle eyebrow="05 · Handoff" title="Portable by construction">
          <span className="view-note">Tokens are the contract. Components are implementations.</span>
        </SectionTitle>
        <div className="handoff-grid">
          <div className="handoff-card">
            <span className="eyebrow">Source of truth</span>
            <h3>tokens/tokens.json</h3>
            <p>Color (dark + light), artwork palettes, type scale, spacing, radii, glass spec, motion, breakpoints, z-index and contrast targets.</p>
            <CopyChip value="tokens/tokens.json" />
          </div>
          <div className="handoff-card">
            <span className="eyebrow">Reference implementation</span>
            <h3>CSS variables</h3>
            <p>
              <code>src/styles/tokens.css</code> is the visual truth for phase 1. Phase 2 maps each
              token name 1:1 to Flutter <code>ThemeExtension</code>, SwiftUI environment values or CSS.
            </p>
            <CopyChip value="src/styles/tokens.css" />
          </div>
          <div className="handoff-card">
            <span className="eyebrow">Decisions</span>
            <h3>DESIGN.md</h3>
            <p>Stack recommendation, platform shell mapping, data assumptions, motion policy, accessibility gates and a screen-by-screen handoff checklist.</p>
            <CopyChip value="DESIGN.md" />
          </div>
        </div>
      </section>
    </div>
  );
}
