import {
  AppIcon,
  CatMark,
  Logo,
  Mascot,
  MASCOT_STATES,
  SectionTitle,
  Swatch,
  Wordmark,
} from '../components/Brand';
import { Cat, Heart, ListMusic, Mic2, Pause, PawPrint, Play, Search } from 'lucide-react';

const darkSwatches = [
  { name: 'Base', hex: '#0B0B0F', role: 'App background · near-black, blue bias', ratio: '18.0:1 text', textOn: '#F5F5F7' },
  { name: 'Raised', hex: '#14141A', role: 'Cards, sidebar, raised surfaces', ratio: '15.9:1 text', textOn: '#F5F5F7' },
  { name: 'Lilac', hex: '#B79CFF', role: 'Primary accent, focus, active states', ratio: '8.6:1 on base', textOn: '#171021' },
  { name: 'Peach', hex: '#FFB48A', role: 'Gradient partner only · hero + PlayButton', ratio: '10.7:1 ink', textOn: '#171021' },
  { name: 'Text', hex: '#F5F5F7', role: 'Primary interface text', ratio: '18.0:1', textOn: '#0B0B0F' },
  { name: 'Secondary', hex: '#A1A1AA', role: 'Metadata, supporting copy', ratio: '7.7:1', textOn: '#0B0B0F' },
];

const lightSwatches = [
  { name: 'Base', hex: '#F6F4FB', role: 'Light background', textOn: '#14121A' },
  { name: 'Surface', hex: '#FFFFFF', role: 'Cards & chrome', textOn: '#14121A' },
  { name: 'Accent', hex: '#6B47E4', role: 'Accessible light-theme lilac', textOn: '#FFFFFF' },
  { name: 'Peach', hex: '#EC9A72', role: 'Decorative gradient stop', textOn: '#1B1033' },
];

const radii = [
  ['xs', '6px', 'inline tags'],
  ['sm', '10px', 'inputs, tiny chips'],
  ['md', '14px', 'rows, menus'],
  ['lg', '20px', 'panels, tiles'],
  ['xl', '26px', 'hero cards, player art'],
  ['pill', '999px', 'buttons, tab bar'],
];

