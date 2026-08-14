# German Learning App — Architecture Summary

This document captures the overall architecture of the **German Learning App**: a
single React codebase that compiles into **three platforms** — Web (PWA),
Desktop (Tauri), and Mobile (Capacitor Android).

---

## 1. High-Level Diagram

```
                        ┌────────────────────────────────────────────┐
                        │        SHARED WEB CODEBASE (src/)          │
                        │   React 18 + TS + Vite + Tailwind          │
                        │   Zustand / Context stores                 │
                        │   Auth · Game · Settings · TTS · i18n      │
                        └──────────────────┬─────────────────────────┘
                                           │  npm run build  →  dist/
                                           ▼
                    ┌─────────────────────────────────────────────────┐
                    │           Build Pipeline (Vite + PWA)           │
                    │   vite.config.mjs · vite-plugin-pwa (workbox)   │
                    └───────┬──────────────┬──────────────┬───────────┘
                            │              │              │
              ┌─────────────▼──┐  ┌────────▼────────┐  ┌───▼──────────────┐
              │   Web / PWA    │  │    Desktop      │  │      Mobile      │
              │                │  │     (Tauri)     │  │   (Capacitor)    │
              │  vercel.json   │  │  src-tauri/     │  │  capacitor.config│
              │  dist/ (hosted)│  │  Rust + WebView2│  │  android/ (A)    │
              │  sw.js  PWA    │  │  .exe/.msi      │  │  android/ (A)    │
              └───────┬────────┘  └────────┬────────┘  └───┬──────────────┘
                      │                    │                │
                      └────────────┬───────┴────────┬───────┘
                                   ▼                ▼
                        ┌────────────────────────────────────┐
                        │            Supabase Backend          │
                        │  Auth (PKCE) · PostgreSQL · Edge Fns  │
                        │  tts-proxy → Google Cloud TTS         │
                        └────────────────────────────────────┘
```

---

## 2. Shared Core (the "write once" layer)

Everything application-specific lives once under `src/` and is reused by all four
platforms. The native shells (Tauri, Capacitor) simply load the compiled `dist/`.

| Concern | Location | Notes |
|---------|----------|-------|
| Routing / pages | `src/pages/`, `src/App.tsx` | Home, Game, Settings, Profile, Login, Register, NotFound |
| State | `src/features/*/` (React Context) | `auth`, `game`, `settings` contexts |
| Auth | `src/features/auth/` + `src/lib/supabase/client.ts` | Supabase PKCE — session persists in `localStorage` |
| Game engine | `src/features/game/`, `src/data/words.ts` | Numbers / Words / Mixed, Easy/Medium/Hard |
| Number→German | `src/utils/numberToGermanWords.ts` | 0–2,000,000, 2 decimals ("null komma …") |
| TTS | `src/features/tts/useTTS.ts` | Web Speech API (browser fallback) |
| i18n | `src/i18n/` | `de.json` (primary) + `en.json` |
| Styles | `src/styles/globals.css` + Tailwind | Light/Dark/System theme |

**Why the shell is thin:** because auth, offline, and TTS all work through web
standards (`localStorage`, service workers, Web Speech API), the exact same build
runs in a browser, the Tauri WebView2, and the Capacitor WebView — no platform
forks required.

---

## 3. Platform Targets

### 3.1 Web + PWA (primary)
- **Build:** `vite.config.mjs` → `dist/` with `vite-plugin-pwa` (workbox `generateSW`, `registerType: autoUpdate`).
- **Manifest:** standalone display, theme `#0284c7`, 192/512 icons, maskable icon.
- **Deploy:** Vercel (`vercel.json`, `outputDirectory: dist`, SPA rewrite to `index.html`).
- **Offline:** service worker precaches JS/CSS/HTML/icon/woff2; `navigateFallback: /index.html`.

> Note: the Vite config lives at **`vite.config.mjs`** (not `.ts`) — see
> `docs/PWA-TROUBLESHOOTING.md` for why the `.ts` config broke PWA asset resolution.

