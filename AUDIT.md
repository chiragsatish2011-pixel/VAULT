# AUDIT.md: VAULT Architecture & Codebase Audit

**Date:** November 11, 2026  
**Auditor:** Antigravity Engineering  
**Project:** VAULT (`https://vault-showbook.vercel.app`)  
**Repository:** `https://github.com/chiragsatish2011-pixel/VAULT.git`

---

## 1. Executive Summary & Inventory

The existing repository (an iteration of "Showbook" / "Showcase") was designed around a desktop-heavy, experimental showcase with 3D tilted card stacks (`CardStackHero3D.tsx`), multi-level folder dossiers (`ArchivalDossierView.tsx`, `OpenFileDetail.tsx`), and a dynamic route admin gate (`/[adminPath]`).

While it contained high-quality seed metadata and 27 pre-captured site images (`public/captures/*.webp`), the underlying architecture suffers from fundamental incompatibilities with Vercel's serverless runtime, security vulnerabilities (leaked fallback passkeys and hardcoded secrets), and UI complexity that contradicts the Apple design language.

### Current Tech Stack
- **Framework**: Next.js 14.2.24 (App Router) + React 18.3.1 + TypeScript 5.5.2
- **Styling**: Tailwind CSS 3.4.4
- **ORM / Storage**: Prisma 5.16.1 with SQLite (`prisma/vault.db`)
- **Animation / Scripting**: Framer Motion 11.15, Playwright 1.64, Shiki 1.26, Mermaid 10.9
- **Auth**: Custom bcrypt + SQLite-stored session tokens

---

## 2. Leaked Secrets & Security Vulnerabilities

> [!CAUTION]
> **Action Required**: The following credentials and secrets were found hardcoded in the codebase, configuration files, and test files.

### Identified Exposures
1. **Hardcoded Fallback Passphrase Hash & Plaintext Password**:
   - Location: `src/lib/auth.ts` (Line 10 & 36)
   - Value: `DEFAULT_PASSPHRASE_HASH = "$2a$10$eGoTwEQOdT6wQbHE0hNrPezH6I51CjnTkDO9b/j7uRBohwqyGuxgm"`
   - Comment in code revealed plaintext: `"precomputed bcrypt hash of 'vault-master-key'"`
   - Location: `tests/auth.test.ts` (Line 23 & 30) explicitly tested and authenticated against `"vault-master-key"`.
   - Location: `docker-compose.yml` (Line 15-16) hardcoded:
     - `ADMIN_PASSPHRASE_HASH: $2a$10$eGoTwEQOdT6wQbHE0hNrPezH6I51CjnTkDO9b/j7uRBohwqyGuxgm`
     - `ADMIN_SESSION_SECRET: vault-production-secret-min-32-chars-length`
   - Location: `.env.example` (Line 6) published the active bcrypt hash.
2. **Exposure of `.env.production`**:
   - `.env.production` was tracked in git, setting `DATABASE_URL="file:./vault.db"`.
3. **Database-backed Session Persistence on Ephemeral Filesystem**:
   - The session token was stored in SQLite table `AdminSession`. On Vercel, serverless instances do not share local filesystem state, causing random session invalidations, database lock errors (`SQLITE_BUSY`), or read-only filesystem crashes (`EROFS`).

### Remediation Steps
1. **Remove all fallback hashes and plaintext references**: Completely remove `DEFAULT_PASSPHRASE_HASH` and `vault-master-key`.
2. **Stateless JWT Sessions**: Replace database sessions with signed, tamper-proof JSON Web Tokens (`jose`) stored in `httpOnly; Secure; SameSite=Strict` cookies signed by `SESSION_SECRET`.
3. **Hash Generation Tooling**: Provide `scripts/hash-passkey.mjs` using `scrypt` / `bcrypt` so the passkey is never checked into git or transmitted.
4. **Environment Sanitation**: Ensure `.env*` is fully covered in `.gitignore`.
5. **Rotate Credentials**: If `"vault-master-key"` was ever used on any live deployment, the admin must generate a new passkey immediately and set `ADMIN_PASSKEY_HASH` and `SESSION_SECRET` in the Vercel Dashboard.

---

## 3. What Works, What Is Broken, and Dead Code

