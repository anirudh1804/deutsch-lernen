# German Learning App

A web application for learning German numbers and vocabulary through interactive
audio exercises. You hear a number or word spoken in German and type what you hear.
The same codebase ships as a **web** app (PWA), a **desktop** app (Tauri), and a
**mobile** app (Capacitor/Android).

## Live Links

- **Web app (PWA):** <https://german-learning-app-six.vercel.app>
- **Desktop installer (Windows):** [GitHub Release v0.3.0](https://github.com/anirudh1804/deutsch-lernen/releases/tag/v0.3.0)
  - `German.Learning.App_0.3.0_x64-setup.exe` (NSIS installer)
  - `German.Learning.App_0.3.0_x64_en-US.msi` (MSI installer)
- **Android APK:** [GitHub Release v0.3.0](https://github.com/anirudh1804/deutsch-lernen/releases/tag/v0.3.0)
  - `app-release.apk` (signed release APK)

---

## Features

- **Number practice** — random numbers 0–2,000,000 with up to 2 decimal places,
  spoken as full German words; the number is only heard, never shown.
  *Example:* audio says "eintausendzweihundertvierunddreißig Komma sechsundfünfzig"
  → you type `1234.56`.
- **Vocabulary practice** — German words by difficulty (Easy/Medium/Hard); the
  word is only heard, you type the German spelling.
- **Game modes** — Numbers, Words, or Mixed.
- **Audio** — Text-to-Speech with voice, speed, and auto-play settings. Uses the
  device/browser TTS engine (native on mobile, Web Speech API in the browser).
- **In-app updates** — Settings → Update checks GitHub Releases for a newer
  version; desktop downloads the installer, Android downloads the APK, web reloads
  the new build.
- **User accounts** — register/login with email or username; progress (streaks,
  scores, history) is stored per user.
- **Guest mode** — anyone can use the app without logging in; guests can answer
  up to **15 questions** free before being prompted to create an account, and no
  points are tracked for guests.
- **Bilingual UI** — German (primary) and English.
- **PWA** — installable, offline-capable via a service worker.

---

## Platforms

| Platform | Status | How it's delivered |
|----------|--------|--------------------|
| Web / PWA | ✅ Live | Hosted on Vercel, installable from the browser |
| Desktop (Windows) | ✅ Live | Tauri builds the web app into a native window; distributed as `.exe`/`.msi` via GitHub Releases |
| Mobile (Android) | ✅ Live | Capacitor builds the web app into a native APK; distributed as `app-release.apk` via GitHub Releases |

Because the core is a single React web app, every platform just loads the same
compiled `dist/` output. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for
the full stack breakdown.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | React Context + Zustand |
| Auth & DB | Supabase (Auth + PostgreSQL) |
| Audio | Web Speech API (web/desktop) + native TTS (mobile) |
| Desktop shell | Tauri (Rust + system WebView) |
| Mobile shell | Capacitor (Android) |
| Deployment | Vercel (web) + GitHub Releases (desktop & Android) |

---

## Security & Networking (Secure End-to-End)

This section explains how data travels and how the app is secured from the
browser down to the database.

### Transport security (HTTPS / TLS)
- The web app is served over **HTTPS** by Vercel, so all traffic between the
  browser and the app is encrypted in transit.
- The desktop app loads the same content in a system WebView over the same
  secure origins.

### Authentication — Supabase Auth with PKCE
- Authentication uses **Supabase Auth** with the **PKCE (Proof Key for Code
  Exchange)** flow.
- PKCE sends a one-time code challenge instead of a client secret, so the
  authorization code can never be replayed — a best practice for pure
  client-side (SPA) apps where a secret can't be safely stored.
- Tokens are persisted and automatically refreshed: `localStorage` in the
  browser/WebView on web & desktop, and native **Capacitor Preferences** on
  mobile so the session survives app restarts. Logout revokes the refresh token
  server-side.

### Authorization — Row Level Security (RLS)
- PostgreSQL tables (`profiles`, `game_sessions`, `answers`, `user_vocabulary`)
  have **Row Level Security (RLS)** enabled.
- RLS policies let each request only read/write rows belonging to the
  authenticated user (`auth.uid()`), so a user can never see or modify another
  user's data even if a request is forged.

### Secrets & environment configuration
- Supabase credentials live in `.env.local` and are **gitignored** — they are
  never committed to the repository.
- Vercel deployments inject `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from
  the Vercel environment rather than the repo.
- `.vercelignore` excludes native build folders and environment files from web
  uploads, keeping the deploy payload small and secrets out.
- Only the **anon key** is exposed to the client (safe because RLS governs what
  it can access); any privileged operations belong server-side.

### Content Security Policy (CSP)
- `vercel.json` applies a **Content-Security-Policy** header restricting:
  - scripts/styles to the app's own origin,
  - network connections (`connect-src`) to the app plus the Supabase domain,
  - and disables framing (`frame-ancestors 'none'`) and unsafe embedding.
- This mitigates XSS and data-exfiltration risks.

### Native shell notes
- The desktop app runs the identical web bundle in the OS WebView, so the same
  origin/session boundaries apply.
- The Tauri configuration currently ships with CSP disabled for simplicity; the
  app does **not** enable any Tauri IPC surface that would expose the backend to
  the page.

---

## Getting Started (local development)

### Prerequisites
- Node.js 18+
- A Supabase project with the migrations in `supabase/migrations/` applied

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and anon key

# Start the dev server (http://localhost:3000)
npm run dev
```

### Useful commands
```bash
npm run typecheck     # TypeScript type check
npm run lint          # ESLint
npm run test          # Vitest unit tests
npm run build         # Production build -> dist/  (also generates PWA assets)
npm run preview       # Serve the production build locally
```

### Desktop (Tauri)
```bash
npm run tauri:dev     # Run desktop app in dev mode
npm run tauri:build   # Build installers (.exe / .msi)
```

### Mobile (Capacitor / Android)
```bash
npm run cap:sync          # Copy web build into the native project
npm run cap:build:android # Build an Android APK (requires Android SDK/JDK)
npm run cap:open:android  # Open the project in Android Studio
```
To produce a **signed release APK**, run `assembleRelease` from the `android/`
folder with a keystore configured in `android/app/build.gradle` and a local
`keystore.properties` (gitignored).

---

## Project Structure

```
german-learning-app/
├── src/                # Shared web application
│   ├── components/     # Reusable UI + layout components
│   ├── features/       # auth, game, settings, tts, update
│   ├── pages/          # Home, Game, Settings, Profile, auth pages
│   ├── lib/supabase/   # Supabase client, storage adapter + data modules
│   ├── utils/          # numberToGermanWords + tests
│   ├── i18n/           # German / English translations
│   └── styles/         # Tailwind + global styles
├── src-tauri/          # Desktop shell (Rust/Tauri)
├── android/            # Mobile shell (Capacitor Android)
├── supabase/           # Migrations + config
├── docs/               # ARCHITECTURE.md, PWA-TROUBLESHOOTING.md
├── public/             # Static assets, PWA icons
├── vite.config.mjs     # Vite + PWA build config
├── capacitor.config.ts # Capacitor config
├── vercel.json         # Vercel deployment + security headers
└── .vercelignore       # Excludes native folders/env from web deploys
```

---

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — full 4-platform architecture
- [`docs/PWA-TROUBLESHOOTING.md`](docs/PWA-TROUBLESHOOTING.md) — Vite/PWA config
  issue and resolution

---

## License

MIT
