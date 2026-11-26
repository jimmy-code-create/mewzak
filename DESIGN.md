# MEWZAK — Phase 1 design & phase 2 handoff

> **Music with soft paws.**
> A calmer, cuter, more premium music app for Android, iOS, macOS and Windows.

- **Status:** Phase 1 complete — design prototype, brand kit, tokens, component library, copy sheet.
- **Prototype:** Vite + React + TypeScript, fake catalogue, no backend, no audio.
- **Not in scope yet:** real playback, authentication, payments, catalogue licensing, analytics, notifications, downloads, sync.
- **Read this first:** [`tokens/tokens.json`](tokens/tokens.json) is the machine-readable contract. This document explains the thinking and the phase-2 plan.

---

## 1. The idea

Mewzak is **mew + muzak** — a cat joke about elevator music. The interface answers to the joke, not the other way around.

- **Music first.** Artwork, playback and the queue get the space. Secondary content appears only when asked for. No promotional shelves, no autoplay carousels shouting for attention.
- **Premium, not loud.** Near-black surfaces, generous negative space, one warm gradient, one editorial display face. Apple Music’s clarity; not Spotify’s density.
- **Cute in the details.** The cat appears on onboarding, empty states and long loading. The pause button has a toe-bean easter egg. Copy is dry and warm. The core controls remain literal and familiar.
- **Predictable playback.** The transport occupies the same edge and the same order on every screen. The Now Playing surface is never more than one tap away.

The benchmark is a four-platform product, so every choice here has to survive translation to native shells and different window sizes.

---

## 2. What exists in this repo

```
mewzak-design/
├── DESIGN.md                  ← this handoff
├── tokens/tokens.json         ← platform-neutral tokens (source of truth)
├── public/
│   └── mewzak-icon.svg        ← favicon / static icon
├── src/
│   ├── App.tsx                ← design-studio shell + device stages
│   ├── store.tsx              ← shared prototype state (playback, routes, likes, toasts)
│   ├── data.ts                ← fictional catalogue + artwork palettes
│   ├── microcopy.ts           ← the full copy sheet
│   ├── components/
│   │   ├── Brand.tsx          ← CatMark, Wordmark, Logo, AppIcon, Mascot
│   │   └── ui.tsx             ← component library (18 components)
│   ├── phone/PhoneApp.tsx     ← 12 phone screens + iOS/Android chrome
│   ├── desktop/DesktopApp.tsx ← 9 desktop pages + sidebar/panel/transport
│   ├── views/                 ← Brand kit, Tokens, Components, Microcopy views
│   └── styles/
│       ├── tokens.css         ← CSS reference implementation of tokens
│       ├── phone.css
│       ├── desktop.css
│       └── views.css
└── package.json
```

### Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # typecheck + production build
```

The studio has five tabs: **Prototype**, **Brand kit**, **Tokens**, **Components**, **Microcopy**.
Prototype defaults to phone + desktop side by side. Use the segmented control to view either at a
larger scale, the dropdowns in each frame to jump screens, and the header icons to switch theme,
reduced transparency and reduced motion.

### Phase-1 interaction model

- Playback, progress, volume, likes, queue and toast state are shared across both frames. Pause on
  phone, and desktop obeys. This is the state model phase 2 should preserve as a single app core.
- Phone shell: 390 × 844. Desktop shell: 1280 × 820 content, 1280 × 860 window. Tablet behaviour is
  specified below but not drawn as a third frame.
- All audio is simulated. Album art is procedural, using the eight brand artwork palettes.
- Fonts load from Google Fonts in the prototype; phase 2 bundles them as assets.

---

## 3. Stack recommendation for phase 2

### Recommendation: **Flutter** (Dart), one codebase, four shipping targets.

This is the only mainstream option that gives a genuinely shared **visual** layer across Android,
iOS, macOS and Windows while allowing pixel-level customisation of a glass-heavy, animation-heavy
interface. Mewzak is a design-led product; the fastest way to ship the same taste four times is to
own the renderer.

**Why Flutter for Mewzak specifically**

1. **One UI, four platforms.** Phone, tablet and desktop shells can be composed from the same
   widgets and token theme, with adaptive layout logic instead of a stretched phone UI. Desktop
   gets real tables, a sidebar and a resizable panel — not a phone canvas in a window.
2. **Glass and motion are first-class.** `BackdropFilter`, custom shaders, Impeller and a single
   animation clock give predictable blur, spring and artwork transitions on every platform. A
   React Native stack would need three UI runtimes and still fight macOS/Windows parity.
3. **Desktop is real, not an afterthought.** macOS and Windows are first-class Flutter targets.
   Native window chrome, media keys, file pickers and attention to title bars are possible via
   plugins and thin platform channels. Electron/Tauri would add a browser runtime and force a
   second mobile codebase.
4. **Audio can be abstracted cleanly.** Define one `PlaybackEngine` interface and bind `just_audio`
   on Android/iOS/macOS and `media_kit` (libmpv) on Windows. The UI, queue, lyrics sync and
   persistence stay shared.
5. **Design-token discipline.** Flutter `ThemeExtension` maps 1:1 to the JSON tokens. A single
   `MewzakTheme` drives both platforms, and dark/light + reduced-transparency variants are
   compile-time swaps rather than platform-specific style sheets.
6. **Hiring and iteration.** One test suite, one motion library, one component vocabulary. A
   Spotify-level feature surface is a marathon; reducing the number of divergent implementations is
   the highest-leverage decision.

**What this costs**

- Desktop accessibility and native menu behaviour need deliberate work (Flutter’s semantics and
  focus system are good, but not free).
- Platform file dialogs, media keys, system Now Playing, and window chrome require platform
  channels or maintained plugins.
- Flutter desktop app size is larger than a native shell; acceptable for a music app whose value is
  catalogue and playback.
- If the team is already deeply React/TypeScript, the migration cost is real. See alternatives.

### Alternatives, honestly compared

| Option | Verdict |
| --- | --- |
| **React Native + RN Windows/macOS** | Strong mobile ecosystem, but Windows/macOS support is fragmented across community renderers. Every glass-heavy component needs per-platform verification; three style engines (iOS, Android, desktop) erode the single-design promise. Not recommended for four polished targets. |
| **Kotlin Multiplatform + Compose Multiplatform** | Excellent shared logic and Android story. Compose on iOS is maturing but still carries rendering and accessibility risk for a premium consumer product; desktop polish is strong but the iOS risk is the deciding factor for a music app. A credible plan B if the org is Kotlin-first. |
| **Two native apps + two desktop shells** | Best platform feel, four times the design QA. A 4–8 person team cannot sustain Spotify-level scope plus four interaction grammars. Only choose this with a large platform team and a longer runway. |
| **Tauri/Electron desktop + RN mobile** | Two UI codebases and no shared mobile/desktop component layer. Background audio and native media controls on mobile force RN anyway. Faster desktop, worse total cost. |
| **Flutter (recommended)** | Best balance of visual fidelity, four-target coverage, single design system and predictable animation. Trade-off is native polish effort around the edges, which is budgeted below. |

### Phase-2 package shortlist (pin versions when implementation starts; verify Windows support)

| Concern | Suggested approach |
| --- | --- |
| Audio (mobile/macOS) | `just_audio` + `audio_service` (background, lock screen, media keys) |
| Audio (Windows) | `media_kit` / libmpv, or a thin WinRT `MediaPlayer` channel |
| Gapless / crossfade | Player-level buffering + two-engine crossfade; test on all four OSes |
| State | Riverpod (`Notifier`/`AsyncNotifier`) + immutable models |
| Routing | `go_router` with an adaptive shell; deep links for track/album/playlist |
| Persistence | Drift (SQLite) for library/queue/history; `shared_preferences` for small settings |
| Images | `cached_network_image` + `flutter_cache_manager`; 160/320/640/1280 renditions |
| Icons | `lucide_icons` package, or vendor the 24 × 24 SVGs and compile a tree-shaken icon font |
| Type | Bundle Instrument Sans + Bricolage Grotesque as assets (both SIL OFL; verify before release) |
| Windows chrome/media | `window_manager` + WinRT media session via platform channel |
| macOS chrome/media | Native window chrome; `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter` channel |
| Glass fallback | `MediaQuery.disableAnimations` + app-level `reduceTransparency` flag, no re-layout |
| Testing | `flutter_test` widget tests per component; golden tests for both themes; integration tests on four targets |

Do not add a design-system dependency (Material widgets styled heavily, third-party glass kits). Use
Material only for semantics, ripples and platform affordances, and own the visuals.

---

## 4. Architecture & structure for phase 2

```
lib/
├── app/                 ← bootstrap, router, themes, adaptive shell
│   ├── shell/phone_shell.dart
│   ├── shell/tablet_shell.dart
│   ├── shell/desktop_shell.dart
│   └── theme/mewzak_theme.dart, theme_extensions.dart
├── core/                ← tokens, typography, spacing, motion, accessibility flags
├── features/
│   ├── player/          ← PlaybackEngine interface, queue, crossfade, media session
│   ├── library/         ← playlists, liked songs, downloads
│   ├── browse/          ← home, search, recommendations
│   ├── detail/          ← album, artist, playlist
│   ├── lyrics/          ← timed lyrics model + sync
│   ├── profile/         ← listening stats, settings
│   └── onboarding/
├── shared/widgets/      ← PlayButton, TrackRow, cards, scrub, glass, mascot, toasts
└── data/                ← repositories, Drift, API clients, fixtures
```

**Non-negotiable module boundaries**

- `PlaybackEngine` is an interface. The UI never sees `just_audio` or `media_kit` types. This is the
  one place where Windows and macOS diverge; keep the divergence below the UI.
- One app-wide `PlayerState` (current track, queue, position, volume, repeat/shuffle, liked set).
  Phone and desktop shells observe the same provider. Do not fork state per platform.
- One route model with an adaptive shell: `Home`, `Search`, `Library`, `Playlist`, `Album`,
  `Artist`, `NowPlaying`, `Queue`, `Lyrics`, `Profile`, `Settings`. Phone renders `NowPlaying`,
  `Queue`, `Lyrics` as full sheets; desktop renders them as the right panel. Keep the route names
  identical to this prototype.
- **Artwork accent** is an input to the theme, not a separate theme. Set `artAccent` on the Now
  Playing subtree; validate against a contrast floor and fall back to lilac.
- **Adaptive breakpoints** (logical px): `< 768` phone; `768–1023` tablet; `>= 1024` desktop;
  `>= 1440` wide desktop. Do not introduce a new breakpoint for one-off screens.

**Layout rules by shell**

- **Phone (Android + iOS):** 20 px gutters, 3-tab bar with labels, docked mini player, full-screen
  player sheet. Tab bar height 64 → 52 px after 28 px scroll; labels collapse. Mini player bottom
  tracks the tab bar. On Android, the gesture bar and punch-hole are respected; on iOS, the dynamic
  island and home indicator define safe areas.
- **Tablet:** 768–1023 px. Sidebar becomes an 88 px icon rail (expandable to 232 px), 2–3 card
  columns, and Now Playing becomes a right-side overlay or sheet rather than a permanent panel.
  Transport stays docked. This is a layout change, not a stretched phone.
- **Desktop:** 232 px sidebar (fixed), fluid main, 288–430 px resizable right player panel, 88 px
  transport. Use native macOS/Windows window chrome. On Windows, keep native caption buttons; on
  macOS, use native traffic lights, optionally unified title bar. The prototype draws chrome in a
  neutral palette so the brand palette stays pure; production uses the real OS controls.

---

## 5. Design system

### Color

Dark is primary. Light is a full secondary mode, not an inverted afterthought. Tokens are semantic:
components ask for `surface1`, `textSecondary`, `accent`, never a raw hex.

| Role | Dark | Light |
| --- | --- | --- |
| bg | `#0B0B0F` | `#F6F4FB` |
| surface1 | `#14141A` | `#FFFFFF` |
| surface2 | `#1B1B23` | `#F2EEFA` |
| text | `#F5F5F7` | `#14121A` |
| text secondary | `#A1A1AA` | `#5B5868` |
| accent | `#B79CFF` | `#6B47E4` |
| peach | `#FFB48A` | `#EC9A72` (decorative) |
| gradient | lilac → peach at 135° | deeper lilac → peach |

