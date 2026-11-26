import { useState } from 'react';
import { Check, Copy, PawPrint } from 'lucide-react';
import { copyGroups, voiceDonts, voiceDos } from '../microcopy';
import { SectionTitle } from '../components/Brand';

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`copy-btn ${done ? 'is-done' : ''}`}
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => undefined);
        setDone(true);
        window.setTimeout(() => setDone(false), 1300);
      }}
      aria-label={`Copy: ${text}`}
      title="Copy line"
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export function MicrocopyView() {
  return (
    <div className="view">
      <header className="view-hero">
        <div className="view-hero-copy">
          <span className="eyebrow">Microcopy sheet · Phase 1</span>
          <h1 className="display">Short. Soft. Never blocking.</h1>
          <p>
            One voice across four platforms. The interface stays literal; the cat does the joking.
            Every line here is short enough to fit a toast or a two-line empty state, and every error
            ends with a way forward.
          </p>
        </div>
        <div className="view-hero-card glass copy-hero-card">
          <div className="copy-hero-toast">
            <span className="toast-paw"><PawPrint size={13} /></span>
            <span>Queued. Patience, kitten.</span>
          </div>
          <div className="copy-hero-stats">
            <span>8 groups</span>
            <span>70+ reviewed lines</span>
            <span>No puns in controls</span>
          </div>
        </div>
      </header>

      <div className="copy-principles">
        <div className="brand-panel">
          <div className="brand-panel-head">
            <h3>Do</h3>
            <span>Voice with a low purr</span>
          </div>
          <ul className="rules-list">
            {voiceDos.map((d) => (
              <li key={d}>
                <span className="rule-dot" /> {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="brand-panel">
          <div className="brand-panel-head">
            <h3>Don’t</h3>
            <span>Never at the cost of clarity</span>
          </div>
          <ul className="rules-list rules-list--muted">
            {voiceDonts.map((d) => (
              <li key={d}>
                <span className="rule-dot rule-dot--muted" /> {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="brand-panel copy-principles-note">
          <div className="brand-panel-head">
            <h3>Rules of thumb</h3>
          </div>
          <p>
            A pun is a garnish, not a headline. If the joke would confuse an error or a payment
            confirmation, cut it. Buttons use verbs: <em>Play</em>, <em>Retry</em>, <em>Take me home</em>.
            The toe-bean pause tooltip (“Pawse”) is the only exception in the transport.
          </p>
        </div>
      </div>

      {copyGroups.map((group, gi) => (
        <section className="view-section copy-section" key={group.id}>
          <SectionTitle
            eyebrow={`${String(gi + 1).padStart(2, '0')} · ${group.title}`}
            title={group.title}
          >
            <span className="view-note">{group.blurb}</span>
          </SectionTitle>
          <div className="copy-table">
            <div className="copy-table-head">
              <span>Context</span>
              <span>Copy</span>
              <span>Chars</span>
            </div>
            {group.lines.map((line) => (
              <div className="copy-row" key={`${group.id}-${line.context}-${line.text}`}>
                <span className="copy-context">{line.context}</span>
                <span className="copy-text">
                  <span>{line.text}</span>
                  {line.note && <em>{line.note}</em>}
                </span>
                <span className="copy-count">
                  {line.text.length}
                  <CopyButton text={line.text} />
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="view-section view-section--last">
        <div className="copy-footer-card">
          <span className="eyebrow">For localization</span>
          <h3>Keep the joke portable.</h3>
          <p>
            These strings ship as ICU messages with named placeholders. Mascot voice is not markup;
            it’s copy. When a locale can’t carry a pun, fall back to the plain line — calm is the
            brand, not the joke. Avoid culture-specific cat idioms and never localize “Mewzak”.
          </p>
        </div>
      </section>
    </div>
  );
}
