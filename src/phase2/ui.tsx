import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from 'lucide-react';
import { Art } from '../components/ui';
import { CatMark } from '../components/Brand';
import type { PaletteKey } from '../data';
import { BIRTHDAY, dateMonths, DOWNLOAD_PLATFORMS, SHELL } from './copy';

/* ── Utilities ────────────────────────────────────────────────────────────── */

export function haptic(ms = 6) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* Vibration is a garnish, never a requirement. */
  }
}

export function classNames(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

export function initialsFor(name: string) {
  return name
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function handleFor(name: string) {
  return `@${name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 18) || 'mew'}`;
}

const AVATAR_SETS = [
  ['#cf6bc5', '#c971df', '#f2532c', '#dd91bf', '#7c2700'],
  ['#f2532c', '#ff9413', '#cf6bc5', '#7c2700', '#431518'],
  ['#c971df', '#dd91bf', '#be4a01', '#7c2700', '#431518'],
  ['#dd91bf', '#cf6bc5', '#ffb48a', '#f2532c', '#412519'],
  ['#be4a01', '#f2532c', '#cf6bc5', '#431518', '#7c2700'],
  ['#cf6bc5', '#dd91bf', '#be4a01', '#f2532c', '#431518'],
];

export function avatarColors(seed: string): string[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_SETS[hash % AVATAR_SETS.length];
}

export function avatarStyle(seed: string): CSSProperties {
  const [a, b, c, d, e] = avatarColors(seed);
  return {
    '--av-1': a,
    '--av-2': b,
    '--av-3': c,
    '--av-4': d,
    '--av-5': e,
  } as CSSProperties;
}

/* ── Brand ────────────────────────────────────────────────────────────────── */

export function P2Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="p2-wordmark" aria-label="Mewzak">
      <CatMark size={size} />
      <b>Mewzak</b>
    </span>
  );
}