| Component / Subsystem | Status | Assessment & Remediation |
| :--- | :--- | :--- |
| **Project Seed Data** (`src/lib/fallback-projects.ts`) | **Working (Keep)** | Excellent catalog of 27 production projects built by `chiragsatish2011-pixel`, with live URLs, descriptions, slugs, and tags. Will be used as the migration seed. |
| **Existing WebP Captures** (`public/captures/*.webp`) | **Working (Keep)** | High-resolution 16:9/16:10 screenshots already captured for all 27 projects. Can be served locally and uploaded to Vercel Blob. |
| **SSRF Guard Logic** (`src/lib/ssrf-guard.ts`) | **Partially Working (Refactor)** | Good foundation with DNS resolution, IPv4/IPv6 private block checks, and protocol validation. Needs enhancement for redirect loops and URL credential stripping. |
| **SQLite / Prisma Storage** (`prisma/schema.prisma`, `db.ts`) | **Broken on Vercel (Replace)** | Vercel's serverless runtime is ephemeral and read-only. SQLite creates build prerendering failures and cannot persist user additions. Replaced by Upstash Redis (metadata) + Vercel Blob (images) with local dev fallback. |
| **Admin Route Structure** (`src/app/[adminPath]`) | **Broken / Divergent (Replace)** | Relied on a dynamic path slug `[adminPath]` and a hidden shortcut (`Ctrl+Shift+L` / double-click 404). Brief requires explicit `/chirag` route with a clean passkey form and dashboard. |
| **Card Deck & Folder UI** (`CardStackHero3D.tsx`, `ArchivalDossierView.tsx`) | **Broken / Non-compliant (Replace)** | Tilted card physics, fake metallic chips, and skeuomorphic file folders conflict directly with the required Apple-style zero-gap, zero-border, edge-to-edge screen wall. |
| **Dead Code** (`CinemascopeStageView.tsx`, `RenderedDevicesView.tsx`, `ReverseDocsView.tsx`, `ArchitectureView.tsx`, etc.) | **Dead Code (Remove)** | Leftover experimental components and heavy AST analyzers. Cleanly prune to minimize bundle size. |

---

## 4. Proposed Target Architecture

### 4.1 Data & Storage Architecture (Vercel Production Ready)
1. **Primary Metadata Store — Upstash Redis**:
   - Fast, serverless-native key-value store with global low latency.
   - Key `vault:sites`: JSON array / hash of site objects:
     `{ id, name, url, description, thumbnail1440, thumbnail800, thumbnail400, blurDataURL, order, hidden, createdAt, updatedAt }`.
   - **Local Development Fallback**: If `UPSTASH_REDIS_REST_URL` is unset, automatically falls back to an in-memory/local JSON cache initialized from `FALLBACK_PROJECTS`, enabling instantaneous local development without cloud setup.
2. **Image Storage — Vercel Blob**:
   - Thumbnails uploaded to `@vercel/blob` returning permanent CDN URLs (`https://...public.blob.vercel-storage.com/...`).
   - Local development fallback: Saves to `public/captures` if `@vercel/blob` token is missing.
3. **Instant Caching & Revalidation**:
   - Next.js App Router cache with `revalidateTag("vault-sites")` and on-demand `revalidatePath("/")`. Adding or modifying a site in `/chirag` updates the public grid within milliseconds.

### 4.2 Frontend Architecture (Apple-Style Gallery)
1. **Typography & Foundations**:
   - System font stack: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif`.
   - Apple dark mode (`#000000` background) and light mode (`#fbfbfd` background) following system preference (`prefers-color-scheme`).
   - Apple Accent Blue: `#0071e3` (Light) / `#2997ff` (Dark).
   - Translucent frosted top navigation bar with `backdrop-filter: blur(20px) saturate(180%)`, visible only after scrolling past the hero.
2. **Hero Section**:
   - Ultra-clean "VAULT" wordmark with tight negative letter-spacing (`tracking-[-0.03em]`).
   - Single-line confident tagline: *"A curated collection of websites and digital products built by Chirag S."*
   - Scroll-linked scale, fade, and upward transition into the grid.