**Hard rules**

- No green. No red. No orange beyond the specified peach gradient partner. No Spotify-adjacent
  combinations.
- Peach never carries text alone and never appears without lilac beside it.
- Errors use peach plus plain language and a retry; failure is never red.
- Every essential text pair passes 4.5:1. Measured: dark text 18.0:1, secondary 7.7:1, accent
  8.6:1, ink on lilac 8.1:1; light text 17.0:1, secondary 6.3:1, accent 5.3:1.
- The artwork accent is allowed only for the player context (scrub fill, now-playing glow, mini
  progress), guarded by a contrast check and always falling back to lilac.

### Type

- **Display:** Bricolage Grotesque 600, tight tracking (−0.04em). Screen titles, hero copy, empty
  state headlines, brand moments.
- **UI:** Instrument Sans 400–650. Body, metadata, controls, buttons.
- **Numeric:** tabular figures for durations, progress and percentages.
- Scale: 34/28/22/17/15/14/13/11.5/10.5. Do not add display sizes below 22 px on phone.
- Buttons and controls use sentence case, 600 weight, no letter-spacing tricks.

### Shape

Soft, concentric, never bubbly. Radius scale 6/10/14/20/26/34/pill. The nesting rule is
`inner = outer − inset`; a 26 px hero with 16 px padding holds a 10 px inner control, not another
26 px card. Artwork uses 20–26 px; phone sheets 26–34 px; phones’ outer hardware corners are the
frame’s job, not the app’s.

