# PWA Integration — Hurdle & Solution Report

**Date:** 2026-08-09
**Scope:** Adding Progressive Web App (PWA) support to the German Learning App (Vite 5 + React).
**Package:** `vite-plugin-pwa` + Workbox

---

## 1. Summary

Adding `vite-plugin-pwa` to the app should have produced a web app manifest, a service
worker, and a SW registration script on build. Instead, the plugin ran silently and
generated **none** of these files. The root cause turned out to be the **Vite config file
format**: when the Vite config was a TypeScript file (`vite.config.ts`), the plugin's
hooks never executed. The exact same configuration loaded from a plain `.mjs` file worked
perfectly.

**Fix:** Converted `vite.config.ts` → `vite.config.mjs` and pinned `--config vite.config.mjs`
in the `build`/`preview` scripts.

---

## 2. Symptoms

- `npm run build` succeeded, but `dist/` contained **no** `manifest.webmanifest`, `sw.js`,
  `registerSW.js`, or Workbox files.
- No `PWA v…` log line appeared during the build.
- The `<script src="/registerSW.js">` tag was **not** injected into `index.html`.
- The same behavior occurred across `vite-plugin-pwa` versions `1.3.0` and `0.21.2`, and
  across several config variations (with/without `workbox`, `includeAssets`, `sourcemap`,
  the React plugin, and path aliases).

---

## 3. Investigation Trail

To isolate the problem, I ran a series of controlled builds:

| Test | Config | Result |
|------|--------|--------|
| Full `vite.config.ts` (react + PWA + aliases) | `.ts` | Build OK, **no** PWA output |
| Minimal PWA-only config in a **separate project** | `.mjs` | `manifest.webmanifest` + `sw.js` generated ✅ |
| Minimal PWA-only config in **this project** | `.mjs` (via `--config`) | PWA generated ✅ (build then failed only because aliases were omitted) |
| Full config (react + PWA + aliases) | `.mjs` (via `--config`) | PWA generated **and** build succeeded ✅ |
| Same full config | `.ts` (default discovery) | Build OK, **no** PWA output ❌ |

**Key finding:** The *identical* configuration worked as `.mjs` but failed as `.ts`.
Because Vite transpiles/bundles a `.ts` config before importing it, plugins that rely on
`import.meta.url` to resolve their own internal assets (e.g. the Workbox service-worker
template) can resolve against the transient bundled config location rather than the real
plugin path — breaking the plugin's build hooks in this environment.

---

## 4. Solution Applied

### 4.1 Config file format
- Deleted `vite.config.ts`.
- Created **`vite.config.mjs`** with the full configuration (React plugin, `VitePWA`,
  path aliases, dev server, build options).

### 4.2 Deterministic config loading
- Updated `package.json` scripts to reference the config explicitly:
  ```json
  "build":   "tsc && vite build --config vite.config.mjs",
  "preview": "vite preview --config vite.config.mjs"
  ```

### 4.3 TypeScript project reference
- Updated `tsconfig.node.json` `include` from `vite.config.ts` to `vite.config.mjs`.

### 4.4 PWA assets & HTML
- Generated icons into `public/`: `pwa-192x192.png`, `pwa-512x512.png`,
  `apple-touch-icon.png`, and `favicon.svg`.
- `index.html`: added the apple-touch-icon and theme-color; removed the manual manifest
  link (the plugin now injects it).

---

## 5. Final Verified Output

`npm run build` (i.e. `tsc && vite build --config vite.config.mjs`) now produces:

```
PWA v0.21.2
mode      generateSW
precache  13 entries (539.45 KiB)
files generated
  dist/sw.js
  dist/sw.js.map
  dist/workbox-9c191d2f.js
  dist/workbox-9c191d2f.js.map
```

`dist/` now contains: `manifest.webmanifest`, `registerSW.js`, `sw.js`,
`workbox-9c191d2f.js`, the icons, and `index.html` with an injected
`<script id="vite-plugin-pwa:register-sw" src="/registerSW.js">`.

`npm run typecheck` passes. `npm run build` passes.

---

## 6. Root Cause

In this project/environment, `vite-plugin-pwa` failed to execute its build hooks when the
Vite configuration was loaded from a TypeScript file. Vite bundles `.ts` configs before
importing them; plugin-internal `import.meta.url`-relative asset resolution then points at
the temporary bundled config rather than the installed plugin, causing the plugin to no-op.
Loading the config as native ESM (`.mjs`) avoids this bundling step, so the plugin runs
correctly.

## 7. Prevention / Notes

- Prefer `.mjs` (or verify the `.ts` config path) when a Vite plugin silently produces no
  output, especially for plugins that generate files at build time.
- Pin the config explicitly with `--config` in scripts for deterministic builds.
