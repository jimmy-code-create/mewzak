import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useApp } from '../store';
import { submitAuth, type AuthMode } from './auth';
import {
  ACCOUNT,
  AUTH,
  AUTH_LOADING,
  BIRTHDAY,
  CREATE_PROFILE,
  LEGAL,
  MIN_AGE,
  ONBOARDING_SLIDES,
  READY,
  SIGN_IN,
  VIBE,
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
import {
  OnboardingBackgroundLayer,
  type OnboardingBackgroundApi,
} from './OnboardingBackground';

export type OnboardingStep =
  | 'welcome'
  | 'device'
  | 'email'
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

const STEP_ORDER: OnboardingStep[] = [
  'welcome',
  'device',
  'email',
  'loading',
  'birthday',
  'create',
  'ready',
  'vibe',
];
const STEP_TOTAL = STEP_ORDER.length;

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
    const parsed = JSON.parse(raw) as Omit<Partial<P2Session>, 'step'> & { step?: string };
    const base = defaultSession();
    const birthday = parsed.birthday && typeof parsed.birthday.year === 'number' ? parsed.birthday : base.birthday;
    // Migrate the old local-only "signin" step to the new device step.
    const rawStep = parsed.step === 'signin' ? 'device' : parsed.step;
    return {
      ...base,
      ...parsed,
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : base.name,
      handle: typeof parsed.handle === 'string' && parsed.handle.trim() ? parsed.handle : base.handle,
      birthday,
      genres: Array.isArray(parsed.genres) ? parsed.genres.filter((g): g is string => typeof g === 'string') : [],
      avatarSeed: typeof parsed.avatarSeed === 'string' ? parsed.avatarSeed : base.avatarSeed,
      completed: Boolean(parsed.completed),
      step: STEP_ORDER.includes(rawStep as OnboardingStep) ? (rawStep as OnboardingStep) : base.step,
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

/* ── Small pieces ─────────────────────────────────────────────────────────── */

function RollingNumber({ value, length = 2 }: { value: number; length?: number }) {
  const text = String(value).padStart(length, '0');
  return (
    <span className="p2-roll" aria-hidden="true">
      {text.split('').map((digit, index) => (
        <span className="p2-roll-col" key={index}>
          <span
            className="p2-roll-strip"
            style={{ transform: `translateY(-${Number(digit)}em)` }}
          >
            {Array.from({ length: 10 }, (_, number) => (
              <span key={number}>{number}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

function AuthField({
  label,
  value,
  onChange,
  type = 'text',
  name,
  autoComplete,
  placeholder,
  error,
  onBlur,
  eye = false,
  show = false,
  onToggleShow,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password';
  name?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string | null;
  onBlur?: () => void;
  eye?: boolean;
  show?: boolean;
  onToggleShow?: () => void;
}) {
  const id = useId();
  const invalid = Boolean(error);
  return (
    <div className="p2-auth-field-wrap">
      <div
        className={classNames(
          'p2-field',
          'p2-auth-field',
          value && 'is-filled',
          invalid && 'is-invalid',
          eye && 'has-eye',
        )}
      >
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize={type === 'email' ? 'none' : undefined}
          autoCorrect={type === 'email' ? 'off' : undefined}
          spellCheck={type === 'email' ? false : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onBlur={onBlur}
        />
        <label htmlFor={id}>{label}</label>
        {eye ? (
          <button
            type="button"
            className="p2-eye"
            onClick={onToggleShow}
            aria-label={show ? AUTH.hidePassword : AUTH.showPassword}
            aria-pressed={show}
          >
            {show ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="p2-auth-error" id={`${id}-error`} role="alert">
          <i aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

function passwordScore(password: string) {
  if (password.length < 8) return 0;
  let score = 1;
  if (password.length >= 10) score = 2;
  if (password.length >= 12) score = 3;
  if (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  ) {
    score = 4;
  }
  return score;
}

function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password);
  return (
    <div className="p2-strength">
      <div
        className="p2-strength-track"
        role="meter"
        aria-label={AUTH.strengthLabel}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={AUTH.strength[score]}
      >
        {[0, 1, 2, 3].map((index) => (
          <i key={index} className={index < score ? 'is-on' : ''} />
        ))}
      </div>
      <span>{password ? AUTH.strength[score] : AUTH.strengthHint}</span>
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
  onProgress,
}: {
  initial: P2Session;
  replay?: boolean;
  localOnly?: boolean;
  onComplete: (session: P2Session) => void;
  onProgress?: (session: P2Session) => void;
}) {
  const { motion } = useApp();
  const [step, setStep] = useState<OnboardingStep>(
    replay || initial.completed ? 'welcome' : initial.step === 'loading' ? 'birthday' : initial.step,
  );
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [name, setName] = useState(initial.name || ACCOUNT.name);
  const [birthday, setBirthday] = useState<Birthday>(initial.birthday);
  const [genres, setGenres] = useState<string[]>(initial.genres);
  const [avatarSeed, setAvatarSeed] = useState(initial.avatarSeed || initial.name);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [legal, setLegal] = useState<'privacy' | 'terms' | null>(null);

  const [authMode, setAuthMode] = useState<AuthMode>('create');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [forgotNote, setForgotNote] = useState(false);

  const transitionRef = useRef<number | null>(null);
  const savingRef = useRef<number | null>(null);
  const authDelayRef = useRef<number | null>(null);
  const shakeRef = useRef<number | null>(null);
  const bgRef = useRef<OnboardingBackgroundApi>(null);
  const firstBgStep = useRef(true);
  const authSourceRef = useRef<'device' | 'email'>('email');

  const valid = birthdayIsValid(birthday);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const passwordValid = password.length >= 8;
  const canSubmit = emailValid && passwordValid && !authLoading && !saving;
  const emailError = emailTouched && !emailValid ? (email.trim() ? AUTH.emailInvalid : AUTH.emailRequired) : null;
  const passwordError = passwordTouched && !passwordValid ? AUTH.passwordInvalid : null;

  const go = useCallback(
    (next: OnboardingStep, nextDirection: 'forward' | 'back' = 'forward') => {
      if (next === step || saving) return;
      haptic(6);
      if (transitionRef.current) window.clearTimeout(transitionRef.current);
      setDirection(nextDirection);
      if (!motion) {
        setStep(next);
        setSlide(0);
        setPaused(false);
        return;
      }
      setLeaving(true);
      transitionRef.current = window.setTimeout(() => {
        setStep(next);
        setLeaving(false);
        setSlide(0);
        setPaused(false);
      }, 200);
    },
    [motion, saving, step],
  );

  useEffect(() => {
    return () => {
      if (transitionRef.current) window.clearTimeout(transitionRef.current);
      if (savingRef.current) window.clearTimeout(savingRef.current);
      if (authDelayRef.current) window.clearTimeout(authDelayRef.current);
      if (shakeRef.current) window.clearTimeout(shakeRef.current);
    };
  }, []);

  // Persist the unfinished room, so a reload resumes exactly here. Passwords
  // are deliberately absent from P2Session and therefore never persisted.
  useEffect(() => {
    if (saving || finishing) return;
    const persistedStep = step === 'loading' ? 'birthday' : step;
    const draft: P2Session = {
      step: persistedStep,
      name,
      handle: handleFor(name),
      birthday,
      genres,
      avatarSeed,
      completed: initial.completed,
    };
    saveSession(draft);
    onProgress?.(draft);
  }, [avatarSeed, birthday, finishing, genres, initial.completed, name, onProgress, saving, step]);

  // The background morphs once per step. pulse() adds the soft ring burst.
  const bgStep = STEP_ORDER.indexOf(step);
  useEffect(() => {
    const background = bgRef.current;
    if (!background) return;
    background.setStep(bgStep);
    if (!firstBgStep.current) background.pulse();
    firstBgStep.current = false;
  }, [bgStep]);

  // Simulated handoff for the local-only path. No network; no account leaves
  // the page. The email path calls the submitAuth adapter instead.
  useEffect(() => {
    if (step !== 'loading') return;
    const timer = window.setTimeout(() => {
      go('birthday', 'forward');
    }, 1450);
    authDelayRef.current = timer;
    return () => window.clearTimeout(timer);
  }, [go, step]);

  // Carousel: one clock, paused on hover/focus and with reduced motion.
  useEffect(() => {
    if (step !== 'welcome' || paused || !motion) return;
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % ONBOARDING_SLIDES.length), 3500);
    return () => window.clearInterval(timer);
  }, [motion, paused, step]);

  const back = () => {
    if (saving || finishing || authLoading) return;
    const order: Partial<Record<OnboardingStep, OnboardingStep>> = {
      device: 'welcome',
      email: 'welcome',
      loading: authSourceRef.current === 'email' ? 'email' : 'device',
      birthday: authSourceRef.current === 'email' ? 'email' : 'device',
      create: 'birthday',
      ready: 'create',
      vibe: 'ready',
    };
    const previous = order[step];
    if (previous) go(previous, 'back');
  };

  const openEmail = (mode: AuthMode) => {
    setAuthMode(mode);
    setPassword('');
    setShowPassword(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setAuthError(null);
    setForgotNote(false);
    setShake(false);
    authSourceRef.current = 'email';
    go('email', 'forward');
  };

  const changeAuthMode = (mode: AuthMode) => {
    if (mode === authMode || authLoading) return;
    haptic(4);
    setAuthMode(mode);
    setPassword('');
    setShowPassword(false);
    setPasswordTouched(false);
    setEmailTouched(false);
    setAuthError(null);
    setForgotNote(false);
    setShake(false);
  };

  const triggerShake = () => {
    setShake(false);
    window.requestAnimationFrame(() => setShake(true));
    if (shakeRef.current) window.clearTimeout(shakeRef.current);
    shakeRef.current = window.setTimeout(() => setShake(false), 520);
  };

  const submitEmail = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (authLoading || saving) return;
    if (!emailValid || !passwordValid) {
      setEmailTouched(true);
      setPasswordTouched(true);
      triggerShake();
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setForgotNote(false);
    haptic(8);
    const result = await submitAuth(email.trim(), password, authMode);
    if (!result.ok) {
      setAuthLoading(false);
      setAuthError(result.message);
      triggerShake();
      return;
    }

    // Drop the password as soon as the adapter is done with it.
    setPassword('');
    setAuthLoading(false);
    authSourceRef.current = 'email';
    go('loading', 'forward');
  };

  const deviceAuth = () => {
    if (saving) return;
    authSourceRef.current = 'device';
    setSaving(true);
    haptic(10);
    if (authDelayRef.current) window.clearTimeout(authDelayRef.current);
    authDelayRef.current = window.setTimeout(() => {
      setSaving(false);
      go('loading', 'forward');
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
    if (!name.trim() || saving || finishing) return;
    if (then === 'ready') {
      setSaving(true);
      haptic(10);
      savingRef.current = window.setTimeout(() => {
        setSaving(false);
        go('ready', 'forward');
      }, 720);
      return;
    }

    setSaving(true);
    setFinishing(true);
    haptic(12);
    bgRef.current?.finish();
    savingRef.current = window.setTimeout(() => {
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
    }, 1320);
  };

  const toggleGenre = (genre: string) => {
    setGenres((current) =>
      current.includes(genre) ? current.filter((g) => g !== genre) : [...current, genre],
    );
  };

  const activeSlide = ONBOARDING_SLIDES[slide];
  const stepNumber = Math.max(1, STEP_ORDER.indexOf(step) + 1);
  const deep = step === 'create' || step === 'ready' || step === 'vibe';
  const progress = (stepNumber / STEP_TOTAL) * 100;

  const stepContent = () => {
    if (step === 'welcome') {
      return (
        <div
          className={classNames('p2-flow', 'p2-flow--welcome', leaving && 'is-leaving')}
          data-dir={direction}
          key="welcome"
        >
          <div className="p2-welcome-brand p2-stagger-1">
            <div className="p2-onboard-brand-copy">
              <P2Wordmark size={26} />
              <p>Music with soft paws.</p>
            </div>
          </div>

          <div
            className="p2-carousel p2-stagger-2"
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
                  {i === slide ? <WordReveal text={s.title} delay={80} stagger={44} /> : s.title}
                </h1>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="p2-carousel-foot p2-stagger-3">
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

          <div className="p2-auth-actions p2-stagger-4">
            <P2Button variant="gradient" block onClick={() => openEmail('create')}>
              {SIGN_IN.emailCta}
            </P2Button>
            <P2Button variant="glass" block onClick={() => go('device', 'forward')}>
              {SIGN_IN.localCta}
            </P2Button>
          </div>

          <p className="p2-signin-link p2-stagger-5">
            Already have an account?{' '}
            <button type="button" onClick={() => openEmail('login')}>
              Sign in
            </button>
          </p>
          <p className="p2-flow-note p2-stagger-5">
            {localOnly ? SIGN_IN.localWelcomeNote : SIGN_IN.legal}
          </p>
        </div>
      );
    }

    if (step === 'device') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} data-dir={direction} key="device">
          <div className="p2-flow-head">
            <span className="p2-eyebrow p2-stagger-1">
              <i /> {SIGN_IN.eyebrow}
            </span>
            <h1 className="p2-onboard-title">
              <WordReveal text={SIGN_IN.localTitle} delay={70} stagger={44} />
            </h1>
            <p className="p2-onboard-body p2-stagger-3">{SIGN_IN.localBody}</p>
          </div>

          <div className="p2-flow-foot p2-stagger-5">
            <P2Button variant="gradient" block loading={saving} onClick={deviceAuth}>
              {SIGN_IN.localCta}
            </P2Button>
            <p className="p2-flow-note">{SIGN_IN.localNote}</p>
          </div>

          <p className="p2-signin-link">
            Changed your mind?{' '}
            <button type="button" onClick={() => go('welcome', 'back')}>
              Start from the beginning
            </button>
          </p>
        </div>
      );
    }

    if (step === 'email') {
      const title = authMode === 'create' ? AUTH.createTitle : AUTH.loginTitle;
      const body = authMode === 'create' ? AUTH.createBody : AUTH.loginBody;
      return (
        <div className={classNames('p2-flow', 'p2-auth-step', leaving && 'is-leaving')} data-dir={direction} key="email">
          <div className="p2-flow-head">
            <span className="p2-eyebrow p2-stagger-1">
              <i /> {AUTH.eyebrow}
            </span>
            <h1 className="p2-onboard-title p2-onboard-title--sm">
              <WordReveal key={authMode} text={title} delay={70} stagger={44} />
            </h1>
            <p className="p2-onboard-body p2-stagger-3">{body}</p>
          </div>

          <div className="p2-seg p2-stagger-4" role="tablist" aria-label="Account action">
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'create'}
              className={authMode === 'create' ? 'is-on' : ''}
              onClick={() => changeAuthMode('create')}
            >
              {AUTH.createTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMode === 'login'}
              className={authMode === 'login' ? 'is-on' : ''}
              onClick={() => changeAuthMode('login')}
            >
              {AUTH.loginTab}
            </button>
          </div>

          <form
            className={classNames('p2-auth-form p2-stagger-4', shake && 'is-shaking')}
            onSubmit={submitEmail}
            noValidate
          >
            <AuthField
              label={AUTH.emailLabel}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={AUTH.emailPlaceholder}
              value={email}
              onChange={setEmail}
              onBlur={() => setEmailTouched(true)}
              error={emailError}
            />

            <AuthField
              label={AUTH.passwordLabel}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={authMode === 'create' ? 'new-password' : 'current-password'}
              placeholder={AUTH.passwordPlaceholder}
              value={password}
              onChange={setPassword}
              onBlur={() => setPasswordTouched(true)}
              error={passwordError}
              eye
              show={showPassword}
              onToggleShow={() => {
                setShowPassword((current) => !current);
                haptic(3);
              }}
            />

            {authMode === 'create' ? <PasswordStrength password={password} /> : null}

            {authError ? (
              <p className="p2-auth-error p2-auth-error--form" role="alert">
                <i aria-hidden="true" />
                <span>{authError}</span>
              </p>
            ) : null}

            <div className="p2-flow-foot p2-stagger-5">
              <P2Button
                variant="gradient"
                block
                type="submit"
                disabled={!canSubmit}
                armed={canSubmit}
                loading={authLoading}
              >
                {authMode === 'create' ? AUTH.continueCreate : AUTH.continueLogin}
              </P2Button>

              {authMode === 'login' ? (
                <button
                  type="button"
                  className="p2-auth-forgot"
                  onClick={() => {
                    setForgotNote(true);
                    haptic(3);
                  }}
                >
                  {AUTH.forgot}
                </button>
              ) : null}
              {forgotNote ? <p className="p2-auth-note">{AUTH.forgotNote}</p> : null}

              <p className="p2-flow-note">{AUTH.legal}</p>
            </div>
          </form>
        </div>
      );
    }

    if (step === 'loading') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} data-dir={direction} key="loading">
          <div className="p2-loading-step">
            <div className="p2-loading-orbit p2-stagger-1" aria-hidden="true">
              <span className="p2-spinner p2-spinner--pink p2-spinner--lg" />
            </div>
            <div className="p2-flow-head">
              <span className="p2-eyebrow p2-stagger-2">
                <i /> {AUTH_LOADING.working}
              </span>
              <h1 className="p2-onboard-title p2-onboard-title--sm">
                <WordReveal text={AUTH_LOADING.title} delay={70} stagger={44} />
              </h1>
              <p className="p2-onboard-body p2-stagger-3">{AUTH_LOADING.body}</p>
            </div>
            <div className="p2-demo-status p2-stagger-4">
              <StatusPill mode="loading" message={AUTH_LOADING.working} />
            </div>
          </div>
        </div>
      );
    }

    if (step === 'birthday') {
      return (
        <div className={classNames('p2-flow', leaving && 'is-leaving')} data-dir={direction} key="birthday">
          <div className="p2-flow-head">
            <span className="p2-eyebrow p2-stagger-1">
              <i /> {BIRTHDAY.eyebrow}
            </span>
            <h1 className="p2-onboard-title p2-onboard-title--sm">
              <WordReveal text={BIRTHDAY.title} delay={70} stagger={44} />
            </h1>
            <p className="p2-onboard-body p2-stagger-3">{BIRTHDAY.body}</p>
          </div>

          <DateWheel
            className="p2-stagger-4"
            day={birthday.day}
            month={birthday.month}
            year={birthday.year}
            onDay={(day) => setBirthday((b) => ({ ...b, day }))}
            onMonth={updateMonth}
            onYear={updateYear}
          />
          <div className={classNames('p2-wheel-hint', 'p2-stagger-4', valid && 'is-valid')}>
            <Sparkles size={13} aria-hidden="true" />
            <span>{valid ? BIRTHDAY.valid : BIRTHDAY.invalid}</span>
          </div>

          <div className="p2-flow-foot p2-stagger-5">
            <P2Button
              variant="gradient"
              block
              disabled={!valid}
              armed={valid}
              onClick={() => go('create', 'forward')}
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
        <div className={classNames('p2-flow', leaving && 'is-leaving')} data-dir={direction} key="create">
          <div className="p2-flow-head">
            <span className="p2-eyebrow p2-stagger-1">
              <i /> {CREATE_PROFILE.eyebrow}
            </span>
            <h1 className="p2-onboard-title p2-onboard-title--sm">
              <WordReveal text={CREATE_PROFILE.title} delay={70} stagger={44} />
            </h1>
            <p className="p2-onboard-body p2-stagger-3">{CREATE_PROFILE.body}</p>
          </div>

          <div className="p2-avatar-stage p2-stagger-4">
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

          <div className="p2-stagger-4">
            <P2Field
              label={CREATE_PROFILE.label}
              value={name}
              onChange={setName}
              placeholder={CREATE_PROFILE.placeholder}
              maxLength={48}
              onEnter={() => saveProfile('ready')}
            />
            <p className="p2-handle-hint">
              {CREATE_PROFILE.handleHint} <b>{handle}</b>
            </p>
          </div>

          <div className="p2-flow-foot p2-stagger-5">
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
        <div className={classNames('p2-flow', 'p2-ready', leaving && 'is-leaving')} data-dir={direction} key="ready">
          <div className="p2-flow-head">
            <span className="p2-eyebrow p2-stagger-1">
              <i /> {READY.eyebrow}
            </span>
            <h1 className="p2-onboard-title">
              <WordReveal text={READY.title} delay={70} stagger={44} />
            </h1>
            <p className="p2-onboard-body p2-stagger-3">{READY.body}</p>
          </div>

          <div className="p2-ready-stack p2-stagger-4">
            <P2AvatarStack names={[name, 'Luna Vale', 'Yuki Halo']} size={38} />
            <p>{READY.avatarLine}</p>
          </div>

          <div className="p2-flow-foot p2-stagger-5">
            <P2Button variant="gradient" block onClick={() => go('vibe', 'forward')}>
              {READY.cta}
            </P2Button>
          </div>
        </div>
      );
    }

    return (
      <div className={classNames('p2-flow', 'p2-vibe-step', leaving && 'is-leaving')} data-dir={direction} key="vibe">
        <div className="p2-flow-head">
          <span className="p2-eyebrow p2-stagger-1">
            <i /> {VIBE.eyebrow}
          </span>
          <h1 className="p2-onboard-title p2-onboard-title--sm">
            <WordReveal text={VIBE.title} delay={70} stagger={44} />
          </h1>
          <p className="p2-onboard-body p2-stagger-3">{VIBE.body}</p>
        </div>

        <div className="p2-vibe-chips p2-stagger-4">
          <div className="p2-chip-cloud">
            {VIBE.genres.map((genre, i) => (
              <button
                type="button"
                key={genre}
                className={classNames('p2-chip', genres.includes(genre) && 'is-on')}
                aria-pressed={genres.includes(genre)}
                style={{
                  animationDelay: `${Math.min(i * 26, 420)}ms, ${(i * 431) % 4000}ms`,
                }}
                onClick={() => toggleGenre(genre)}
              >
                {genres.includes(genre) ? <CheckGlyph /> : null}
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="p2-vibe-count p2-stagger-4">
          <span>{genres.length ? `${genres.length} selected` : VIBE.none}</span>
          <span>Optional</span>
        </div>

        <div className="p2-flow-foot p2-stagger-5">
          <P2Button
            variant="gradient"
            block
            loading={saving}
            disabled={finishing}
            onClick={() => saveProfile('complete')}
          >
            {saving ? VIBE.saving : VIBE.cta}
          </P2Button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={classNames('p2-onboard', finishing && 'is-finishing')}
      data-atmosphere={deep ? 'deep' : 'warm'}
    >
      <OnboardingBackgroundLayer ref={bgRef} step={bgStep} motion={motion} />

      <div className="p2-onboard-inner">
        <header className="p2-onboard-top">
          <div className="p2-onboard-top-left">
            {step !== 'welcome' ? <P2Back onClick={back} /> : null}
            {step !== 'welcome' ? <P2Wordmark size={19} /> : null}
          </div>
          <div className="p2-onboard-top-right">
            {step === 'ready' ? (
              <P2Skip onClick={() => go('vibe', 'forward')}>{READY.skip}</P2Skip>
            ) : step === 'welcome' ? null : (
              <span className="p2-step-count" aria-label={`Step ${stepNumber} of ${STEP_TOTAL}`}>
                <RollingNumber value={stepNumber} />
                <span className="p2-step-sep" aria-hidden="true">/</span>
                <RollingNumber value={STEP_TOTAL} />
              </span>
            )}
          </div>
          {step === 'welcome' ? null : (
            <div
              className="p2-flow-progress"
              aria-hidden="true"
              style={{ '--p2-progress': `${progress}%` } as CSSProperties}
            >
              <i className="p2-flow-spark" />
            </div>
          )}
        </header>

        <div className="p2-onboard-stage">
          <div className="p2-flow-wrap">
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
