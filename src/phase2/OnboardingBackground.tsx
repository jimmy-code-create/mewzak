/**
 * OnboardingBackground — one persistent, full-screen atmosphere for every
 * onboarding step.
 *
 * WebGL fragment shader first, Canvas 2D fallback. The component wrapper mounts
 * the engine once; steps only call setStep()/pulse(), so the animation never
 * restarts between steps.
 *
 * Imperative API:
 *   init(container) · setStep(n) · pulse() · finish() · destroy()
 * Optional: setMotion(enabled)
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

/* ── Types ────────────────────────────────────────────────────────────────── */

type Vec2 = [number, number];
type Rgb = [number, number, number];

type PaletteConfig = {
  top: string;
  mid: string;
  bottom: string;
  corner: string;
  glow: string;
  orbCore: string;
  orbMid: string;
  orbEdge: string;
  rim: string;
  blobA: string;
  blobB: string;
  blobC: string;
  orb: Vec2;
  blobs: [Vec2, Vec2, Vec2];
  ringSpeed: number;
};

type Palette = {
  top: Rgb;
  mid: Rgb;
  bottom: Rgb;
  corner: Rgb;
  glow: Rgb;
  orbCore: Rgb;
  orbMid: Rgb;
  orbEdge: Rgb;
  rim: Rgb;
  blobA: Rgb;
  blobB: Rgb;
  blobC: Rgb;
  orb: Vec2;
  blobs: [Vec2, Vec2, Vec2];
  ringSpeed: number;
};

type FrameState = {
  time: number;
  intro: number;
  outro: number;
  outroEase: number;
  pulseAge: number;
  orb: Vec2;
  orbScale: number;
  ringSpeed: number;
  palette: Palette;
  blobs: [Vec2, Vec2, Vec2];
  grain: number;
  width: number;
  height: number;
  dpr: number;
};

export type OnboardingBackgroundApi = {
  setStep: (step: number) => void;
  pulse: () => void;
  finish: () => void;
  destroy: () => void;
};

/* ── Palette ──────────────────────────────────────────────────────────────── */

const WARM: Omit<PaletteConfig, 'orb' | 'blobs' | 'ringSpeed'> = {
  top: '#4B2BA8',
  mid: '#2B1159',
  bottom: '#120724',
  corner: '#0C0418',
  glow: '#9B5CFF',
  orbCore: '#FFD9F4',
  orbMid: '#B06BFF',
  orbEdge: '#3A1A78',
  rim: '#E2C7FF',
  blobA: '#9B5CFF',
  blobB: '#C95CFF',
  blobC: '#1B0B3A',
};

const DEEP: Omit<PaletteConfig, 'orb' | 'blobs' | 'ringSpeed'> = {
  top: '#1B0C33',
  mid: '#241046',
  bottom: '#0B0516',
  corner: '#080310',
  glow: '#8A4BD0',
  orbCore: '#F3D9FF',
  orbMid: '#8A4BD0',
  orbEdge: '#2A1150',
  rim: '#CBA6FF',
  blobA: '#6B2BD9',
  blobB: '#3C1C70',
  blobC: '#120724',
};

/**
 * Step order mirrors OnboardingFlow:
 * welcome · device · email · loading · birthday · name · ready · genres
 */
const STEP_PALETTES: PaletteConfig[] = [
  {
    ...WARM,
    orb: [0.8, 0.8],
    blobs: [[0.14, 0.7], [0.86, 0.34], [0.5, 0.06]],
    ringSpeed: 1,
  },
  {
    ...WARM,
    top: '#5530B8',
    mid: '#2E125E',
    orb: [0.74, 0.76],
    blobs: [[0.1, 0.64], [0.9, 0.3], [0.54, 0.1]],
    ringSpeed: 0.95,
  },
  {
    ...WARM,
    top: '#6336C8',
    orb: [0.84, 0.82],
    blobs: [[0.2, 0.74], [0.82, 0.4], [0.44, 0.05]],
    ringSpeed: 1.05,
  },
  {
    ...WARM,
    top: '#4E2A9E',
    orb: [0.72, 0.8],
    blobs: [[0.24, 0.6], [0.76, 0.34], [0.5, 0.12]],
    ringSpeed: 1.35,
  },
  {
    ...WARM,
    top: '#5630AE',
    mid: '#2A1057',
    orb: [0.78, 0.74],
    blobs: [[0.18, 0.7], [0.88, 0.44], [0.4, 0.1]],
    ringSpeed: 1,
  },
  {
    ...DEEP,
    orb: [0.86, 0.78],
    blobs: [[0.28, 0.7], [0.72, 0.3], [0.5, 0.05]],
    ringSpeed: 0.72,
  },
  {
    ...DEEP,
    top: '#221040',
    mid: '#251247',
    orb: [0.7, 0.74],
    blobs: [[0.2, 0.6], [0.8, 0.5], [0.55, 0.15]],
    ringSpeed: 0.68,
  },
  {
    ...DEEP,
    top: '#2A1248',
    mid: '#2A1647',
    orb: [0.8, 0.8],
    blobs: [[0.25, 0.75], [0.75, 0.35], [0.5, 0.1]],
    ringSpeed: 0.78,
  },
];