3. **The Edge-to-Edge Screen Wall (Grid)**:
   - CSS Grid with **`gap: 0`**, **`border: 0`**, **`border-radius: 0`**, **`outline: 0`**.
   - Strict responsive columns matching the brief:
     - `< 640px` (Mobile): **1 column**
     - `640px – 1023px`: **2 columns**
     - `1024px – 1535px`: **3 columns**
     - `1536px – 1919px`: **4 columns**
     - `1920px – 2559px`: **5 columns**
     - `≥ 2560px` (Ultrawide): **6 columns**
   - Tile aspect ratio strictly **16:10** (`aspect-[16/10]`).
   - On hover/focus/tap: Sleek dark gradient overlay (`bg-gradient-to-t from-black/90 via-black/40 to-transparent`) slides up displaying the site title, description, and `"Visit ↗"`.
   - Real `<a href target="_blank" rel="noopener noreferrer">` tags, keyboard accessible with focus visible.
4. **Motion & Smooth Scroll**:
   - `lenis` for 60fps momentum scrolling, disabled when `prefers-reduced-motion` is active.
   - CSS scroll-driven animations with IntersectionObserver fallback.
   - `content-visibility: auto` on offscreen rows to ensure 60fps scrolling on lower-end devices.

### 4.3 Headless Screenshot Capture Architecture
- **Route Handler**: `src/app/api/admin/capture/route.ts` (Node.js runtime, `maxDuration = 60`).
- **Browser**: `puppeteer-core` with `@sparticuz/chromium`.
- **Flow**:
  1. SSRF Guard checks URL against loopback, private ranges, metadata APIs.
  2. Launch Chromium with flags (`--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`).
  3. Viewport set to `1440x900` @ 1x.
  4. Navigate with `waitUntil: "networkidle2"` (timeout: 15s).
  5. **`await sleep(5000)`** for animations, typography, and lazy assets to settle.
  6. Attempt to dismiss common cookie consent dialogs (`button[id*="cookie"], button[class*="consent"], button[aria-label*="accept"]`).
  7. Screenshot above-the-fold (`1440x900`).
  8. Extract `<title>`, `<meta name="description">`, and favicon.
  9. Optimize with `sharp`: generate 1440w, 800w, 400w WebP + base64 blur placeholder.
  10. Store in Vercel Blob (or local fallback), update Upstash Redis, trigger ISR revalidation.
- **Fallback CLI**: Provide `scripts/capture-site.mjs` (`npm run capture -- <url>`) allowing offline/local capture using local Chromium.

### 4.4 Authentication & Security Architecture
- **Admin Entrypoint**: `/chirag` renders a minimalist passkey form.
- **Auth Endpoint**: `POST /api/auth/login` checks passkey against `ADMIN_PASSKEY_HASH` using `bcrypt.compare` (constant time).
- **Session**: Issues a signed JWT using `jose` with `HS256`, stored in `httpOnly; Secure; SameSite=Strict; Path=/` cookie with 8-hour expiry.
- **Middleware**: `src/middleware.ts` intercepts `/chirag/dashboard` and `/api/admin/*`, validating the JWT signature and expiration.
- **Rate Limiting**: Sliding window rate limiter (5 failed attempts per 15 min per IP) with exponential backoff via Redis/memory.
- **Headers**: Strict CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 5. Migration & Execution Plan

1. **Step 1 — Environment & Dependency Setup**:
   Install `lenis`, `jose`, `@vercel/blob`, `@upstash/redis`, `puppeteer-core`, `@sparticuz/chromium`, `sharp`. Remove unused heavy packages.
2. **Step 2 — Security & Auth Layer**:
   Create `scripts/hash-passkey.mjs`. Implement `src/lib/auth-jwt.ts`, `src/middleware.ts`, and the `/chirag` login & dashboard routes.
3. **Step 3 — Data Layer & Seed Migration**:
   Implement `src/lib/sites-store.ts` supporting Upstash Redis with local file fallback. Write a seed script that imports `FALLBACK_PROJECTS`.
4. **Step 4 — Headless Capture Pipeline**:
   Build `src/app/api/admin/capture/route.ts` with SSRF guard, Puppeteer Chromium, 5s settle wait, and Sharp WebP generation.
5. **Step 5 — Apple-Style Frontend Rebuild**:
   Build zero-gap, responsive 1–6 column grid, Apple typography, system light/dark theme, Lenis smooth scroll, scroll-triggered animations.
6. **Step 6 — Verification & Final Test Report**:
   Verify responsive column counts (390px to 2560px), 6x CPU throttled 60fps performance, SSRF protection, passkey security, and Vercel build output.
