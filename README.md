# Mewzak

A quiet music player for the web, desktop and mobile. Mewzak keeps the Phase 1 look
(tokens, artwork, motion) and uses the Phase 2 onboarding as the doorway into the real
product. The root URL is the product; the design studio still lives beside it.

```bash
npm ci
npm run dev
# http://localhost:3000/          product app
# http://localhost:3000/?studio=1 design studio (Phase 1 + Phase 2 gallery)
```

Node 20+ is recommended. The production build is a static Vite app:

```bash
npm run typecheck
npm run build
npm run preview
```

## What is real

| Area | State |
| --- | --- |
| Playback | Real `HTMLAudioElement`: play, pause, seek, previous, next, queue, shuffle, repeat, volume, Media Session metadata. |
| Music source | **Audius public API** (no key), behind `src/product/source.ts`. Real MP3 streams and artwork. |
| Local library | Likes, user playlists (create, rename, reorder, remove), recents, search history and queue in `localStorage`. |
| Catalogue restore | Saved IDs are re-fetched from Audius on boot. Track metadata is not persisted. |
| Search | Debounced Audius search with loading, empty, error and retry states. |
| Onboarding | Phase 2 flow with a `localOnly` doorway: no fake Google or phone auth. |
| Profile / Settings | Real local counts, real cache/clear/sign-out/delete actions, real theme and motion settings. |
| Keyboard | Space, arrows, Ctrl/Cmd+F, Escape in dialogs. |
| Desktop | Resizable now-playing panel, remembered panel width, Tauri window-state plugin in the native shell. |
| Packaging | Tauri 2 configs and icons for macOS/Windows/Linux/Android/iOS, plus GitHub Actions. |

## Not real yet

These are deliberately visible here rather than hidden behind fake UI:

- **Accounts and cross-device sync (M3).** No backend credentials were available and no
  accounts are fabricated. The app is local-only. See `SETUP.md` for the exact backend
  decision and keys needed.
- **Native installers.** The Tauri shell is configured, but this workspace has no Rust,
  Xcode or Android SDK, so no `.dmg`, `.exe`/MSI, `.ipa`, `.aab` or `.apk` was built or
  signed here.
- **Background/lock-screen playback on mobile, and OS media keys.** The web player uses
  Media Session where the browser supports it. Native audio services and iOS background
  modes are not wired, so treat those as unverified.
- **Offline downloads.** Audius API terms do not allow persisting audio. The app streams
  only; Settings says this plainly.
- **Lyrics.** Only shown when a track carries lyrics. Audius does not provide timed lyrics
  for most tracks, so the lyrics screen is usually an honest empty state.

## Music source and terms

Source: [Audius](https://audius.co). API base: `https://api.audius.co/v1`.

- Read-only endpoints work without an API key.
- The app uses Audius for discovery and streaming and attributes it in Settings and player
  fine print.
- Metadata is kept for the current session. Saved playlists and likes store **IDs only**;
  the catalogue is fetched again on boot.
- Audio is never downloaded, cached for offline use, or offered as a download.
- Before commercial launch, review the current [Audius API Terms](https://audius.co/documents/ApiTerms.pdf)
  and the source's attribution requirements.

`VITE_AUDIUS_APP_NAME` changes the `app_name` query parameter (default `Mewzak`). It is a
public identifier, not a secret.

## Project shape

```
src/
  product/source.ts       MusicSource boundary + Audius implementation
  product/library.ts      localStorage schema and playlist helpers
  product/search.ts       debounced source search
  product/ProductApp.tsx  boot, onboarding gate, shell, playlist manager
  store.tsx               one provider: audio, queue, likes, playlists, routes, settings
  phone/PhoneApp.tsx      Phase 1 phone shell wired to real data
  desktop/DesktopApp.tsx  Phase 1 desktop shell wired to real data
  phase2/                 onboarding, profile system and design gallery
  data.ts                 mutable UI catalogue and helpers
  styles/                 Phase 1 tokens/shells, product additions, Phase 2 styles
src-tauri/                Tauri 2 native shell and generated icons
.github/workflows/        desktop and mobile CI
```

The UI never calls Audius directly. Screens read `Track`, `Artist`, `Album` and `Playlist`
values from `data.ts`; `source.ts` is the only module that knows Audius.

## Verification

Run in this workspace:

- `npm run typecheck` — passed.
- `npm run build` — passed (Vite production build).
- Browser at 416px: onboarding completed, Audius boot, real stream request returned `206`
  audio, remote search for “rain” returned real tracks, like persisted, playlist create /
  add / reorder controls worked, library survived reload, saved track metadata was
  re-fetched by ID.
- Browser at 1440px: desktop shell rendered, transport started real playback, profile,
  library, queue and now-playing panel rendered with real artwork.

Not run here: native app builds, signing, installers, iOS/Android background audio,
lock-screen controls, OS media keys, cross-device sync. Those are marked unverified above.

## Scripts

```bash
npm run dev            # Vite on 0.0.0.0:3000
npm run build          # typecheck + production build
npm run typecheck      # tsc --noEmit
npm run preview        # preview the production build
npm run tauri:dev      # native desktop dev (needs Rust)
npm run tauri:build    # native desktop bundle (needs platform toolchain)
npm run android:init   # generate the Android project (needs Android SDK/NDK)
npm run android:build  # build APK/AAB
npm run ios:init       # generate the iOS project (needs macOS/Xcode)
npm run ios:build      # build iOS
```

`MEWZAK_PREVIEW_HOST` is a development-only Vite allowlist value. It is not used by the
app and must be the exact cloud preview hostname, never a wildcard.

Packaging, signing, store rules and the backend keys M3 still needs are in
[`SETUP.md`](SETUP.md).