const OUTRO_COLORS: Palette = {
  top: hexToRgb('#1B0C33'),
  mid: hexToRgb('#241046'),
  bottom: hexToRgb('#0C0418'),
  corner: hexToRgb('#080310'),
  glow: hexToRgb('#5B2A9E'),
  orbCore: hexToRgb('#F7DCFF'),
  orbMid: hexToRgb('#6B3BB0'),
  orbEdge: hexToRgb('#221040'),
  rim: hexToRgb('#D7B8FF'),
  blobA: hexToRgb('#5B2A9E'),
  blobB: hexToRgb('#2E1550'),
  blobC: hexToRgb('#0E051C'),
  orb: [0.5, 0.55],
  blobs: [[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]],
  ringSpeed: 3.4,
};

const MORPH_MS = 800;
const INTRO_MS = 1800;
const FINISH_MS = 1300;
const MAX_DPR = 1.5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;
  const numeric = Number.parseInt(full, 16);
  return [
    ((numeric >> 16) & 255) / 255,
    ((numeric >> 8) & 255) / 255,
    (numeric & 255) / 255,
  ];
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function lerpVec2(a: Vec2, b: Vec2, t: number): Vec2 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

function resolvePalette(config: PaletteConfig): Palette {
  return {
    top: hexToRgb(config.top),
    mid: hexToRgb(config.mid),
    bottom: hexToRgb(config.bottom),
    corner: hexToRgb(config.corner),
    glow: hexToRgb(config.glow),
    orbCore: hexToRgb(config.orbCore),
    orbMid: hexToRgb(config.orbMid),
    orbEdge: hexToRgb(config.orbEdge),
    rim: hexToRgb(config.rim),
    blobA: hexToRgb(config.blobA),
    blobB: hexToRgb(config.blobB),
    blobC: hexToRgb(config.blobC),
    orb: config.orb,
    blobs: config.blobs,
    ringSpeed: config.ringSpeed,
  };
}

function lerpPalette(a: Palette, b: Palette, t: number): Palette {
  return {
    top: lerpRgb(a.top, b.top, t),
    mid: lerpRgb(a.mid, b.mid, t),
    bottom: lerpRgb(a.bottom, b.bottom, t),
    corner: lerpRgb(a.corner, b.corner, t),
    glow: lerpRgb(a.glow, b.glow, t),
    orbCore: lerpRgb(a.orbCore, b.orbCore, t),
    orbMid: lerpRgb(a.orbMid, b.orbMid, t),
    orbEdge: lerpRgb(a.orbEdge, b.orbEdge, t),
    rim: lerpRgb(a.rim, b.rim, t),
    blobA: lerpRgb(a.blobA, b.blobA, t),
    blobB: lerpRgb(a.blobB, b.blobB, t),
    blobC: lerpRgb(a.blobC, b.blobC, t),
    orb: lerpVec2(a.orb, b.orb, t),
    blobs: [
      lerpVec2(a.blobs[0], b.blobs[0], t),
      lerpVec2(a.blobs[1], b.blobs[1], t),
      lerpVec2(a.blobs[2], b.blobs[2], t),
    ],
    ringSpeed: lerp(a.ringSpeed, b.ringSpeed, t),
  };
}

function cssRgb(color: Rgb, alpha = 1) {
  return `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${alpha})`;
}

/* ── Shader ───────────────────────────────────────────────────────────────── */

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uIntro;
uniform float uOutro;
uniform float uPulseAge;
uniform vec2 uOrb;
uniform float uOrbScale;
uniform float uRingSpeed;
uniform float uGrain;
uniform vec3 uTop;
uniform vec3 uMid;
uniform vec3 uBottom;
uniform vec3 uCorner;
uniform vec3 uGlow;
uniform vec3 uOrbCore;
uniform vec3 uOrbMid;
uniform vec3 uOrbEdge;
uniform vec3 uRim;
uniform vec3 uBlobA;
uniform vec3 uBlobB;
uniform vec3 uBlobC;
uniform vec2 uBlobPosA;
uniform vec2 uBlobPosB;
uniform vec2 uBlobPosC;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(11.7, 5.3);
    amplitude *= 0.5;
  }
  return value;
}

vec3 softLight(vec3 base, vec3 blend) {
  vec3 low = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
  vec3 high = sqrt(max(base, vec3(0.0))) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
  return mix(low, high, step(vec3(0.5), blend));
}