### 3.2 Desktop — Tauri
- **Scaffold:** `src-tauri/` (Rust). Loads `dist/` into the system WebView2.
- **Config:** `src-tauri/tauri.conf.json`
  - `identifier: com.germanlearn.app`, `productName: "German Learning App"`
  - Window 900×700 (min 500×400), resizable
  - `frontendDist: ../dist`, `devUrl: http://localhost:3000`
  - `beforeBuildCommand: npm run build`
- **Artifacts (Windows):** `app.exe`, NSIS `…-setup.exe`, MSI `.msi` (built; Rust toolchain present).
- **Commands:** `npm run tauri:dev`, `npm run tauri:build`.

### 3.3 Mobile — Capacitor
- **Scaffold:** `capacitor.config.ts` → native `android/`.
  - `appId: com.germanlearn.app`, `webDir: dist`, `androidScheme: https`
- **Sync:** `cap sync` copies `dist/` into `android/app/src/main/assets/public/`.
- **Commands:** `cap:sync`, `cap:build:android`, `cap:open:android`, `cap:add:android`.
- **Status:** Android project generated and shipping signed `app-release.apk` releases.

---

## 4. Backend — Supabase

| Capability | Detail |
|------------|--------|
| Auth | Email/password via `@supabase/supabase-js`; PKCE flow; session in `localStorage` |
| Database | PostgreSQL: `profiles`, `game_sessions`, `answers`, `user_vocabulary` — all with RLS |
| Edge Function | `supabase/functions/tts-proxy/` → Google Cloud TTS (hides API key server-side) |
| Migrations | `supabase/migrations/` |

**Auth persistence across platforms** (Path A): since the session is stored in
`localStorage`, it survives app restarts in the browser, the Tauri WebView2, and
the Capacitor WebView with no per-platform auth code.

---

## 5. Data / Feature Flows

1. **Play a round** → GameContext generates a question → audio plays via `useTTS`
   → user types → answer normalized + validated → score/streak updated →
   reported to Supabase (`game_sessions`, `answers`).
2. **TTS** → try Google Cloud via `tts-proxy` edge function; fall back to browser
   Web Speech API; (IndexedDB audio cache is a planned optimization).
3. **Auth** → Supabase PKCE → `localStorage` session → `ProtectedRoute` gates
   private routes.

---

## 6. Build & Tooling Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (port 3000) |
| `npm run build` | `tsc` + `vite build --config vite.config.mjs` → `dist/` (PWA assets) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest (number converter, words data) |
| `npm run tauri:build` | Tauri desktop bundle |
| `npm run cap:build:android` | `cap sync` + Gradle `assembleDebug` (needs JDK + SDK) |

Path aliases: `@/`, `@components/`, `@features/`, `@lib/`, `@pages/`, `@utils/`, etc.
defined in `vite.config.mjs`.

---

## 7. Known Limitations & Next Steps

- **Android APK** — not produced here (no JDK / Android SDK). Install Android
  Studio + JDK 17, then `npm run cap:build:android`.
- **Android WebView TTS** — `speechSynthesis` is not guaranteed on Android. If
  audio must work there, add a native TTS plugin (e.g. `@capacitor-community/text-to-speech`).
- **Tauri CSP** — `security.csp` is currently `null`; can be tightened once the
  required `ipc:` / Supabase origins are confirmed.
- **Dictionary / Google-TTS provider** — planned (Wiktionary/DWDS; Google TTS via
  `tts-proxy`), not yet wired into the UI.
- **Bundle size** — main JS chunk ≈ 503 kB (Vite warning); consider code-splitting
  (`manualChunks` / dynamic `import()`) before shipping.

---

*Companion docs:* `PLAN.md` (full plan), `PROGRESS.md` (implementation status),
`docs/PWA-TROUBLESHOOTING.md` (Vite/PWA config issue).