### Glass

Glass exists only on the **functional layer**: tab bar, mini player, sheets, menus, toasts, desktop
sidebar, transport and window chrome. Artwork, track rows, tables and content cards remain solid.

- Blur 26 px, saturation 160%, background `rgba(20,20,27,.58)`.
- 1 px border `rgba(255,255,255,.10)`, inner highlight `inset 0 1px 0 rgba(255,255,255,.07)`.
- **Reduced transparency** swaps to a solid surface (`#17171F` dark / `#FFFFFF` light) and removes
  blur. Layout must not shift. The prototype exposes this as a header toggle and in Settings.
- Never stack more than two blurred layers. On lower-end Android devices, an app-level glass
  quality tier may reduce blur to 12 px while remaining visually identical in rhythm.

### Motion

- Standard easing `cubic-bezier(.22,.85,.25,1)`, spring `cubic-bezier(.34,1.35,.42,1)`.
- Durations 120 / 180 / 280 / 460 ms. Motion confirms actions; it never delays them.
- Only transform and opacity animate on the functional layer. Blur is static; do not animate
  `backdrop-filter` on phone.
- Every animation has a 1 ms equivalent under `prefers-reduced-motion` and the app toggle.
- The mascot animates at rest only; no looping motion in the transport.

### Iconography

Lucide only, 24 × 24 box, 1.75 px stroke, rounded caps. One weight everywhere. Filled icons are
reserved for the liked heart and the toe-bean pause garnish. The cat mark is bespoke; do not
substitute Lucide Cat for the logo.

### Artwork & adaptive accent

The prototype generates art from eight palettes. Production uses real cover art with a designed
fallback: dominant colors extracted server-side, a deterministic gradient, and a high-contrast
overlay for any text. The player accent is a *single* extracted color, not the whole palette, and is
checked against `#0B0B0F`/`#F5F5F7` before use. Guard rails matter more than perfect extraction.

### Mascot rules

- States: Idle, Happy, Sleeping, Loading, Error. Line art, 200 × 200, 3.3 px stroke, currentColor,
  peach nose only.
- Used on onboarding, empty states, long loading and the error state. Never over artwork, never
  inside the transport, never more than one per screen.
- The error mascot gets a peach balloon, not a red warning. Copy still explains and offers retry.
- The mascot is decorative in semantics (`excludeFromSemantics`), unless it is the only content in
  an empty state, where its label is announced.

### Voice

Short, soft, a little cheeky. Puns live in toasts, empty states, loading and errors. Playback
controls are literal. No puns in destructive confirmations, billing or errors that block a task.
The full sheet lives in `src/microcopy.ts` and the **Microcopy** studio tab; it should move to ICU
messages in phase 2.

---

## 6. Component → Flutter mapping