export function BrandView() {
  return (
    <div className="view">
      <header className="view-hero">
        <div className="view-hero-copy">
          <span className="eyebrow">Brand kit · Phase 1</span>
          <h1 className="display">A quiet cat with good taste.</h1>
          <p>
            Mewzak is mew + muzak: a small joke about elevator music, told in a low voice. The brand is
            calm, warm and a little cheeky; the product is Apple-clean and never cute at the expense of
            clarity.
          </p>
        </div>
        <div className="view-hero-card glass">
          <div className="view-hero-lockup">
            <Logo size={30} />
          </div>
          <div className="view-hero-meta">
            <span>Brand v0.1</span>
            <span>Android · iOS · macOS · Windows</span>
          </div>
          <div className="view-hero-icons">
            <AppIcon size={58} />
            <AppIcon variant="light" size={58} />
            <AppIcon variant="tinted" size={58} />
          </div>
        </div>
      </header>

      <section className="view-section">
        <SectionTitle eyebrow="01 · Identity" title="Wordmark, mark & lockup">
          <span className="view-note">Lucide Cat is available; our mark is drawn, not borrowed.</span>
        </SectionTitle>

        <div className="brand-lockup-grid">
          <div className="brand-slab" data-theme="dark" style={{ background: '#0B0B0F' }}>
            <div className="brand-slab-head">
              <span>Primary lockup</span>
              <span className="brand-slab-meta">On Base #0B0B0F</span>
            </div>
            <div className="brand-slab-main">
              <Logo size={52} />
            </div>
            <div className="brand-slab-row">
              <Wordmark size={30} />
              <span className="brand-slab-label">Wordmark</span>
              <CatMark size={30} gradient />
              <span className="brand-slab-label">Mark</span>
            </div>
            <p>
              The mark leads at 1.02× the wordmark’s cap height. The tail is part of the wordmark
              only — never add it to the icon.
            </p>
          </div>

          <div className="brand-slab" data-theme="light" style={{ background: '#F6F4FB' }}>
            <div className="brand-slab-head">
              <span>Light lockup</span>
              <span className="brand-slab-meta">On Base #F6F4FB</span>
            </div>
            <div className="brand-slab-main">
              <Logo size={52} />
            </div>
            <div className="brand-slab-row">
              <Wordmark size={30} />
              <span className="brand-slab-label">Wordmark</span>
              <CatMark size={30} />
              <span className="brand-slab-label">Tinted mark</span>
            </div>
            <p>
              On light, the mark becomes one solid ink. The gradient is reserved for the icon and
              high-emotion moments, never for body copy.
            </p>
          </div>
        </div>

        <div className="brand-subgrid">
          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>App icon</h3>
              <span>One shape, three finishes</span>
            </div>
            <div className="icon-variants">
              <div className="icon-variant">
                <AppIcon size={104} />
                <strong>Dark</strong>
                <span>Default. Lilac cat, warm ear glint.</span>
              </div>
              <div className="icon-variant">
                <AppIcon variant="light" size={104} />
                <strong>Light</strong>
                <span>Ink cat on porcelain. For light docks.</span>
              </div>
              <div className="icon-variant">
                <AppIcon variant="tinted" size={104} />
                <strong>Tinted</strong>
                <span>Grayscale asset; the OS supplies hue.</span>
              </div>
            </div>
            <div className="icon-ladder">
              <span>16</span>
              <AppIcon size={16} radius={23} />
              <span>24</span>
              <AppIcon size={24} />
              <span>32</span>
              <AppIcon size={32} />
              <span>48</span>
              <AppIcon size={48} />
              <span>64</span>
              <AppIcon size={64} />
              <span>128</span>
              <AppIcon size={72} />
            </div>
            <p className="brand-fine">
              Two ears and a knockout face keep the silhouette readable at 16 px. Assets ship as SVG +
              platform sizes. iOS tinted is grayscale by design.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Construction</h3>
              <span>Clearspace & rules</span>
            </div>
            <div className="clearspace">
              <span className="clearspace-box">
                <CatMark size={54} gradient />
              </span>
              <div>
                <strong>Clearspace</strong>
                <p>Keep one ear-height (≈ 8% of mark width) free on all sides.</p>
              </div>
            </div>
            <ul className="rules-list">
              <li><span className="rule-dot" /> Do not stretch, skew, outline, or add a face to the mark.</li>
              <li><span className="rule-dot" /> Do not place the gradient lockup on patterned artwork.</li>
              <li><span className="rule-dot" /> Do not pair the mark with another mascot or animal.</li>
              <li><span className="rule-dot" /> Keep one stroke weight: 1.75 px in Lucide (24 px box).</li>
              <li><span className="rule-dot" /> Wordmark tracking −0.05em. Do not add spacing to “fix” it.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="02 · Mascot" title="A minimal cat, used sparingly">
          <span className="view-note">Onboarding · empty states · long loading. Never over the transport.</span>
        </SectionTitle>

        <div className="mascot-grid">
          {MASCOT_STATES.map((m) => (
            <div className="mascot-tile" key={m.state}>
              <div className="mascot-tile-stage">
                <Mascot state={m.state} size={112} />
              </div>
              <div className="mascot-tile-copy">
                <strong>{m.label}</strong>
                <span>{m.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="brand-panel brand-panel--wide">
          <div className="mascot-usage">
            <div>
              <h3>Usage</h3>
              <ul className="rules-list">
                <li><span className="rule-dot" /> One mascot per screen, maximum.</li>
                <li><span className="rule-dot" /> Mascot is decoration, not a control. It never covers artwork.</li>
                <li><span className="rule-dot" /> Line work only: currentColor, 3.3 px at 200 × 200.</li>
                <li><span className="rule-dot" /> The nose is the only fixed warm accent (peach).</li>
              </ul>
            </div>
            <div>
              <h3>Motion</h3>
              <p>
                Idle breathes every 5.4 s and blinks every 6.2 s. Happy wags its tail; sleeping floats
                three z’s; loading spins a yarn ball; error gets a peach balloon. All motion stops
                with <em>Reduce motion</em> or <code>prefers-reduced-motion</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="03 · Color" title="Lilac calm, one warm friend">
          <span className="view-note">Dark-first. Light is a first-class secondary mode.</span>
        </SectionTitle>

        <div className="swatch-grid">
          {darkSwatches.map((c) => (
            <Swatch key={c.name} {...c} />
          ))}
        </div>

        <div className="color-subgrid">
          <div className="brand-panel" data-theme="light">
            <div className="brand-panel-head">
              <h3>Light theme</h3>
              <span>Accessible equivalents</span>
            </div>
            <div className="light-swatches">
              {lightSwatches.map((c) => (
                <div className="light-swatch" key={c.name}>
                  <span style={{ background: c.hex, color: c.textOn }}>Aa</span>
                  <strong>{c.name}</strong>
                  <code>{c.hex}</code>
                </div>
              ))}
            </div>
            <p className="brand-fine">
              The light accent darkens to #6B47E4 for a 5.3:1 pass against the background. The lilac
              #B79CFF is reserved for dark surfaces.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Gradient</h3>
              <span>PlayButton & hero moments only</span>
            </div>
            <div className="brand-gradient">
              <span className="brand-gradient-label">135° · lilac → peach</span>
            </div>
            <div className="gradient-demo-row">
              <button className="btn btn--primary" type="button">
                <Play size={15} /> Play all
              </button>
              <span className="gradient-code">--grad</span>
            </div>
            <p className="brand-fine">
              Peach is never a UI color on its own, never a background for text, and never appears
              without lilac beside it. Errors use peach plus plain language — never red.
            </p>
          </div>
        </div>

        <div className="brand-rule-banner">
          <div>
            <strong>No green. No red. No orange. No Spotify.</strong>
            <p>
              Warmth comes from peach as a gradient partner; calm comes from blue-black and lilac.
              Artwork palettes stay in the same family: lavender, periwinkle, blush, cream, ice.
            </p>
          </div>
          <div className="brand-palette-dots">
            {['#B79CFF', '#8FA8FF', '#F2A7C3', '#FFB48A', '#C9A0FF', '#F4D9C6'].map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
        </div>
      </section>

      <section className="view-section">
        <SectionTitle eyebrow="04 · Typography" title="Editorial warmth, interface clarity">
          <span className="view-note">Bricolage Grotesque for display. Instrument Sans for everything else.</span>
        </SectionTitle>

        <div className="type-showcase">
          <div className="type-specimen">
            <span className="eyebrow">Display · Bricolage Grotesque 600</span>
            <p className="type-giant">Listen slower.</p>
            <p className="type-giant type-giant--small">Mewzak keeps the room soft.</p>
            <div className="type-glyphs">Aa Bb Cc Dd Ee Ff Gg 0123456789</div>
          </div>
          <div className="type-scale">
            {[
              ['displayXL', '34 / 36', 'Onboarding hero'],
              ['displayL', '28 / 31', 'Screen titles'],
              ['title1', '22 / 26', 'Desktop page titles'],
              ['title2', '17 / 22', 'Section heads'],
              ['body', '14 / 21', 'Interface copy'],
              ['bodyStrong', '13 / 19', 'Track titles'],
              ['caption', '11.5 / 16', 'Metadata'],
              ['eyebrow', '10.5 / 14', 'Uppercase labels'],
            ].map(([name, size, use]) => (
              <div className="type-row" key={name}>
                <span className="type-row-name">{name}</span>
                <span className="type-row-size">{size}</span>
                <span className="type-row-use">{use}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="view-section view-section--last">
        <SectionTitle eyebrow="05 · Shape & motion" title="Concentric, not decorative">
          <span className="view-note">Soft geometry, one easing family, no bouncing UI.</span>
        </SectionTitle>

        <div className="shape-motion-grid">
          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Radius set</h3>
              <span>Concentric rule</span>
            </div>
            <div className="radius-row">
              {radii.map(([name, value, use]) => (
                <div className="radius-sample" key={name}>
                  <span style={{ borderRadius: value }} />
                  <strong>{name}</strong>
                  <em>{value}</em>
                  <small>{use}</small>
                </div>
              ))}
            </div>
            <p className="brand-fine">
              Nested corners subtract their inset: an 18 px card with 6 px padding holds a 12 px inner
              radius. Never nest two radii of the same size.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Motion</h3>
              <span>Standard + spring</span>
            </div>
            <div className="motion-curve">
              <svg viewBox="0 0 260 100" fill="none" aria-hidden="true">
                <path d="M10 88 H250" stroke="var(--line-strong)" strokeWidth="1" />
                <path d="M10 10 V88" stroke="var(--line-strong)" strokeWidth="1" />
                <path d="M10 88 C60 88 92 12 250 10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
                <path
                  d="M10 88 C84 88 74 26 250 10"
                  stroke="var(--peach)"
                  strokeWidth="1.6"
                  strokeDasharray="4 5"
                  opacity="0.8"
                />
                <circle cx="10" cy="88" r="3" fill="var(--accent)" />
                <circle cx="250" cy="10" r="3" fill="var(--accent)" />
              </svg>
              <div className="motion-legend">
                <span><i className="dot dot--accent" /> standard cubic-bezier(.22,.85,.25,1)</span>
                <span><i className="dot dot--peach" /> spring cubic-bezier(.34,1.35,.42,1)</span>
              </div>
            </div>
            <div className="motion-durations">
              <span>120 ms · press</span>
              <span>180 ms · state</span>
              <span>280 ms · surface</span>
              <span>460 ms · scene</span>
            </div>
            <ul className="rules-list">
              <li><span className="rule-dot" /> Motion confirms; it never delays.</li>
              <li><span className="rule-dot" /> Only transform and opacity on the functional layer.</li>
              <li><span className="rule-dot" /> Every animation has a 1 ms reduced-motion equivalent.</li>
            </ul>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Iconography</h3>
              <span>Lucide · 1.75 px</span>
            </div>
            <div className="icon-demo-row">
              {[
                [Play, 'Play'],
                [Pause, 'Pawse'],
                [Search, 'Search'],
                [Heart, 'Like'],
                [PawPrint, 'Paw'],
                [Cat, 'Cat'],
                [ListMusic, 'Queue'],
                [Mic2, 'Lyrics'],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Play;
                return (
                  <div className="icon-demo" key={label as string}>
                    <I />
                    <span>{label as string}</span>
                  </div>
                );
              })}
            </div>
            <p className="brand-fine">
              Icons are outlined, round-capped and always one weight. Filled icons are reserved for
              two states: a liked heart and the toe-bean pause egg.
            </p>
          </div>

          <div className="brand-panel">
            <div className="brand-panel-head">
              <h3>Voice</h3>
              <span>Short. Soft. Never blocking.</span>
            </div>
            <blockquote className="brand-quote">
              “Queued. Patience, kitten.”
              <span>Toast, after adding to queue</span>
            </blockquote>
            <blockquote className="brand-quote">
              “No matches. Cats are picky; we’re not.”
              <span>Search, zero results</span>
            </blockquote>
            <p className="brand-fine">
              Puns live in toasts, empty states, loading and errors. Playback controls stay literal.
              Full sheet in the Microcopy tab.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
