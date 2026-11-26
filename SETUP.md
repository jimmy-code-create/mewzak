# Mewzak setup

This file lists what must exist on your machine and in your accounts. Nothing here
pretends to be provisioned. Commands were not run in the cloud workspace where Rust,
Xcode and the Android SDK are absent.

## 1. Web app

```bash
npm ci
npm run dev
```

Optional public build variable:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_AUDIUS_APP_NAME` | `Mewzak` | `app_name` sent to the Audius API. Public, not a secret. |

`MEWZAK_PREVIEW_HOST` is only for the exact cloud preview hostname during development.

## 2. Native shell (Tauri 2)

Install [Rust](https://rustup.rs/) and the Tauri system prerequisites for your OS:
<https://tauri.app/start/prerequisites/>.

```bash
npm ci
npm run tauri:dev      # desktop development window
npm run tauri:build    # installers in src-tauri/target/release/bundle/
```

The app icon and platform icon set are generated from `src-tauri/icons/source.png` with
`npx tauri icon src-tauri/icons/source.png`.

The window is resizable and remembers its size through `tauri-plugin-window-state`.
Panel width is remembered in `localStorage` under `mewzak.panelWidth`.

### Desktop outputs

| Platform | Command | Output |
| --- | --- | --- |
| macOS | `npm run tauri:build` on macOS | `.app`, `.dmg` |
| Windows | `npm run tauri:build` on Windows | `.msi` (WiX) and NSIS `.exe` |
| Linux | `npm run tauri:build` on Linux | `.deb`, `.rpm`, `.AppImage` |

Unsigned bundles build without an account. Distribution needs signing below.

### Android

Install Android Studio, SDK platform 34+, build tools and NDK 26/27; set `ANDROID_HOME`
and `NDK_HOME`. Install the Rust Android targets:

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
npm run android:init
npm run android:build -- --apk --aab
```

Debug APKs can be installed without a keystore. A release AAB for Play Console needs an
upload keystore.

### iOS

Requires macOS, Xcode 15+, CocoaPods and an Apple Developer account for device/App Store
builds. Install the Rust targets:

```bash
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
npm run ios:init
npm run ios:build
```

The simulator can build unsigned. An IPA and App Store upload require the signing items
below. If accounts are added later, App Store guideline 4.8 requires an equivalent
privacy-preserving login (for example Sign in with Apple) whenever other social logins
are offered. This build offers no social login.

## 3. Signing and store accounts

| Need | Account / item | Used by |
| --- | --- | --- |
| macOS distribution | Apple Developer Program, Developer ID Application certificate, notarization Apple ID / app-specific password / team ID | `.dmg`, Gatekeeper |
| iOS | Apple Developer Program, distribution certificate, App Store provisioning profile, team ID | `.ipa`, TestFlight |
| Android | Google Play Console account, upload keystore (`.jks`), key alias, store/key passwords | `.aab` |
| Windows | Code-signing certificate (OV/EV) and password; SmartScreen reputation | `.exe`/MSI |
| GitHub Releases/CI | `GITHUB_TOKEN` is supplied by Actions; signing secrets are yours | workflows |

Do not commit keystores, certificates, provisioning profiles or passwords. Add them as
GitHub Actions secrets.

Current workflows are deliberately unsigned CI proofs:

- `.github/workflows/desktop.yml` builds macOS, Windows and Linux bundles on
  `workflow_dispatch`, `main` and pull requests.
- `.github/workflows/mobile.yml` builds a **debug Android APK** and an **unsigned iOS
  simulator app** on `workflow_dispatch`.

To add signed release builds, add the secrets and steps below.

### Android signing secrets

```
ANDROID_KEY_BASE64        # base64 of the upload .jks
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
ANDROID_STORE_PASSWORD
```

Add a release signing config to the generated Android Gradle project, or pass the Tauri
Android signing environment variables documented by Tauri. Then run:

```bash
npx tauri android build --aab
```

### iOS signing secrets

```
APPLE_CERTIFICATE_BASE64      # distribution .p12
APPLE_CERTIFICATE_PASSWORD
APPLE_PROVISIONING_PROFILE_BASE64
APPLE_TEAM_ID
APPLE_ID
APPLE_APP_SPECIFIC_PASSWORD
```

Import the certificate and profile in a macOS runner, then run a signed
`npx tauri ios build`. Keep these only in repository/environment secrets.

### macOS signing / notarization

```
APPLE_CERTIFICATE_BASE64
APPLE_CERTIFICATE_PASSWORD
APPLE_SIGNING_IDENTITY
APPLE_ID
APPLE_PASSWORD              # app-specific password
APPLE_TEAM_ID
```

Tauri reads these for signing/notarization. Windows signing uses your certificate's
thumbprint or PFX and `signtool`; exact names depend on the certificate vendor.

## 4. Accounts and sync (M3) — not provisioned

M3 is **not implemented** because no backend account or keys exist for this project and
none were to be invented. The product currently says “Local profile · no account, no
sync” wherever that matters.

To finish M3, pick a free-tier auth/database provider and provide:

1. A project URL and public anon key (for example Supabase).
2. A `libraries` table keyed by the auth user ID, with row-level security so a user can
   read/write only their own row. Store the same JSON shape as
   `StoredLibrary` in `src/product/library.ts`, versioned.
3. Email/password or magic-link auth. If you add Google/Apple social login, also add Sign
   in with Apple to meet App Store rule 4.8.
4. Public env vars (never a service-role key in the client), for example:
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. A merge policy for two devices: last-write-wins with an `updated_at` revision is enough
   for likes/playlists; keep queue and “now playing” device-local.

Do not put a service-role secret, SMTP password or signing key in the Vite bundle. Vite
variables are public.

## 5. Background audio and lock screen

The web build uses the Media Session API and an `HTMLAudioElement`. Desktop media keys
work where the OS/browser exposes them. Mobile background playback and lock-screen
controls need native audio session code and platform permissions in the generated
Tauri projects; that code is not included. Treat those two features as unverified until
tested on real devices.

## 6. Legal / store checklist

- Review the current Audius API Terms before commercial distribution.
- Keep Mewzak's attribution visible (Settings and player fine print).
- Do not add downloads, ripping or offline copies of Audius audio.
- Publish a privacy policy covering local storage, search history and (once added) account
  sync.
- Complete Apple privacy labels and Play Data safety forms.
- If accounts/social login are added, follow App Store rule 4.8 and provide account
  deletion in-app.