export function WordReveal({
  text,
  className = '',
  delay = 0,
  stagger = 60,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  return (
    <span className={className}>
      {text.split(' ').map((word, i) => (
        <span
          className="p2-word"
          key={`${word}-${i}`}
          style={{ animationDelay: `${delay + i * stagger}ms` }}
        >
          {word}
          {i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}

/* ── Buttons ──────────────────────────────────────────────────────────────── */

type ButtonVariant = 'gradient' | 'cream' | 'dark' | 'quiet' | 'light';

export function P2Button({
  children,
  variant = 'cream',
  block = false,
  loading = false,
  armed = false,
  className = '',
  icon,
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  block?: boolean;
  loading?: boolean;
  armed?: boolean;
  className?: string;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onPointerDown, disabled, ...buttonProps } = rest;
  return (
    <button
      type="button"
      {...buttonProps}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(
        'p2-btn',
        `p2-btn--${variant}`,
        block && 'p2-btn--block',
        loading && 'is-loading',
        armed && 'is-armed',
        className,
      )}
      onPointerDown={(e) => {
        if (!disabled && !loading) haptic(7);
        onPointerDown?.(e);
      }}
    >
      {loading ? (
        <>
          <span className="p2-spinner" />
          <span className="p2-sr">{children}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

export function P2IconButton({
  label,
  children,
  className = '',
  ...rest
}: {
  label: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      className={classNames('p2-icon-only', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function P2Back({ label = 'Back', onClick }: { label?: string; onClick: () => void }) {
  return (
    <button type="button" className="p2-back" aria-label={label} onClick={onClick}>
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
  );
}

export function P2Skip({ children = 'Skip', onClick }: { children?: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" className="p2-skip" onClick={onClick}>
      {children}
    </button>
  );
}

export function P2Spinner({ large = false, className = '' }: { large?: boolean; className?: string }) {
  return (
    <span
      className={classNames('p2-spinner', large && 'p2-spinner--lg', className)}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ── Avatars ──────────────────────────────────────────────────────────────── */

export function P2Avatar({
  name,
  size = 44,
  seed,
  className = '',
  editable = false,
  onEdit,
  grain = true,
}: {
  name: string;
  size?: number;
  seed?: string;
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  grain?: boolean;
}) {
  const source = seed ?? name;
  const avatar = (
    <span
      className={classNames('p2-avatar', grain && 'p2-avatar--grain', className)}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.3), ...avatarStyle(source) }}
      aria-hidden="true"
    >
      <span>{initialsFor(name)}</span>
    </span>
  );
  if (!editable) return avatar;
  return (
    <span className="p2-avatar-wrap" style={{ width: size, height: size }}>
      {avatar}
      <button type="button" className="p2-avatar-edit" onClick={onEdit} aria-label="Change profile photo">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m4 20 4.2-1 10.4-10.4a2.3 2.3 0 0 0-3.2-3.2L5 15.8 4 20Z" />
          <path d="m13.8 6.2 4 4" />
        </svg>
      </button>
    </span>
  );
}

export function P2AvatarStack({
  names,
  size = 30,
  max = 4,
}: {
  names: string[];
  size?: number;
  max?: number;
}) {
  return (
    <span className="p2-avatar-stack" aria-label={`${names.slice(0, max).join(', ')}`}>
      {names.slice(0, max).map((name) => (
        <P2Avatar key={name} name={name} size={size} />
      ))}
    </span>
  );
}

/* ── Dots & chips ─────────────────────────────────────────────────────────── */

export function P2Dots({
  count,
  active,
  onChange,
  labels,
}: {
  count: number;
  active: number;
  onChange: (i: number) => void;
  labels?: string[];
}) {
  return (
    <div className="p2-dots" aria-label="Carousel slides">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={i === active ? 'is-on' : ''}
          onClick={() => onChange(i)}
          aria-label={labels?.[i] ?? `Slide ${i + 1}`}
          aria-current={i === active ? 'true' : undefined}
        />
      ))}
    </div>
  );
}

export function P2Chip({
  children,
  on = false,
  onClick,
  style,
  ariaLabel,
}: {
  children: ReactNode;
  on?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className={classNames('p2-chip', on && 'is-on')}
      aria-pressed={on}
      aria-label={ariaLabel}
      onClick={() => {
        haptic(4);
        onClick?.();
      }}
      style={style}
    >
      {on ? <Check size={12} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/* ── Fields ───────────────────────────────────────────────────────────────── */

export function P2Field({
  label,
  value,
  onChange,
  placeholder,
  light = false,
  autoFocus = false,
  maxLength,
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  light?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  onEnter?: () => void;
}) {
  const id = useId();
  return (
    <div className={classNames('p2-field', value && 'is-filled', light && 'p2-field--light')}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={maxLength}
        autoComplete="name"
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter?.();
        }}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

/* ── Status pill ──────────────────────────────────────────────────────────── */

export function StatusPill({
  mode,
  message,
  trackTitle,
  trackArtist,
  palette,
  art,
  progress,
  onOpen,
}: {
  mode: 'toast' | 'loading' | 'playing';
  message?: string;
  trackTitle?: string;
  trackArtist?: string;
  palette?: PaletteKey;
  art?: number;
  progress?: number;
  onOpen?: () => void;
}) {
  return (
    <div className={classNames('p2-status', `p2-status--${mode}`)} role="status" aria-live="polite">
      {mode === 'loading' ? <span className="p2-spinner" /> : null}
      {mode === 'toast' ? <i aria-hidden="true" /> : null}
      {mode === 'playing' && palette ? (
        <span className="p2-status-art">
          <Art palette={palette} variant={art ?? 0} radius={7} />
        </span>
      ) : null}
      {mode === 'playing' ? (
        <>
          <span>
            {trackTitle} <span style={{ opacity: 0.45 }}>· {trackArtist}</span>
          </span>
          <span className="p2-eq" aria-hidden="true" style={{ marginLeft: 2 }}>
            <i /><i /><i />
          </span>
          {typeof progress === 'number' ? (
            <span aria-hidden="true" style={{ opacity: 0.45, fontSize: 8 }}>
              {Math.round(progress)}%
            </span>
          ) : null}
        </>
      ) : (
        <span>{message ?? (mode === 'loading' ? SHELL.searchPlaceholder : '')}</span>
      )}
      {onOpen ? (
        <button type="button" onClick={onOpen} aria-label="Open player" style={{ pointerEvents: 'auto' }}>
          <ArrowUpRight size={12} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/* ── Wheel date picker ────────────────────────────────────────────────────── */

const WHEEL_ITEM = 42;

export function WheelColumn({
  label,
  options,
  index,
  onChange,
  wide = false,
  className = '',
}: {
  label: string;
  options: { label: string; value: number | string }[];
  index: number;
  onChange: (i: number) => void;
  wide?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(index);
  const settleRef = useRef<number | null>(null);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = index * WHEEL_ITEM;
    if (Math.abs(el.scrollTop - top) > 2) el.scrollTop = top;
    setActive(index);
  }, [index]);

  useEffect(() => {
    return () => {
      if (settleRef.current) window.clearTimeout(settleRef.current);
    };
  }, []);

  const pick = (next: number) => {
    const clamped = Math.max(0, Math.min(options.length - 1, next));
    setActive(clamped);
    onChange(clamped);
    ref.current?.scrollTo({ top: clamped * WHEEL_ITEM, behavior: 'smooth' });
    haptic(4);
  };

  return (
    <div
      className={classNames('p2-wheel-col', className)}
      ref={ref}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={`${id}-${active}`}
      onScroll={() => {
        const el = ref.current;
        if (!el) return;
        const next = Math.max(0, Math.min(options.length - 1, Math.round(el.scrollTop / WHEEL_ITEM)));
        if (next !== active) {
          setActive(next);
          haptic(2);
        }
        if (settleRef.current) window.clearTimeout(settleRef.current);
        settleRef.current = window.setTimeout(() => {
          if (next !== index) onChange(next);
        }, 110);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          pick(active + 1);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          pick(active - 1);
        }
      }}
    >
      {options.map((option, i) => (
        <button
          key={`${option.value}-${i}`}
          id={`${id}-${i}`}
          type="button"
          role="option"
          aria-selected={i === active}
          tabIndex={-1}
          className={classNames(
            'p2-wheel-item',
            label === BIRTHDAY.month && 'p2-wheel-item--month',
            i === active && 'is-sel',
            Math.abs(i - active) === 1 && 'is-near',
          )}
          onClick={() => pick(i)}
        >
          {option.label}
        </button>
      ))}
      {wide ? null : null}
    </div>
  );
}

export function DateWheel({
  day,
  month,
  year,
  onDay,
  onMonth,
  onYear,
  className = '',
}: {
  day: number;
  month: number;
  year: number;
  onDay: (v: number) => void;
  onMonth: (v: number) => void;
  onYear: (v: number) => void;
  className?: string;
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), value: i + 1 }));
  const months = dateMonths.map((m, i) => ({ label: m, value: i }));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: thisYear - 1899 }, (_, i) => thisYear - i).map((y) => ({
    label: String(y),
    value: y,
  }));
  const safeDay = Math.min(day, daysInMonth);

  return (
    <div className={classNames('p2-wheel-card', className)}>
      <div className="p2-wheel-labels" aria-hidden="true">
        <span>{BIRTHDAY.day}</span>
        <span>{BIRTHDAY.month}</span>
        <span>{BIRTHDAY.year}</span>
      </div>
      <div className="p2-wheel-body">
        <span className="p2-wheel-lines" aria-hidden="true" />
        <WheelColumn label={BIRTHDAY.day} options={days} index={safeDay - 1} onChange={(i) => onDay(i + 1)} />
        <WheelColumn label={BIRTHDAY.month} options={months} index={month} onChange={onMonth} wide />
        <WheelColumn
          label={BIRTHDAY.year}
          options={years}
          index={Math.max(0, years.findIndex((y) => y.value === year))}
          onChange={(i) => onYear(years[i]?.value ?? thisYear)}
        />
      </div>
    </div>
  );
}

/* ── Skeletons ────────────────────────────────────────────────────────────── */

export function SkeletonRows({ rows = 3, dark = false }: { rows?: number; dark?: boolean }) {
  return (
    <div className={classNames('p2-skeleton-rows', dark && 'p2-skeleton--dark')} aria-label={SHELL.playerNow} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div className="p2-skeleton-row" key={i}>
          <span className="p2-skeleton" style={{ width: 38, height: 38, borderRadius: 10 }} />
          <div>
            <span className="p2-skeleton" style={{ width: `${58 + ((i * 17) % 24)}%`, height: 9 }} />
            <span className="p2-skeleton" style={{ width: `${32 + ((i * 11) % 18)}%`, height: 7 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Shell tabs ───────────────────────────────────────────────────────────── */

export type ShellTab = 'home' | 'search' | 'library' | 'player' | 'profile';

export const SHELL_TABS: { id: ShellTab; label: string; icon: ComponentType<{ size?: number }> }[] = [
  { id: 'home', label: SHELL.home, icon: HomeGlyph },
  { id: 'search', label: SHELL.search, icon: SearchGlyph },
  { id: 'library', label: SHELL.library, icon: LibraryGlyph },
  { id: 'player', label: SHELL.player, icon: PlayerGlyph },
  { id: 'profile', label: SHELL.profile, icon: UserGlyph },
];

function HomeGlyph(props: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 18} height={props.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 10.6 12 3.7l8.5 6.9v8a1.8 1.8 0 0 1-1.8 1.8H5.3a1.8 1.8 0 0 1-1.8-1.8Z" />
      <path d="M9.4 20.4v-6.1h5.2v6.1" />
    </svg>
  );
}
function SearchGlyph(props: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 18} height={props.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.7" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}
function LibraryGlyph(props: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 18} height={props.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5v13M8.6 5.5v13" />
      <path d="m13 6.3 5.4 12.1" />
    </svg>
  );
}
function PlayerGlyph(props: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 18} height={props.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function UserGlyph(props: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={props.size ?? 18} height={props.size ?? 18} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8.4" r="3.8" />
      <path d="M4.5 20.2c.8-3.7 3.7-5.7 7.5-5.7s6.7 2 7.5 5.7" />
    </svg>
  );
}

export function P2TabBar({
  active,
  onChange,
  className = '',
}: {
  active: ShellTab;
  onChange: (t: ShellTab) => void;
  className?: string;
}) {
  return (
    <nav className={classNames('p2-tabbar', className)} aria-label="App sections">
      {SHELL_TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            className={classNames('p2-tab', active === tab.id && 'is-on')}
            onClick={() => onChange(tab.id)}
            aria-current={active === tab.id ? 'page' : undefined}
          >
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ── Download menu ────────────────────────────────────────────────────────── */

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  macos: Laptop,
  windows: Monitor,
  ios: Smartphone,
  android: Tablet,
};

export function DownloadMenu({
  compact = false,
  className = '',
  onPick,
}: {
  compact?: boolean;
  className?: string;
  onPick?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={classNames('p2-download', 'p2-download--header', className)} ref={wrap}>
      <button
        type="button"
        className={classNames(
          'p2-download-trigger',
          compact && 'p2-download-trigger--compact',
          !compact && 'p2-download-trigger--full',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? 'Download Mewzak' : 'Download Mewzak for your device'}
        onClick={() => setOpen((o) => !o)}
      >
        <Download aria-hidden="true" />
        {!compact ? <span>{SHELL.downloadLabel}</span> : null}
      </button>
      {open ? (
        <div className="p2-download-menu" role="menu" aria-label={SHELL.downloadTitle}>
          <div className="p2-download-menu-head">
            <strong>{SHELL.downloadTitle}</strong>
            <span>{SHELL.downloadBody}</span>
          </div>
          {DOWNLOAD_PLATFORMS.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.id] ?? Download;
            const selected = picked === platform.id;
            return (
              <button
                key={platform.id}
                type="button"
                className="p2-download-item"
                role="menuitem"
                onClick={() => {
                  setPicked(platform.id);
                  haptic(5);
                  onPick?.(platform.id);
                }}
                style={selected ? { background: 'rgba(255,255,255,.08)' } : undefined}
              >
                <span className="p2-download-icon">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span>
                  <strong>{platform.label}</strong>
                  <small>{platform.detail}</small>
                </span>
                {selected ? <Check size={14} aria-hidden="true" /> : <ChevronRight size={14} aria-hidden="true" />}
              </button>
            );
          })}
          <div className="p2-download-note">
            {picked
              ? `${DOWNLOAD_PLATFORMS.find((p) => p.id === picked)?.label} selected. Installers arrive with Phase 3.`
              : SHELL.downloadFootnote}
          </div>
        </div>
      ) : null}
    </div>
  );
}