| Prototype component | Flutter widget approach |
| --- | --- |
| `TabBar` | Custom `NavigationBar`-like row, glass container, animated labels; keep semantics `tab` |
| `Sidebar` | `NavigationRail`-inspired custom column + playlist list; 232 px / 88 px variants |
| `MiniPlayer` | `DockedPlayer`, glass container above tab bar, artwork accent progress |
| `NowPlayingSheet` | Draggable sheet on phone/tablet; `NowPlayingPanel` on desktop (same inner content) |
| `TrackRow` | Shared `TrackRow` with density variants; desktop adds album column + like affordance |
| `AlbumCard` / `PlaylistCard` | Shared `MediaCard` driven by a view model; play affordance on hover/focus |
| `ArtistChip` | Round artwork + name + optional monthly listeners; used in search/library/profile |
| `SearchBar` | Debounced input with recent terms; no suggestions before 250 ms |
| `ScrubBar` / `VolumeSlider` | `SliderTheme`-driven custom track + hover thumb; semantics “Seek” |
| `PlayButton` | Gradient disc; two-bar pause; paw badge appears on hover/focus only |
| `ContextMenu` | `showMenu`-style anchored panel or custom overlay; long press + right click |
| `Toast` | Overlay host per shell; max 2 visible; auto-dismiss 3.6 s; optional Undo |
| `EmptyState` | Mascot + headline + body + one action; never used for errors that need a form |
| `Skeleton` | Shimmer matching final layout; start after 400 ms, not instantly |
| `Mascot` | Lottie or custom `CustomPainter`; state drive from app events, not a timer loop |
| `Logo` | SVG asset; wordmark as outlined path for perfect cross-platform rendering |

---

## 7. Screen behaviour matrix

| Screen | Phone | Tablet | Desktop |
| --- | --- | --- | --- |
| Onboarding | 3 steps, mascot, mood chips | full-screen 2-column, same steps | split panel, brand art + steps |
| Home | greeting, resume hero, rails, 2-col grid | 2–3 column cards, resume hero | feature grid + 4-up rails + track table |
| Search | search bar, category grid, results | 3-col categories, split results | large search, 5-col categories, split results |
| Library | 4 filter tabs, list rows, grid for albums | rail + 3-col grid | sidebar + filter tabs + 4-col grid |
| Playlist | hero art, actions, track list | art + actions + table | large hero + table + footnotes |
| Album | centered hero, track list, about | hero + table + about card | split hero + table + about side card |
| Artist | avatar hero, follow, top tracks, albums | avatar + top tracks + discography | 168 px avatar hero, popular table + discography |
| Now Playing | full-screen sheet with queue/lyrics access | sheet or 420 px overlay | resizable right panel (288–430 px) |
| Queue | full screen, now playing + up next | overlay tab | panel tab |
| Lyrics | full screen, auto-scroll active line | overlay tab | panel tab, auto-scroll |
| Profile | card, stats, listening clock, likes | 2-col stats + likes | profile card + insights grid |
| Settings | grouped cards | grouped cards, 2 columns | 2-column card grid |

Use the same route names in phase 2. The phone’s full screen for Queue/Lyrics and the desktop’s panel
tab are two presentations of one route, not separate features.

---

## 8. Accessibility & performance gates

Ship only when all of these pass on all four platforms:

- **Contrast:** body/control text ≥ 4.5:1, large text ≥ 3:1, focus ring ≥ 3:1 against both the
  control and its background.
- **Targets:** ≥ 40 × 40 px for every control; 44 recommended. Docked mini player and scrubber are
  exempt from nothing.
- **Semantics:** every icon-only button has a label. The player exposes “Play”, “Pause”, “Next
  track”, “Seek” and current time. Playback state is announced once, not every second.
- **Keyboard (desktop):** Tab reaches every control in visual order; Space toggles play; Esc closes
  sheets/menus; arrow keys scrub; focus is never trapped behind a glass layer.
- **Reduced motion:** all non-essential motion disabled, mascot still, progress transition removed.
- **Reduced transparency:** blur removed, solid equivalent, layout unchanged.
- **Text scaling:** support 200% without clipping labels or overlapping the transport. At 200% the
  phone tab bar may hide labels before truncating.
- **Screen readers:** artwork has alt text (track + artist); decorative mascot and ambient artwork
  are excluded.
- **Performance:** 60 fps minimum, 120 fps where supported. Blur only on the functional layer; one
  `BackdropFilter` per floating surface. Cache artwork tiers; precache next 3 tracks; no layout
  thrash on scroll. Cold start < 2 s to interactive on mid-range Android. Memory ceiling for
  artwork < 120 MB.

---

## 9. Assumptions, limits & open decisions

### Phase-1 assumptions

