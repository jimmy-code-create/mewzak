import { useId, type CSSProperties, type ReactNode } from 'react';

/* ────────────────────────────────────────────────────────────────────────────
   Mewzak brand primitives — cat mark, wordmark, logo lockup, app icon, mascot.
   All vector, all currentColor, all portable.
   ──────────────────────────────────────────────────────────────────────────── */

export function CatMark({
  size = 32,
  className = '',
  gradient = false,
}: {
  size?: number;
  className?: string;
  gradient?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const gid = `mz-g-${uid}`;
  const mid = `mz-m-${uid}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`cat-mark ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {gradient && (
        <defs>
          <linearGradient id={gid} x1="10" y1="8" x2="56" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#D8C7FF" />
            <stop offset="0.55" stopColor="#B79CFF" />
            <stop offset="1" stopColor="#FFC7A6" />
          </linearGradient>
        </defs>
      )}
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="#fff" />
          <ellipse cx="23.6" cy="36.4" rx="3" ry="4.3" fill="#000" />
          <ellipse cx="40.4" cy="36.4" rx="3" ry="4.3" fill="#000" />
          <path d="M32 43.4 35.4 46.1 Q32 49.8 28.6 46.1 Z" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#${mid})`} fill={gradient ? `url(#${gid})` : 'currentColor'}>
        <path d="M14 26.5 C13 18.5 14.6 9.4 18.1 8.1 C21.4 6.9 27.2 12.8 30.3 17.6 Z" />
        <path d="M50 26.5 C51 18.5 49.4 9.4 45.9 8.1 C42.6 6.9 36.8 12.8 33.7 17.6 Z" />
        <path d="M32 14.4 C17.7 14.4 9 26.1 9 38.1 C9 51 19.3 60 32 60 C44.7 60 55 51 55 38.1 C55 26.1 46.3 14.4 32 14.4 Z" />
      </g>
    </svg>
  );
}

