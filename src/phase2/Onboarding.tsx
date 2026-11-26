import { useCallback, useEffect, useRef, useState } from 'react';
import { Phone, Sparkles } from 'lucide-react';
import { useApp } from '../store';
import {
  ACCOUNT,
  AUTH_LOADING,
  BIRTHDAY,
  CREATE_PROFILE,
  LEGAL,
  MIN_AGE,
  ONBOARDING_SLIDES,
  READY,
  SIGN_IN,
  VIBE,
  dateMonths,
} from './copy';
import {
  DateWheel,
  P2Avatar,
  P2AvatarStack,
  P2Back,
  P2Button,
  P2Dots,
  P2Field,
  P2Skip,
  P2Wordmark,
  StatusPill,
  WordReveal,
  classNames,
  handleFor,
  haptic,
} from './ui';

export type OnboardingStep =
  | 'welcome'
  | 'signin'
  | 'loading'
  | 'birthday'
  | 'create'
  | 'ready'
  | 'vibe';

export type Birthday = { day: number; month: number; year: number };

export type P2Session = {
  step: OnboardingStep;
  name: string;
  handle: string;
  birthday: Birthday;
  genres: string[];
  avatarSeed: string;
  completed: boolean;
};

export const SESSION_KEY = 'mewzak.phase2.session.v1';

const STEP_LABELS: Record<OnboardingStep, string> = {
  welcome: 'Welcome',
  signin: 'Sign in',
  loading: 'Opening',
  birthday: 'Birthday',
  create: 'Name',
  ready: 'Ready',
  vibe: 'Vibe',
};

const STEP_ORDER: OnboardingStep[] = ['welcome', 'signin', 'loading', 'birthday', 'create', 'ready', 'vibe'];

export function defaultSession(): P2Session {
  const year = new Date().getFullYear() - 12;
  return {
    step: 'welcome',
    name: ACCOUNT.name,
    handle: ACCOUNT.handle,
    birthday: { day: 1, month: 0, year },
    genres: [],
    avatarSeed: ACCOUNT.name,
    completed: false,
  };
}

export function loadSession(): P2Session {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return defaultSession();
    const parsed = JSON.parse(raw) as Partial<P2Session>;
    const base = defaultSession();
    const birthday = parsed.birthday && typeof parsed.birthday.year === 'number' ? parsed.birthday : base.birthday;
    return {
      ...base,
      ...parsed,
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : base.name,
      handle: typeof parsed.handle === 'string' && parsed.handle.trim() ? parsed.handle : base.handle,
      birthday,
      genres: Array.isArray(parsed.genres) ? parsed.genres.filter((g): g is string => typeof g === 'string') : [],
      avatarSeed: typeof parsed.avatarSeed === 'string' ? parsed.avatarSeed : base.avatarSeed,
      completed: Boolean(parsed.completed),
      step: STEP_ORDER.includes(parsed.step as OnboardingStep) ? (parsed.step as OnboardingStep) : base.step,
    };
  } catch {
    return defaultSession();
  }
}

export function saveSession(session: P2Session) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* Design prototype: storage may be unavailable. */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* no-op */
  }
}

export function ageFromBirthday(b: Birthday): number {
  const now = new Date();
  let age = now.getFullYear() - b.year;
  const monthDiff = now.getMonth() - b.month;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < b.day)) age -= 1;
  return age;
}

export function birthdayIsValid(b: Birthday): boolean {
  const age = ageFromBirthday(b);
  if (age < MIN_AGE) return false;
  const stamp = new Date(b.year, b.month, b.day);
  return stamp.getTime() <= Date.now() && stamp.getFullYear() > 1899;
}

/* ── Persistent background ────────────────────────────────────────────────── */