- All catalogue, artists, albums, playlists, lyrics, listener counts and user data are fictional.
- No audio files, streaming, downloads or playback rights are represented.
- “Playing” is a simulated timer; the queue advances at track end.
- App icon and mascot are original vector assets. Lucide icons are ISC licensed.
- Bricolage Grotesque and Instrument Sans are sourced from Google Fonts under the SIL Open Font
  License; confirm licensing before bundling.
- The macOS window mock uses neutralized traffic lights so the brand palette stays pure. Production
  uses native chrome.
- The tinted app icon is shown grayscale because the OS supplies the tint.
- Tablet is specified but not drawn as a third stage; breakpoints and shell rules are above.
- Light theme is complete across all screens but dark is the default.

### Phase-2 decisions needed from product

1. Catalogue source and licensing (majors, indie distribution, user uploads?) — determines search,
   availability and rights UI.
2. Streaming quality ladder and offline policy; crossfade availability per tier.
3. Subscription tiers and trial copy. Current plan chip is fictional.
4. Account model (email, social, anonymous) and sync scope.
5. Lyrics provider, timing format and licensing.
6. Desktop distribution: DMG + notarization, MSIX/Store, auto-update channel.
7. Telemetry and privacy posture; the prototype collects nothing.
8. Social surface: follow-only, shared playlists, collaborative editing, or none.
9. Localisation priority markets and RTL support.
10. Whether desktop gets downloads/casting in v1 or phone only.

---

## 10. Phase-2 delivery plan

**M0 — Foundations (1–2 weeks)**
Design tokens → Flutter `ThemeExtension`; font and icon pipeline; adaptive shells with empty pages;
audio spike on all four OSes (just_audio + media_kit); window/media-key channels; CI on four targets.

**M1 — Core listening (3–4 weeks)**
Home, Library, Playlist, Album, Artist; queue and playback engine; mini player, transport, Now
Playing; likes and local persistence; skeleton/loading/error paths.

**M2 — Finding music (2–3 weeks)**
Search with debounce and recent terms; browse categories; artist radio stub; context menus; recent
searches; empty states and retries wired to real APIs.

**M3 — Depth (3 weeks)**
Synced lyrics; queue reordering; profile insights; settings including reduced motion/transparency;
downloads/offline; notifications; media session polish per OS.

**M4 — Release hardening (2–3 weeks)**
Accessibility audit on four platforms; performance profiling; golden tests for both themes; text
scale 200%; reduced-motion/transparency QA; store assets and icons; beta.

Do not rebuild the shell per platform. Build one shell contract, then specialise chrome, gesture and
media integrations below it.

---

## 11. File & asset handoff

- **Tokens:** `tokens/tokens.json` — color, artwork palettes, type, space, radius, glass, motion,
  breakpoints, z-index, accessibility ratios.
- **CSS reference:** `src/styles/tokens.css` — theme selectors, glass fallback, utilities.
- **Component source:** `src/components/ui.tsx` + `src/phone/PhoneApp.tsx` +
  `src/desktop/DesktopApp.tsx`.
- **Brand assets:** `src/components/Brand.tsx` (vector), `public/mewzak-icon.svg` (favicon).
- **Copy:** `src/microcopy.ts` (ICU-ready groups).
- **Icons:** Lucide; the app mark, wordmark, mascot and generated artwork are original for Mewzak.

### Production icon deliverables checklist

- iOS: 1024 master; light, dark, tinted variants; 16–1024 exports.
- Android: adaptive foreground/background + monochrome layer; 432 × 432 master; Play Store 512.
- macOS: `.icns` with rounded squircle at every size; no baked-in drop shadow.
- Windows: `.ico` with 16/24/32/48/64/128/256; respect Windows icon safe areas.
- Social/OG: 1200 × 630 wordmark on base; use the peach/lilac gradient only as a soft wash.

---

## 12. Definition of done for Phase 1

- [x] Brand kit: wordmark, logo, app icon (dark/light/tinted), five mascot states.
- [x] Tokens: color, type, radius, spacing, glass, motion, breakpoints, contrast.
- [x] 18-component library with states, live in the studio.
- [x] All 12 screens clickable on phone and desktop widths.
- [x] Microcopy sheet covering toasts, empty states, loading, errors and onboarding.
- [x] DESIGN.md with stack recommendation, assumptions, component mapping and run instructions.
- [x] Phone and desktop layouts side by side with shared playback state.
- [ ] Phase 2 implementation (next phase, not this one).

> The quiet is a feature. Keep it.