export function Wordmark({
  size = 32,
  className = '',
  tail = true,
}: {
  size?: number;
  className?: string;
  tail?: boolean;
}) {
  return (
    <span className={`wordmark ${className}`} style={{ fontSize: size }}>
      mewzak
      {tail && (
        <svg className="wm-tail" viewBox="0 0 64 30" aria-hidden="true" focusable="false">
          <path
            d="M4 19.5 C19.5 28 38 26 47 14.5 C51.5 8.5 57 10 55.6 15.4 C54.6 19.3 49.8 19.4 49 15.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

export function Logo({
  size = 26,
  variant = 'lockup',
  className = '',
}: {
  size?: number;
  variant?: 'mark' | 'wordmark' | 'lockup';
  className?: string;
}) {
  if (variant === 'mark') return <CatMark size={size} className={className} gradient />;
  if (variant === 'wordmark') return <Wordmark size={size} className={className} />;
  return (
    <span className={`logo-lockup ${className}`} aria-label="Mewzak">
      <CatMark size={size * 1.02} gradient />
      <Wordmark size={size} />
    </span>
  );
}

export function AppIcon({
  variant = 'dark',
  size = 96,
  radius = 23,
}: {
  variant?: 'dark' | 'light' | 'tinted';
  size?: number;
  radius?: number;
}) {
  const style: CSSProperties =
    variant === 'dark'
      ? {
          background: 'linear-gradient(150deg, #221E30 0%, #121017 48%, #0A090E 100%)',
          color: '#CBB7FF',
        }
      : variant === 'light'
        ? {
            background: 'linear-gradient(150deg, #FFFFFF 0%, #F5F1FF 55%, #EDE6FC 100%)',
            color: '#2C1E4F',
          }
        : {
            background: 'linear-gradient(150deg, #E9E6EF 0%, #CFCBDA 100%)',
            color: '#4B4657',
          };
  return (
    <div
      className={`app-icon app-icon--${variant}`}
      style={{ width: size, height: size, borderRadius: size * (radius / 100), ...style }}
      aria-label={`Mewzak app icon, ${variant}`}
      role="img"
    >
      <span className="app-icon-ring" />
      <CatMark size={size * 0.66} gradient={variant !== 'tinted'} />
      <span className="app-icon-gloss" />
    </div>
  );
}

export function IconGallery() {
  return (
    <div className="icon-sizes">
      {[72, 56, 40, 28, 20].map((s) => (
        <AppIcon key={s} size={s} />
      ))}
    </div>
  );
}

/* ── Mascot ────────────────────────────────────────────────────────────────── */

export type MascotState = 'idle' | 'happy' | 'sleeping' | 'loading' | 'error';

export const MASCOT_STATES: { state: MascotState; label: string; note: string }[] = [
  { state: 'idle', label: 'Idle', note: 'Onboarding, profile, quiet corners. Breathes and blinks.' },
  { state: 'happy', label: 'Happy', note: 'Rewards: saved, followed, finished onboarding.' },
  { state: 'sleeping', label: 'Sleeping', note: 'Empty states. Never over the transport.' },
  { state: 'loading', label: 'Loading', note: 'Long waits only, with a line of copy beside it.' },
  { state: 'error', label: 'Error', note: 'Peach accent, no red. Always next to a retry.' },
];

function Face({ state }: { state: MascotState }) {
  switch (state) {
    case 'happy':
      return (
        <g>
          <path d="M74.5 79 Q82 71.5 89.5 79" />
          <path d="M110.5 79 Q118 71.5 125.5 79" />
          <path d="M100 94 Q92.6 104.4 83.4 99.4" />
          <path d="M100 94 Q107.4 104.4 116.6 99.4" />
          <ellipse cx="64" cy="90" rx="8" ry="4.2" fill="#FFB48A" stroke="none" opacity="0.28" />
          <ellipse cx="136" cy="90" rx="8" ry="4.2" fill="#FFB48A" stroke="none" opacity="0.28" />
        </g>
      );
    case 'sleeping':
      return (
        <g>
          <path d="M74 79.5 Q82 85.5 90 79.5" opacity="0.85" />
          <path d="M110 79.5 Q118 85.5 126 79.5" opacity="0.85" />
          <ellipse cx="100" cy="98.4" rx="3.2" ry="2.4" fill="currentColor" stroke="none" opacity="0.7" />
          <ellipse cx="64" cy="91" rx="8" ry="4" fill="#FFB48A" stroke="none" opacity="0.24" />
          <ellipse cx="136" cy="91" rx="8" ry="4" fill="#FFB48A" stroke="none" opacity="0.24" />
        </g>
      );
    case 'loading':
      return (
        <g>
          <ellipse cx="82" cy="79" rx="5" ry="6.4" />
          <ellipse cx="118" cy="79" rx="5" ry="6.4" />
          <circle className="mascot-pupil" cx="83.4" cy="76.6" r="1.9" fill="currentColor" stroke="none" />
          <circle className="mascot-pupil" cx="119.4" cy="76.6" r="1.9" fill="currentColor" stroke="none" />
          <path d="M95 100 Q100 97 105 100" opacity="0.7" />
        </g>
      );
    case 'error':
      return (
        <g>
          <path d="M73.5 67.5 L88 72.5" opacity="0.65" />
          <path d="M126.5 67.5 L112 72.5" opacity="0.65" />
          <circle cx="82" cy="81" r="2.6" fill="currentColor" stroke="none" />
          <circle cx="118" cy="81" r="2.6" fill="currentColor" stroke="none" />
          <path d="M93.5 101 Q96.5 97.5 100 101 Q103.5 104.5 106.5 100.5" opacity="0.8" />
        </g>
      );
    case 'idle':
    default:
      return (
        <g className="mascot-eyes">
          <ellipse cx="82" cy="78.6" rx="4.1" ry="5.4" fill="currentColor" stroke="none" />
          <ellipse cx="118" cy="78.6" rx="4.1" ry="5.4" fill="currentColor" stroke="none" />
          <path d="M100 94.4 Q96.5 100.4 92.4 98.2" opacity="0.65" />
          <path d="M100 94.4 Q103.5 100.4 107.6 98.2" opacity="0.65" />
        </g>
      );
  }
}

export function Mascot({
  state = 'idle',
  size = 140,
  className = '',
  title,
}: {
  state?: MascotState;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={`mascot mascot--${state} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title ?? `Mewzak the cat, ${state}`}
    >
      <svg viewBox="0 0 200 200" fill="none">
        <g
          className="mascot-lines"
          stroke="currentColor"
          strokeWidth="3.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* body sits behind the head */}
          <path d="M74 114 C61 125 56 141 60 155 C64 168 80 175 100 175 C120 175 136 168 140 155 C144 141 139 125 126 114" />
          <ellipse cx="83" cy="164" rx="13" ry="8" />
          <ellipse cx="117" cy="164" rx="13" ry="8" />
          <path d="M78.5 161.5 H87" opacity="0.55" />
          <path d="M113 161.5 H121.5" opacity="0.55" />
          <path className="mascot-tail" d="M138 150 C160 151 167 138 158 128 C152 121.5 144 126 146.5 133" />

          {/* head + ears */}
          <path
            className="mascot-head"
            d="M64 50 C61 39 63 25 68 21 C72 18 78 21.5 82 28.5 L92 41 C97 39.6 103 39.6 108 41 L118 28.5 C122 21.5 128 18 132 21 C137 25 139 39 136 50 C144 58.5 148 69 146 81 C142 103 124 115 100 115 C76 115 58 103 54 81 C52 69 56 58.5 64 50 Z"
          />
          <path d="M70.5 31 L75.8 43.5" opacity="0.4" />
          <path d="M129.5 31 L124.2 43.5" opacity="0.4" />
          <path d="M54 83.5 L40 79.5" opacity="0.3" />
          <path d="M55 92 L41 94" opacity="0.3" />
          <path d="M146 83.5 L160 79.5" opacity="0.3" />
          <path d="M145 92 L159 94" opacity="0.3" />

          {/* nose is always the one warm note */}
          <path
            d="M96 89.2 Q100 86.6 104 89.2 Q101.5 94.2 100 94.2 Q98.5 94.2 96 89.2 Z"
            fill="#FFB48A"
            stroke="none"
            className="mascot-nose"
          />
          <Face state={state} />
        </g>

        {state === 'happy' && (
          <g className="mascot-sparkles" fill="currentColor">
            <path
              d="M157 38 l2.7 6.7 6.7 2.7 -6.7 2.7 -2.7 6.7 -2.7 -6.7 -6.7 -2.7 6.7 -2.7 Z"
              opacity="0.85"
            />
            <circle cx="141" cy="29" r="2.2" fill="#FFB48A" />
            <circle cx="170" cy="66" r="1.7" fill="#FFB48A" opacity="0.8" />
          </g>
        )}

        {state === 'sleeping' && (
          <g className="mascot-zzz">
            <text x="146" y="60" fontSize="17" fontWeight="650">z</text>
            <text x="159" y="44" fontSize="21" fontWeight="650">z</text>
            <text x="174" y="26" fontSize="25" fontWeight="650">z</text>
          </g>
        )}

        {state === 'loading' && (
          <g className="mascot-yarn">
            <circle cx="158" cy="151" r="13" stroke="#FFB48A" strokeWidth="2.8" opacity="0.85" />
            <path d="M149 147 C154 158 166 158 168 147 C169 141 162 138 158 142 C154 146 157 153 164 152" stroke="#FFB48A" strokeWidth="2.3" opacity="0.7" />
            <circle className="yarn-orbit" cx="158" cy="151" r="19" stroke="currentColor" strokeWidth="1.6" strokeDasharray="4 9" opacity="0.5" />
          </g>
        )}

        {state === 'error' && (
          <g className="mascot-err">
            <circle cx="157" cy="47" r="13.5" stroke="#FFB48A" strokeWidth="2.8" />
            <path d="M157 40.5 V48" stroke="#FFB48A" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx="157" cy="53.4" r="1.8" fill="#FFB48A" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ── Small shared brand blocks ─────────────────────────────────────────────── */

export function Swatch({
  name,
  hex,
  role,
  ratio,
  textOn = '#F5F5F7',
}: {
  name: string;
  hex: string;
  role: string;
  ratio?: string;
  textOn?: string;
}) {
  return (
    <div className="swatch">
      <span className="swatch-chip" style={{ background: hex, color: textOn }}>
        Aa
      </span>
      <div className="swatch-meta">
        <strong>{name}</strong>
        <code>{hex}</code>
        <span>{role}</span>
        {ratio && <span className="swatch-ratio">{ratio}</span>}
      </div>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="view-section-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {children && <div className="view-section-actions">{children}</div>}
    </div>
  );
}