float blobField(vec2 p, vec2 center, float radius) {
  vec2 delta = p - center;
  return exp(-dot(delta, delta) / (radius * radius));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 orb = vec2(uOrb.x * aspect, uOrb.y);
  vec2 op = p - orb;
  float orbR = 0.235 * min(uRes.x, uRes.y) / uRes.y * uOrbScale;

  /* Base: dark burnt orange at the top, rust through the middle, near-black
     maroon at the bottom. The noise keeps the field from ever looking flat. */
  float topness = 1.0 - uv.y;
  vec3 col = mix(uBottom, uMid, smoothstep(0.02, 0.66, topness));
  col = mix(col, uTop, smoothstep(0.52, 1.0, topness));
  float field = fbm(vec2(uv.x * 2.8 + uTime * 0.005, uv.y * 3.4 - uTime * 0.004));
  col *= 0.88 + 0.22 * field;

  vec2 glowCenter = vec2(0.78 * aspect, 0.92);
  col += uGlow * exp(-length(p - glowCenter) * 2.4) * 0.14;

  /* Molten blobs. */
  float bA = blobField(p, vec2(uBlobPosA.x * aspect, uBlobPosA.y), 0.30);
  float bB = blobField(p, vec2(uBlobPosB.x * aspect, uBlobPosB.y), 0.26);
  float bC = blobField(p, vec2(uBlobPosC.x * aspect, uBlobPosC.y), 0.34);
  col = mix(col, uBlobA, bA * 0.24);
  col = mix(col, uBlobB, bB * 0.18);
  col = mix(col, uBlobC, bC * 0.30);
  col += uBlobA * bA * 0.035;

  /* Ripples: slow vinyl grooves plus three rings that expand from the orb.
     A new ring leaves the orb every four seconds. */
  float r = length(op);
  float angle = atan(op.y, op.x);
  float warp = (fbm(vec2(angle * 1.8 + 4.0, r * 6.5 - uTime * 0.025)) - 0.5) * 0.075;
  warp += 0.012 * sin(angle * 5.0 + uTime * 0.16);
  float rr = r + warp;
  float ringMask = smoothstep(0.0, 0.05, r) * (1.0 - smoothstep(0.75, 1.35, r));
  float band = 0.0;
  for (int i = 0; i < 7; i++) {
    float base = 0.10 + float(i) * 0.14;
    float wobble = warp * (0.6 + float(i) * 0.12) + 0.01 * sin(angle * float(i + 3) + uTime * 0.1);
    float bandWidth = 0.012 + float(i) * 0.003;
    float delta = (rr - (base + wobble)) / bandWidth;
    band += exp(-delta * delta) * (0.55 + 0.45 * sin(float(i) * 1.7 + uTime * 0.22 * uRingSpeed));
  }
  vec3 rippleTint = mix(vec3(1.0, 0.86, 0.72), uRim, 0.28);
  col += rippleTint * band * 0.016 * ringMask;
  col -= uBottom * band * 0.006 * ringMask;

  float ringSum = 0.0;
  for (int i = 0; i < 3; i++) {
    float phase = fract(uTime * uRingSpeed / 12.0 + float(i) / 3.0);
    float radius = phase * 1.35;
    float width = 0.012 + phase * 0.035;
    float delta = (rr - radius) / width;
    float ring = exp(-delta * delta);
    ring *= (1.0 - phase) * smoothstep(0.0, 0.06, phase);
    ringSum += ring;
  }
  col += rippleTint * ringSum * 0.05;
  col -= uBottom * ringSum * 0.018;

  if (uPulseAge >= 0.0) {
    float pulseRadius = uPulseAge * 0.55;
    float pulseWidth = 0.014 + uPulseAge * 0.01;
    float delta = (rr - pulseRadius) / pulseWidth;
    float pulse = exp(-delta * delta) * exp(-uPulseAge * 1.25);
    col += rippleTint * pulse * 0.18;
  }

  /* The orb: a molten sphere, not a matte ball. */
  float rrO = length(op) / max(orbR, 0.0001);
  float inside = 1.0 - smoothstep(0.965, 1.015, rrO);
  float molten = fbm(op * 13.0 + vec2(uTime * 0.05, -uTime * 0.035));
  vec3 surf = mix(uOrbEdge, uOrbMid, 1.0 - smoothstep(0.28, 1.0, rrO));
  surf = mix(surf, uOrbCore, pow(max(0.0, 1.0 - rrO), 2.4) * 0.88);
  surf *= 0.86 + 0.28 * molten;

  vec2 lightDir = normalize(vec2(-0.48, 0.72));
  float ndl = clamp(dot(normalize(op + vec2(0.0001)), lightDir), -1.0, 1.0);
  surf *= 0.72 + 0.42 * max(ndl, 0.0);

  vec2 highlightOffset = vec2(-0.22, 0.26) * orbR;
  float highlight = exp(-pow(length(op - highlightOffset) / (0.20 * orbR), 2.0));
  surf += uOrbCore * highlight * 0.5;
  float coreGlow = exp(-pow(length(op) / (0.58 * orbR), 2.0));
  surf += uOrbCore * coreGlow * 0.22;

  col = mix(col, surf, inside);
  float rim = smoothstep(0.82, 0.97, rrO) * (1.0 - smoothstep(0.97, 1.04, rrO));
  col += uRim * rim * 0.20;
  col += uOrbMid * exp(-max(rrO - 0.85, 0.0) * 2.6) * 0.08;
  col += uGlow * exp(-length(op) * 3.4) * 0.08;

  /* Vignette: corners fall to #0C0418 and the edges stay quiet. */
  float vignetteDistance = length((uv - vec2(0.5)) * vec2(aspect * 0.82, 1.0));
  float vignette = smoothstep(0.24, 1.02, vignetteDistance);
  col = mix(col, uCorner, vignette * 0.92);
  col *= 1.0 - 0.16 * smoothstep(0.5, 1.0, vignetteDistance);

  /* Intro: near-black, an amber point blooms at the orb, then the warm field
     floods outward. Grain is applied last, after the flood. */
  float introDistance = length((uv - vec2(uOrb.x, uOrb.y)) * vec2(aspect, 1.0));
  float reveal = smoothstep(0.0, 1.0, uIntro * 1.45 - introDistance * 0.22);
  vec3 night = vec3(0.010, 0.002, 0.005);
  col = mix(night, col, reveal);
  float point = exp(-introDistance * introDistance * 1400.0) * (1.0 - smoothstep(0.0, 0.30, uIntro));
  col += uOrbCore * point * 0.7;
  col += uGlow * exp(-introDistance * 26.0) * (1.0 - smoothstep(0.0, 0.5, uIntro)) * 0.12;

  /* Outro: the room darkens toward maroon before the layer fades away. */
  col = mix(col, vec3(0.13, 0.025, 0.035), uOutro * 0.72);

  /* Animated film grain: soft-light, 8–10%. */
  float grain = hash21(gl_FragCoord.xy + floor(uTime * 24.0) * vec2(37.0, 17.0)) - 0.5;
  vec3 soft = softLight(clamp(col, 0.0, 1.0), vec3(grain + 0.5));
  col = mix(col, soft, 0.10 * uGrain);
  col += (hash21(gl_FragCoord.xy * 1.37 + 7.0) - 0.5) * 0.004;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

const UNIFORM_NAMES = [
  'uRes',
  'uTime',
  'uIntro',
  'uOutro',
  'uPulseAge',
  'uOrb',
  'uOrbScale',
  'uRingSpeed',
  'uGrain',
  'uTop',
  'uMid',
  'uBottom',
  'uCorner',
  'uGlow',
  'uOrbCore',
  'uOrbMid',
  'uOrbEdge',
  'uRim',
  'uBlobA',
  'uBlobB',
  'uBlobC',
  'uBlobPosA',
  'uBlobPosB',
  'uBlobPosC',
] as const;

/* ── Engine ───────────────────────────────────────────────────────────────── */

export class OnboardingBackground {
  private host: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private uniforms: Partial<Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>> = {};
  private ctx2d: CanvasRenderingContext2D | null = null;
  private grainPattern: CanvasPattern | null = null;
  private grainCanvas: HTMLCanvasElement | null = null;

  private raf = 0;
  private destroyed = false;
  private motionEnabled = true;
  private appMotion = true;
  private reducedMotion = false;
  private hidden = false;
  private clockOffset = 0;
  private hiddenAt = 0;
  private lastFrame = 0;
  private introStart = 0;
  private introPulseAt = 0;
  private introPulseDone = false;
  private pulseStart = -100000;
  private stepIndex = 0;
  private stepFrom: Palette = resolvePalette(STEP_PALETTES[0]);
  private stepTo: Palette = resolvePalette(STEP_PALETTES[0]);
  private livePalette: Palette = resolvePalette(STEP_PALETTES[0]);
  private stepStart = 0;
  private finishing = false;
  private finishStart = 0;
  private finishTimer = 0;
  private parallax: Vec2 = [0, 0];
  private targetParallax: Vec2 = [0, 0];
  private resizeObserver: ResizeObserver | null = null;
  private cssWidth = 1;
  private cssHeight = 1;
  private dpr = 1;

  init(container: HTMLElement) {
    if (this.destroyed) return;
    this.host = container;
    this.introStart = this.now();
    this.introPulseAt = this.introStart + 450;
    this.stepStart = this.introStart - MORPH_MS;
    this.stepIndex = 0;
    this.stepFrom = resolvePalette(STEP_PALETTES[0]);
    this.stepTo = this.stepFrom;
    this.livePalette = this.stepFrom;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = media.matches;
    this.motionEnabled = !this.reducedMotion;

    this.mountCanvas();
    this.resize();
    this.attach();

    if (this.motionEnabled) this.startLoop();
    else this.renderStatic();
  }

  setStep(step: number) {
    if (this.destroyed || this.finishing) return;
    const next = clamp(Math.round(step), 0, STEP_PALETTES.length - 1);
    if (next === this.stepIndex) return;

    this.stepIndex = next;
    this.stepFrom = this.livePalette;
    this.stepTo = resolvePalette(STEP_PALETTES[next]);
    this.stepStart = this.now();

    if (!this.motionEnabled) {
      this.stepFrom = this.stepTo;
      this.livePalette = this.stepTo;
      this.renderStatic();
    } else if (!this.raf) {
      this.startLoop();
    }
  }

  pulse() {
    if (this.destroyed || !this.motionEnabled || this.finishing) return;
    this.pulseStart = this.now();
    if (!this.raf) this.startLoop();
  }

  setMotion(enabled: boolean) {
    if (this.destroyed) return;
    this.appMotion = enabled;
    const next = enabled && !this.reducedMotion;
    if (next === this.motionEnabled) return;
    this.motionEnabled = next;
    if (next) {
      this.startLoop();
    } else {
      this.stopLoop();
      this.stepFrom = this.stepTo;
      this.livePalette = this.stepTo;
      this.renderStatic();
    }
  }

  finish() {
    if (this.destroyed || this.finishing) return;
    this.finishing = true;
    this.finishStart = this.now();
    this.pulseStart = -100000;

    if (!this.motionEnabled) {
      this.renderStatic();
      this.finishTimer = window.setTimeout(() => this.destroy(), 60);
      return;
    }
    if (!this.raf) this.startLoop();
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopLoop();
    if (this.finishTimer) window.clearTimeout(this.finishTimer);
    this.detach();

    if (this.gl) {
      const lose = this.gl.getExtension('WEBGL_lose_context');
      lose?.loseContext?.();
    }
    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.ctx2d = null;
    this.grainPattern = null;
    this.grainCanvas = null;

    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    this.host = null;
  }

  /* ── Mount / GL / 2D ────────────────────────────────────────────────────── */

  private mountCanvas() {
    if (!this.host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'p2-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    this.host.appendChild(canvas);
    this.canvas = canvas;

    if (!this.initGL(canvas)) {
      canvas.remove();
      const fallback = document.createElement('canvas');
      fallback.className = 'p2-bg-canvas';
      fallback.setAttribute('aria-hidden', 'true');
      this.host.appendChild(fallback);
      this.canvas = fallback;
      this.init2D(fallback);
    }
  }

  private initGL(canvas: HTMLCanvasElement) {
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        powerPreference: 'low-power',
      }) as WebGLRenderingContext | null;
    } catch {
      gl = null;
    }
    if (!gl) return false;

    const vertex = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return false;

    const program = gl.createProgram();
    if (!program) return false;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return false;
    }

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.clearColor(0.04, 0.01, 0.02, 1);

    const uniforms: OnboardingBackground['uniforms'] = {};
    for (const name of UNIFORM_NAMES) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    this.gl = gl;
    this.program = program;
    this.buffer = buffer;
    this.uniforms = uniforms;

    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    return true;
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private init2D(canvas: HTMLCanvasElement) {
    try {
      this.ctx2d = canvas.getContext('2d', { alpha: false });
    } catch {
      this.ctx2d = null;
    }
  }

  private onContextLost = (event: Event) => {
    event.preventDefault();
    if (this.destroyed) return;
    this.stopLoop();
    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
      this.canvas.remove();
      this.canvas = null;
    }
    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.mountCanvas();
    this.resize();
    if (this.motionEnabled) this.startLoop();
    else this.renderStatic();
  };

  /* ── Events / lifecycle ─────────────────────────────────────────────────── */

  private attach() {
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('deviceorientation', this.onOrientation);
    document.addEventListener('visibilitychange', this.onVisibility);
    window.addEventListener('resize', this.resize);

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', this.onReducedMotionChange);

    if (typeof ResizeObserver !== 'undefined' && this.host) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host);
    }
  }

  private detach() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('deviceorientation', this.onOrientation);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('resize', this.resize);
    window.matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change', this.onReducedMotionChange);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    if (this.canvas) {
      this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    }
  }

  private onPointerMove = (event: PointerEvent) => {
    const nx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
    const ny = event.clientY / Math.max(1, window.innerHeight) - 0.5;
    this.targetParallax = [clamp(nx * 0.032, -0.02, 0.02), clamp(ny * 0.024, -0.016, 0.016)];
  };

  private onOrientation = (event: DeviceOrientationEvent) => {
    const x = clamp((event.gamma ?? 0) * 0.00055, -0.02, 0.02);
    const y = clamp(((event.beta ?? 45) - 45) * 0.00045, -0.016, 0.016);
    this.targetParallax = [x, y];
  };

  private onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      if (!this.hidden) {
        this.hidden = true;
        this.hiddenAt = performance.now();
        this.stopLoop();
      }
      return;
    }
    if (this.hidden) {
      this.hidden = false;
      this.clockOffset += performance.now() - this.hiddenAt;
      if (this.motionEnabled) this.startLoop();
      else this.renderStatic();
    }
  };

  private onReducedMotionChange = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches;
    this.motionEnabled = this.appMotion && !event.matches;
    if (this.motionEnabled) this.startLoop();
    else {
      this.stopLoop();
      this.stepFrom = this.stepTo;
      this.livePalette = this.stepTo;
      this.renderStatic();
    }
  };

  private resize = () => {
    if (!this.host || !this.canvas || this.destroyed) return;
    const rect = this.host.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || this.host.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || this.host.clientHeight || 1));
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    if (width === this.cssWidth && height === this.cssHeight && dpr === this.dpr && this.canvas.width) {
      return;
    }
    this.cssWidth = width;
    this.cssHeight = height;
    this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    if (this.ctx2d) {
      this.ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.grainPattern = null;
    }
    if (!this.motionEnabled) this.renderStatic();
  };

  private now() {
    return performance.now() - this.clockOffset;
  }

  private startLoop() {
    if (this.raf || this.destroyed || this.hidden) return;
    if (!this.motionEnabled) {
      this.renderStatic();
      return;
    }
    this.lastFrame = 0;
    this.raf = requestAnimationFrame(this.loop);
  }

  private stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private loop = () => {
    if (this.destroyed || this.hidden || !this.motionEnabled) {
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.loop);
    const now = this.now();
    if (now - this.lastFrame < 1000 / 62) return;
    this.lastFrame = now;
    this.renderFrame(now, false);
  };

  /* ── Frame ──────────────────────────────────────────────────────────────── */

  private renderStatic() {
    this.stopLoop();
    this.stepFrom = this.stepTo;
    this.livePalette = this.stepTo;
    this.renderFrame(this.now(), true);
  }

  private renderFrame(now: number, staticMode: boolean) {
    if (!this.canvas || this.destroyed) return;

    if (!staticMode && !this.introPulseDone && now >= this.introPulseAt) {
      this.introPulseDone = true;
      this.pulseStart = this.introPulseAt;
    }

    const time = staticMode ? 0 : now / 1000;
    const intro = staticMode ? 1 : clamp((now - this.introStart) / INTRO_MS, 0, 1);
    const outro = this.finishing ? clamp((now - this.finishStart) / FINISH_MS, 0, 1) : 0;
    const outroEase = easeInOutCubic(outro);

    const morph = staticMode ? 1 : easeInOutCubic(clamp((now - this.stepStart) / MORPH_MS, 0, 1));
    let palette = staticMode ? this.stepTo : lerpPalette(this.stepFrom, this.stepTo, morph);
    if (outro > 0) {
      palette = lerpPalette(
        palette,
        { ...OUTRO_COLORS, orb: palette.orb, blobs: palette.blobs },
        outroEase,
      );
    }
    this.livePalette = palette;

    const target = this.targetParallax;
    this.parallax = [
      lerp(this.parallax[0], target[0], 0.055),
      lerp(this.parallax[1], target[1], 0.055),
    ];

    const orb: Vec2 = [palette.orb[0] + this.parallax[0], palette.orb[1] + this.parallax[1]];
    const orbScale = staticMode ? 1.015 : 1 + 0.015 + 0.015 * Math.sin(time * 1.15);

    const blobs = palette.blobs.map((blob, index) => {
      const phase = index * 2.1 + 0.7;
      const driftX = Math.sin(time * ((Math.PI * 2) / 22) + phase) * 0.045;
      const driftY = Math.cos(time * ((Math.PI * 2) / 27) + phase * 1.3) * 0.035;
      let x = blob[0] + driftX + this.parallax[0] * 0.3;
      let y = blob[1] + driftY + this.parallax[1] * 0.3;
      if (outro > 0) {
        x = lerp(x, 0.5, outroEase * 0.85);
        y = lerp(y, 0.42, outroEase * 0.85);
      }
      return [x, y] as Vec2;
    }) as [Vec2, Vec2, Vec2];

    let pulseAge = -1;
    if (!staticMode && !this.finishing) {
      const age = (now - this.pulseStart) / 1000;
      if (age >= 0 && age < 4.5) pulseAge = age;
    }

    const state: FrameState = {
      time,
      intro,
      outro,
      outroEase,
      pulseAge,
      orb,
      orbScale,
      ringSpeed: palette.ringSpeed * (1 + outroEase * 4.2),
      palette,
      blobs,
      grain: staticMode ? 0.8 : smoothstep(0.72, 1, intro),
      width: this.cssWidth,
      height: this.cssHeight,
      dpr: this.dpr,
    };

    if (this.gl) this.renderGL(state);
    else if (this.ctx2d) this.render2D(state);

    if (this.finishing) {
      const fade = smoothstep(0.45, 1, outro);
      if (this.canvas) this.canvas.style.opacity = String(1 - fade);
      if (outro >= 1) this.destroy();
    }
  }

  private renderGL(state: FrameState) {
    const gl = this.gl;
    const program = this.program;
    if (!gl || !program || !this.canvas || gl.isContextLost()) return;

    const { palette } = state;
    const u = this.uniforms;

    gl.useProgram(program);
    gl.uniform2f(u.uRes ?? null, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uTime ?? null, state.time);
    gl.uniform1f(u.uIntro ?? null, state.intro);
    gl.uniform1f(u.uOutro ?? null, state.outro);
    gl.uniform1f(u.uPulseAge ?? null, state.pulseAge);
    gl.uniform2f(u.uOrb ?? null, state.orb[0], state.orb[1]);
    gl.uniform1f(u.uOrbScale ?? null, state.orbScale);
    gl.uniform1f(u.uRingSpeed ?? null, state.ringSpeed);
    gl.uniform1f(u.uGrain ?? null, state.grain);
    gl.uniform3f(u.uTop ?? null, palette.top[0], palette.top[1], palette.top[2]);
    gl.uniform3f(u.uMid ?? null, palette.mid[0], palette.mid[1], palette.mid[2]);
    gl.uniform3f(u.uBottom ?? null, palette.bottom[0], palette.bottom[1], palette.bottom[2]);
    gl.uniform3f(u.uCorner ?? null, palette.corner[0], palette.corner[1], palette.corner[2]);
    gl.uniform3f(u.uGlow ?? null, palette.glow[0], palette.glow[1], palette.glow[2]);
    gl.uniform3f(u.uOrbCore ?? null, palette.orbCore[0], palette.orbCore[1], palette.orbCore[2]);
    gl.uniform3f(u.uOrbMid ?? null, palette.orbMid[0], palette.orbMid[1], palette.orbMid[2]);
    gl.uniform3f(u.uOrbEdge ?? null, palette.orbEdge[0], palette.orbEdge[1], palette.orbEdge[2]);
    gl.uniform3f(u.uRim ?? null, palette.rim[0], palette.rim[1], palette.rim[2]);
    gl.uniform3f(u.uBlobA ?? null, palette.blobA[0], palette.blobA[1], palette.blobA[2]);
    gl.uniform3f(u.uBlobB ?? null, palette.blobB[0], palette.blobB[1], palette.blobB[2]);
    gl.uniform3f(u.uBlobC ?? null, palette.blobC[0], palette.blobC[1], palette.blobC[2]);
    gl.uniform2f(u.uBlobPosA ?? null, state.blobs[0][0], state.blobs[0][1]);
    gl.uniform2f(u.uBlobPosB ?? null, state.blobs[1][0], state.blobs[1][1]);
    gl.uniform2f(u.uBlobPosC ?? null, state.blobs[2][0], state.blobs[2][1]);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private render2D(state: FrameState) {
    const ctx = this.ctx2d;
    if (!ctx) return;
    const { width, height, palette } = state;
    const min = Math.min(width, height);
    const max = Math.max(width, height);
    const orbX = state.orb[0] * width;
    const orbY = (1 - state.orb[1]) * height;
    const orbR = 0.235 * min * state.orbScale;

    ctx.save();
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    const base = ctx.createLinearGradient(0, 0, 0, height);
    base.addColorStop(0, cssRgb(palette.top));
    base.addColorStop(0.52, cssRgb(palette.mid));
    base.addColorStop(1, cssRgb(palette.bottom));
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const topGlow = ctx.createRadialGradient(width * 0.78, height * 0.08, 0, width * 0.78, height * 0.08, max * 0.7);
    topGlow.addColorStop(0, cssRgb(palette.glow, 0.22));
    topGlow.addColorStop(1, cssRgb(palette.glow, 0));
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    const blobColors = [palette.blobA, palette.blobB, palette.blobC];
    const blobAlphas = [0.25, 0.18, 0.3];
    state.blobs.forEach((blob, index) => {
      const x = blob[0] * width;
      const y = (1 - blob[1]) * height;
      const radius = min * (index === 2 ? 0.46 : 0.38);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, cssRgb(blobColors[index], blobAlphas[index]));
      gradient.addColorStop(1, cssRgb(blobColors[index], 0));
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    const maxRing = Math.hypot(width, height) * 1.15;
    const rippleTint: Rgb = [
      lerp(1, palette.rim[0], 0.28),
      lerp(0.86, palette.rim[1], 0.28),
      lerp(0.72, palette.rim[2], 0.28),
    ];

    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      const radius = min * (0.16 + i * 0.11);
      ctx.strokeStyle =
        i % 2 === 0 ? cssRgb(rippleTint, 0.024) : cssRgb(palette.bottom, 0.05);
      drawWobblyCircle(ctx, orbX, orbY, radius, 2 + i * 0.35, state.time * 0.15 + i, 56);
      ctx.stroke();
    }

    for (let i = 0; i < 3; i += 1) {
      const phase = (state.time * state.ringSpeed / 12 + i / 3) % 1;
      const radius = phase * maxRing;
      const alpha = (1 - phase) * 0.1;
      ctx.strokeStyle = cssRgb(rippleTint, alpha);
      ctx.lineWidth = 1.2 + phase * 2;
      drawWobblyCircle(ctx, orbX, orbY, radius, 6 + phase * 16, state.time * 0.22 + i * 2, 72);
      ctx.stroke();
    }
    ctx.lineWidth = 1;

    if (state.pulseAge >= 0) {
      const radius = state.pulseAge * 0.55 * max;
      const alpha = Math.exp(-state.pulseAge * 1.25) * 0.2;
      ctx.strokeStyle = cssRgb(rippleTint, alpha);
      ctx.lineWidth = 1.5;
      drawWobblyCircle(ctx, orbX, orbY, radius, 10, state.time, 72);
      ctx.stroke();
      ctx.lineWidth = 1;
    }

    const halo = ctx.createRadialGradient(orbX, orbY, orbR * 0.45, orbX, orbY, orbR * 2.7);
    halo.addColorStop(0, cssRgb(palette.orbMid, 0.2));
    halo.addColorStop(0.55, cssRgb(palette.orbMid, 0.07));
    halo.addColorStop(1, cssRgb(palette.orbMid, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR * 2.7, 0, Math.PI * 2);
    ctx.fill();

    const body = ctx.createRadialGradient(
      orbX - orbR * 0.28,
      orbY - orbR * 0.3,
      orbR * 0.04,
      orbX,
      orbY,
      orbR,
    );
    body.addColorStop(0, cssRgb(palette.orbCore));
    body.addColorStop(0.28, cssRgb(palette.orbMid));
    body.addColorStop(0.82, cssRgb(palette.orbEdge));
    body.addColorStop(1, cssRgb(palette.orbEdge));
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();

    const highlight = ctx.createRadialGradient(
      orbX - orbR * 0.24,
      orbY - orbR * 0.28,
      0,
      orbX - orbR * 0.24,
      orbY - orbR * 0.28,
      orbR * 0.52,
    );
    highlight.addColorStop(0, 'rgba(255, 246, 236, 0.34)');
    highlight.addColorStop(1, 'rgba(255, 246, 236, 0)');
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = cssRgb(palette.rim, 0.34);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR * 0.985, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;

    const vignette = ctx.createRadialGradient(
      width * 0.5,
      height * 0.45,
      min * 0.18,
      width * 0.5,
      height * 0.45,
      Math.hypot(width, height) * 0.72,
    );
    vignette.addColorStop(0, cssRgb(palette.corner, 0));
    vignette.addColorStop(0.62, cssRgb(palette.corner, 0.28));
    vignette.addColorStop(1, cssRgb(palette.corner, 0.92));
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    if (state.intro < 1) {
      const reveal = easeInOutCubic(state.intro);
      const reach = Math.hypot(width, height) * 1.2;
      if (reveal <= 0.001) {
        ctx.fillStyle = 'rgba(2, 1, 3, 0.99)';
        ctx.fillRect(0, 0, width, height);
      } else {
        const radius = Math.max(1, reveal * reach);
        const hole = ctx.createRadialGradient(orbX, orbY, radius * 0.45, orbX, orbY, radius);
        hole.addColorStop(0, 'rgba(2, 1, 3, 0)');
        hole.addColorStop(0.7, 'rgba(2, 1, 3, 0.3)');
        hole.addColorStop(1, 'rgba(2, 1, 3, 0.98)');
        ctx.fillStyle = hole;
        ctx.fillRect(0, 0, width, height);
      }
      const point = (1 - smoothstep(0, 0.3, state.intro)) * 0.7;
      if (point > 0) {
        const amber = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 0.7);
        amber.addColorStop(0, cssRgb(palette.orbCore, point));
        amber.addColorStop(1, cssRgb(palette.orbCore, 0));
        ctx.fillStyle = amber;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbR * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (state.outro > 0) {
      ctx.fillStyle = `rgba(28, 6, 10, ${state.outroEase * 0.72})`;
      ctx.fillRect(0, 0, width, height);
    }

    if (state.grain > 0.01) {
      this.ensureGrain(ctx);
      if (this.grainPattern) {
        const frame = Math.floor(state.time * 24);
        const offsetX = (frame * 37) % 160;
        const offsetY = (frame * 61) % 160;
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = 0.1 * state.grain;
        ctx.translate(-offsetX, -offsetY);
        ctx.fillStyle = this.grainPattern;
        ctx.fillRect(offsetX, offsetY, width + 160, height + 160);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  private ensureGrain(ctx: CanvasRenderingContext2D) {
    if (!this.grainCanvas) {
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const grain = canvas.getContext('2d');
      if (!grain) return;
      const image = grain.createImageData(size, size);
      for (let i = 0; i < image.data.length; i += 4) {
        const value = Math.floor(Math.random() * 255);
        image.data[i] = value;
        image.data[i + 1] = value;
        image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
      grain.putImageData(image, 0, 0);
      this.grainCanvas = canvas;
      this.grainPattern = ctx.createPattern(canvas, 'repeat');
    } else if (!this.grainPattern) {
      this.grainPattern = ctx.createPattern(this.grainCanvas, 'repeat');
    }
  }
}

function drawWobblyCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  wobble: number,
  phase: number,
  segments: number,
) {
  if (!Number.isFinite(radius) || radius <= 0) return;
  ctx.beginPath();
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const r =
      radius +
      Math.sin(angle * 5 + phase) * wobble +
      Math.sin(angle * 3 - phase * 0.7) * wobble * 0.45;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/* ── React wrapper ────────────────────────────────────────────────────────── */

type LayerProps = {
  step: number;
  motion?: boolean;
  className?: string;
};

export const OnboardingBackgroundLayer = forwardRef<OnboardingBackgroundApi, LayerProps>(
  function OnboardingBackgroundLayer({ step, motion = true, className }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<OnboardingBackground | null>(null);

    useEffect(() => {
      const host = hostRef.current;
      if (!host) return;
      const engine = new OnboardingBackground();
      engine.init(host);
      engineRef.current = engine;
      return () => {
        engine.destroy();
        engineRef.current = null;
      };
    }, []);

    useEffect(() => {
      engineRef.current?.setStep(step);
    }, [step]);

    useEffect(() => {
      engineRef.current?.setMotion(motion);
    }, [motion]);

    useImperativeHandle(
      ref,
      () => ({
        setStep: (next: number) => engineRef.current?.setStep(next),
        pulse: () => engineRef.current?.pulse(),
        finish: () => engineRef.current?.finish(),
        destroy: () => engineRef.current?.destroy(),
      }),
      [],
    );

    return (
      <div
        ref={hostRef}
        className={className ? `p2-bg-shader ${className}` : 'p2-bg-shader'}
        aria-hidden="true"
      />
    );
  },
);