function P2Background({ deep, lite }: { deep: boolean; lite: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { motion } = useApp();

  useEffect(() => {
    if (!motion || lite) return;
    const el = ref.current;
    if (!el) return;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.09;
      currentY += (targetY - currentY) * 0.09;
      el.style.setProperty('--p2-mx', `${currentX.toFixed(2)}px`);
      el.style.setProperty('--p2-my', `${currentY.toFixed(2)}px`);
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointer = (event: PointerEvent) => {
      const nx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
      const ny = event.clientY / Math.max(1, window.innerHeight) - 0.5;
      targetX = nx * 16;
      targetY = ny * 12;
      start();
    };

    const onOrientation = (event: DeviceOrientationEvent) => {
      targetX = Math.max(-30, Math.min(30, (event.gamma ?? 0) * 0.5));
      targetY = Math.max(-24, Math.min(24, ((event.beta ?? 0) - 45) * 0.35));
      start();
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrientation);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [motion, lite]);

  return (
    <div className="p2-bg" ref={ref} aria-hidden="true">
      <div className="p2-bg-scene">
        <span className="p2-bg-blob p2-bg-blob--1" />
        <span className="p2-bg-blob p2-bg-blob--2" />
        <span className="p2-bg-blob p2-bg-blob--3" />
        <span className="p2-bg-orb" />
        <span className="p2-ripples">
          <i className="p2-ripple" />
          <i className="p2-ripple" />
          <i className="p2-ripple" />
          <i className="p2-ripple" />
        </span>
      </div>
      <div className="p2-bg-grain" />
    </div>
  );
}

/* ── Legal sheet ──────────────────────────────────────────────────────────── */

function LegalModal({ kind, onClose }: { kind: 'privacy' | 'terms'; onClose: () => void }) {
  const title = kind === 'privacy' ? LEGAL.privacyTitle : LEGAL.termsTitle;
  const body = kind === 'privacy' ? LEGAL.privacyBody : LEGAL.termsBody;
  return (
    <div className="p2-modal-scrim" onClick={onClose} role="presentation">
      <div className="p2-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <span className="p2-eyebrow">
          <i /> Mewzak · the fine print
        </span>
        <h3>{title}</h3>
        <p>{body}</p>
        <P2Button variant="cream" onClick={onClose}>
          Understood
        </P2Button>
      </div>
    </div>
  );
}

/* ── Main onboarding flow ─────────────────────────────────────────────────── */

export function OnboardingFlow({
  initial,
  replay = false,
  localOnly = false,
  onComplete,
}: {
  initial: P2Session;
  replay?: boolean;
  localOnly?: boolean;
  onComplete: (session: P2Session) => void;
}) {
  const { motion } = useApp();
  const [step, setStep] = useState<OnboardingStep>(
    replay || initial.completed ? 'welcome' : initial.step === 'loading' ? 'birthday' : initial.step,
  );
  const [name, setName] = useState(initial.name || ACCOUNT.name);
  const [birthday, setBirthday] = useState<Birthday>(initial.birthday);
  const [genres, setGenres] = useState<string[]>(initial.genres);
  const [avatarSeed, setAvatarSeed] = useState(initial.avatarSeed || initial.name);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);
  const [lite] = useState(
    () =>
      typeof navigator !== 'undefined' &&
      typeof navigator.hardwareConcurrency === 'number' &&
      navigator.hardwareConcurrency > 0 &&
      navigator.hardwareConcurrency <= 4,
  );
  const transitionRef = useRef<number | null>(null);
  const savingRef = useRef<number | null>(null);
  const signinRef = useRef<number | null>(null);

  const valid = birthdayIsValid(birthday);

  const go = useCallback(
    (next: OnboardingStep) => {
      if (next === step || saving) return;
      haptic(6);
      if (transitionRef.current) window.clearTimeout(transitionRef.current);
      if (!motion) {
        setStep(next);
        return;
      }
      setLeaving(true);
      transitionRef.current = window.setTimeout(() => {
        setStep(next);
        setLeaving(false);
        setSlide(0);
        setPaused(false);
      }, 190);
    },
    [motion, saving, step],
  );

  useEffect(() => {
    return () => {
      if (transitionRef.current) window.clearTimeout(transitionRef.current);
      if (savingRef.current) window.clearTimeout(savingRef.current);
      if (signinRef.current) window.clearTimeout(signinRef.current);
    };
  }, []);

  // Persist the unfinished room, so a reload resumes exactly here.
  useEffect(() => {
    if (saving) return;
    const persistedStep = step === 'loading' ? 'birthday' : step;
    saveSession({
      step: persistedStep,
      name,
      handle: handleFor(name),
      birthday,
      genres,
      avatarSeed,
      completed: initial.completed,
    });
  }, [avatarSeed, birthday, genres, initial.completed, name, saving, step]);

  // Simulated Phase 1 auth handoff. No network; no account leaves the page.
  useEffect(() => {
    if (step !== 'loading') return;
    const timer = window.setTimeout(() => {
      setStep('birthday');
    }, 1450);
    signinRef.current = timer;
    return () => window.clearTimeout(timer);
  }, [step]);

  // Carousel: one clock, paused on hover/focus and with reduced motion.
  useEffect(() => {
    if (step !== 'welcome' || paused || !motion) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % ONBOARDING_SLIDES.length), 3500);
    return () => window.clearInterval(timer);
  }, [motion, paused, step]);

  const back = () => {
    if (saving) return;
    if (step === 'welcome') return;
    if (step === 'loading') {
      if (signinRef.current) window.clearTimeout(signinRef.current);
      setStep('signin');
      return;
    }
    const order: Partial<Record<OnboardingStep, OnboardingStep>> = {
      signin: 'welcome',
      birthday: 'signin',
      create: 'birthday',
      ready: 'create',
      vibe: 'ready',
    };
    const previous = order[step];
    if (previous) go(previous);
  };

  const goSignin = () => {
    if (transitionRef.current) window.clearTimeout(transitionRef.current);
    setStep('signin');
    setSlide(0);
  };

  const auth = () => {
    setSaving(true);
    haptic(10);
    window.setTimeout(() => {
      setSaving(false);
      setStep('loading');
    }, 240);
  };

  const updateMonth = (next: number) => {
    setBirthday((b) => {
      const max = new Date(b.year, next + 1, 0).getDate();
      return { ...b, month: next, day: Math.min(b.day, max) };
    });
  };

  const updateYear = (next: number) => {
    setBirthday((b) => {
      const max = new Date(next, b.month + 1, 0).getDate();
      return { ...b, year: next, day: Math.min(b.day, max) };
    });
  };

  const saveProfile = (then: 'ready' | 'complete') => {
    if (!name.trim() || saving) return;
    setSaving(true);
    haptic(10);
    savingRef.current = window.setTimeout(() => {
      setSaving(false);
      if (then === 'ready') {
        go('ready');
      } else {
        const session: P2Session = {
          step: 'vibe',
          name: name.trim(),
          handle: handleFor(name),
          birthday,
          genres,
          avatarSeed,
          completed: true,
        };
        saveSession(session);
        onComplete(session);
      }
    }, 720);
  };

  const toggleGenre = (genre: string) => {
    setGenres((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    );
  };

  const activeSlide = ONBOARDING_SLIDES[slide];
  const stepNumber = Math.max(1, STEP_ORDER.indexOf(step) + 1);
  const deep = step === 'create' || step === 'ready' || step === 'vibe';

  const stepContent = () => {
    if (step === 'welcome') {
      return (
        <div className="p2-flow p2-flow--welcome" key="welcome">
          <div className="p2-welcome-brand">
            <div className="p2-onboard-brand-copy">
              <P2Wordmark size={26} />
              <p>Music with soft paws.</p>
            </div>
          </div>

          <div
            className="p2-carousel"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {ONBOARDING_SLIDES.map((s, i) => (
              <div key={s.title} className={classNames('p2-slide', i === slide && 'is-on')} aria-hidden={i !== slide}>
                <span className="p2-eyebrow">
                  <i /> {s.eyebrow}
                </span>
                <h1 className="p2-slide-title">
                  {i === slide ? <WordReveal text={s.title} /> : s.title}
                </h1>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="p2-carousel-foot">
            <P2Dots
              count={ONBOARDING_SLIDES.length}
              active={slide}
              onChange={(i) => {
                setSlide(i);
                haptic(3);
              }}
              labels={ONBOARDING_SLIDES.map((s) => s.eyebrow)}
            />
            <span className="p2-carousel-index">0{slide + 1} / 03</span>
          </div>

          {localOnly ? (
            <>
              <div className="p2-auth-actions">
                <P2Button variant="gradient" block onClick={goSignin}>
                  {SIGN_IN.localCta}
                </P2Button>
              </div>
              <p className="p2-flow-note">{SIGN_IN.localWelcomeNote}</p>
            </>
          ) : (
            <>
              <div className="p2-auth-actions">
                <P2Button variant="cream" block onClick={goSignin} icon={<span className="p2-gmark">G</span>}>
                  {SIGN_IN.google}
                </P2Button>
                <P2Button variant="cream" block onClick={goSignin} icon={<Phone size={15} />}>
                  {SIGN_IN.phone}
                </P2Button>
              </div>

              <p className="p2-signin-link">
                Already have an account?{' '}
                <button type="button" onClick={goSignin}>
                  Sign in
                </button>
              </p>
              <p className="p2-flow-note">{SIGN_IN.legal}</p>
            </>
          )}
        </div>
      );
    }

    if (step === 'signin') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} key="signin">
          <div className="p2-flow-head">
            <span className="p2-eyebrow">
              <i /> {SIGN_IN.eyebrow}
            </span>
            <h1 className="p2-onboard-title">
              <WordReveal text={localOnly ? SIGN_IN.localTitle : SIGN_IN.title} />
            </h1>
            <p className="p2-onboard-body">{localOnly ? SIGN_IN.localBody : SIGN_IN.body}</p>
          </div>

          {localOnly ? (
            <>
              <div className="p2-auth-actions">
                <P2Button variant="gradient" block loading={saving} onClick={auth}>
                  {SIGN_IN.localCta}
                </P2Button>
              </div>
              <p className="p2-flow-note">{SIGN_IN.localNote}</p>
            </>
          ) : (
            <>
              <div className="p2-auth-actions">
                <P2Button variant="cream" block loading={saving} onClick={auth} icon={<span className="p2-gmark">G</span>}>
                  {SIGN_IN.google}
                </P2Button>
                <P2Button variant="cream" block onClick={auth} disabled={saving} icon={<Phone size={15} />}>
                  {SIGN_IN.phone}
                </P2Button>
              </div>

              <div className="p2-divider">{SIGN_IN.divider}</div>

              <div className="p2-social-row">
                <span className="p2-social-label">{SIGN_IN.socialHeading}</span>
                <button type="button" className="p2-social-square" aria-label="Continue with Google" onClick={auth}>
                  <span>G</span>
                </button>
                <button type="button" className="p2-social-square" aria-label="Continue with phone" onClick={auth}>
                  <Phone size={19} />
                </button>
              </div>

              <p className="p2-flow-note">{SIGN_IN.legal}</p>
            </>
          )}
          <p className="p2-signin-link">
            {localOnly ? 'Changed your mind?' : 'New here?'}{' '}
            <button type="button" onClick={() => go('welcome')}>
              Start from the beginning
            </button>
          </p>
        </div>
      );
    }

    if (step === 'loading') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} key="loading">
          <div className="p2-loading-step">
            <div className="p2-loading-orbit" aria-hidden="true">
              <span className="p2-spinner p2-spinner--pink p2-spinner--lg" />
            </div>
            <div className="p2-flow-head">
              <span className="p2-eyebrow">
                <i /> {AUTH_LOADING.working}
              </span>
              <h1 className="p2-onboard-title p2-onboard-title--sm">
                <WordReveal text={AUTH_LOADING.title} />
              </h1>
              <p className="p2-onboard-body">{AUTH_LOADING.body}</p>
            </div>
            <div className="p2-demo-status">
              <StatusPill mode="loading" message={AUTH_LOADING.working} />
            </div>
          </div>
        </div>
      );
    }

    if (step === 'birthday') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} key="birthday">
          <div className="p2-flow-head">
            <span className="p2-eyebrow">
              <i /> {BIRTHDAY.eyebrow}
            </span>
            <h1 className="p2-onboard-title p2-onboard-title--sm">
              <WordReveal text={BIRTHDAY.title} />
            </h1>
            <p className="p2-onboard-body">{BIRTHDAY.body}</p>
          </div>

          <DateWheel
            day={birthday.day}
            month={birthday.month}
            year={birthday.year}
            onDay={(day) => setBirthday((b) => ({ ...b, day }))}
            onMonth={updateMonth}
            onYear={updateYear}
          />
          <div className={classNames('p2-wheel-hint', valid && 'is-valid')}>
            <Sparkles size={13} aria-hidden="true" />
            <span>{valid ? BIRTHDAY.valid : BIRTHDAY.invalid}</span>
          </div>

          <div className="p2-flow-foot">
            <P2Button
              variant="gradient"
              block
              disabled={!valid}
              armed={valid}
              onClick={() => go('create')}
            >
              {BIRTHDAY.continue}
            </P2Button>
            <p className="p2-onboard-legal">
              {BIRTHDAY.legalPrefix}{' '}
              <button type="button" className="p2-link" onClick={() => setLegal('privacy')}>
                {BIRTHDAY.privacy}
              </button>{' '}
              {BIRTHDAY.and}{' '}
              <button type="button" className="p2-link" onClick={() => setLegal('terms')}>
                {BIRTHDAY.terms}
              </button>
              {BIRTHDAY.legalSuffix}
            </p>
          </div>
        </div>
      );
    }

    if (step === 'create') {
      const handle = handleFor(name);
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} key="create">
          <div className="p2-flow-head">
            <span className="p2-eyebrow">
              <i /> {CREATE_PROFILE.eyebrow}
            </span>
            <h1 className="p2-onboard-title p2-onboard-title--sm">
              <WordReveal text={CREATE_PROFILE.title} />
            </h1>
            <p className="p2-onboard-body">{CREATE_PROFILE.body}</p>
          </div>

          <div className="p2-avatar-stage">
            <P2Avatar
              name={name || ACCOUNT.name}
              size={124}
              seed={avatarSeed}
              editable
              onEdit={() => {
                setAvatarSeed(`${name || 'mew'}-${Date.now()}`);
                haptic(8);
              }}
            />
          </div>

          <P2Field label={CREATE_PROFILE.label} value={name} onChange={setName} placeholder={CREATE_PROFILE.placeholder} maxLength={48} />
          <p className="p2-handle-hint">
            {CREATE_PROFILE.handleHint} <b>{handle}</b>
          </p>

          <div className="p2-flow-foot">
            <P2Button
              variant="gradient"
              block
              loading={saving}
              disabled={!name.trim()}
              armed={Boolean(name.trim())}
              onClick={() => saveProfile('ready')}
            >
              {CREATE_PROFILE.continue}
            </P2Button>
          </div>
        </div>
      );
    }

    if (step === 'ready') {
      return (
        <div className={classNames('p2-flow', 'p2-ready', leaving && 'is-leaving')} key="ready">
          <div className="p2-flow-head">
            <span className="p2-eyebrow">
              <i /> {READY.eyebrow}
            </span>
            <h1 className="p2-onboard-title">
              <WordReveal text={READY.title} />
            </h1>
            <p className="p2-onboard-body">{READY.body}</p>
          </div>

          <div className="p2-ready-stack">
            <P2AvatarStack names={[name, 'Luna Vale', 'Yuki Halo']} size={38} />
            <p>{READY.avatarLine}</p>
          </div>

          <div className="p2-flow-foot">
            <P2Button variant="gradient" block onClick={() => go('vibe')}>
              {READY.cta}
            </P2Button>
          </div>
        </div>
      );
    }

    return (
      <div className={classNames('p2-flow', 'p2-vibe-step', leaving && 'is-leaving')} key="vibe">
        <div className="p2-flow-head">
          <span className="p2-eyebrow">
            <i /> {VIBE.eyebrow}
          </span>
          <h1 className="p2-onboard-title p2-onboard-title--sm">
            <WordReveal text={VIBE.title} />
          </h1>
          <p className="p2-onboard-body">{VIBE.body}</p>
        </div>

        <div className="p2-vibe-chips">
          <div className="p2-chip-cloud">
            {VIBE.genres.map((genre, i) => (
              <button
                type="button"
                key={genre}
                className={classNames('p2-chip', genres.includes(genre) && 'is-on')}
                aria-pressed={genres.includes(genre)}
                style={{
                  animationDelay: `${Math.min(i * 22, 340)}ms, ${(i * 431) % 4000}ms`,
                }}
                onClick={() => toggleGenre(genre)}
              >
                {genres.includes(genre) ? <CheckGlyph /> : null}
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="p2-vibe-count">
          <span>{genres.length ? `${genres.length} selected` : VIBE.none}</span>
          <span>Optional</span>
        </div>

        <div className="p2-flow-foot">
          <P2Button
            variant="gradient"
            block
            loading={saving}
            onClick={() => saveProfile('complete')}
          >
            {saving ? VIBE.saving : VIBE.cta}
          </P2Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p2-onboard" data-atmosphere={deep ? 'deep' : 'warm'} data-lite={lite ? 'true' : 'false'}>
      <P2Background deep={deep} lite={lite} />

      <div className="p2-onboard-inner">
        <header className="p2-onboard-top">
          <div className="p2-onboard-top-left">
            {step !== 'welcome' ? <P2Back onClick={back} /> : null}
            {step !== 'welcome' ? <P2Wordmark size={19} /> : null}
          </div>
          <div className="p2-onboard-top-right">
            {step === 'ready' ? (
              <P2Skip onClick={() => go('vibe')}>{READY.skip}</P2Skip>
            ) : step === 'welcome' ? null : (
              <span className="p2-step-count">
                {String(stepNumber).padStart(2, '0')} / 07
              </span>
            )}
          </div>
        </header>

        <div
          className="p2-onboard-stage"
          onScroll={() => {
            /* Keeps the header still while long steps scroll. */
          }}
        >
          <div className="p2-flow-wrap">
            {step === 'welcome' ? null : <div className="p2-flow-progress" aria-hidden="true" style={{ width: `${(stepNumber / 7) * 100}%` }} />}
            {stepContent()}
          </div>
        </div>
      </div>

      {legal ? <LegalModal kind={legal} onClose={() => setLegal(null)} /> : null}
    </div>
  );
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.3 4L19 6.8" />
    </svg>
  );
}
