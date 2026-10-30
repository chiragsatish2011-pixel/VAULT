# ⚡ CHIRAG® ARCHIVAL SHOWCASE // VAULT

> **Ultra-premium, cinematic software showcase, 3D card deck & physical filing dossier.**  
> Built with Next.js 14, React 18, TailwindCSS, Framer Motion, Prisma, and Playwright automated 16:9 headless capture.

[![CI Production Verification](https://github.com/chiragsatish2011-pixel/Showcase/actions/workflows/ci.yml/badge.svg)](https://github.com/chiragsatish2011-pixel/Showcase/actions/workflows/ci.yml)
[![Vercel Deployment Ready](https://img.shields.io/badge/Vercel-Production%20Ready-black?logo=vercel)](https://vercel.com)

---

## 🌟 Key Visual & Architectural Mechanics

### 1. 3D 16:9 Cinemascope Card Deck
- **Perspective Physics:** Precision 3D transformation (`rotateY: -38deg`, `rotateX: 8deg`, `rotateZ: -2deg`) matching modern cinematic card stacks.
- **Physical Slab Depth:** 5px extruded metallic slab borders.
- **Strict Upward Lift:** Hovered card lifts straight up (`-68px`) with **zero wave effect**—neighboring cards remain completely still.
- **Giant Wordmark Behind:** Bold wordmark positioned above the card baseline for clear visibility.
- **Liquid Blast Modal:** Responsive inspect modal with device views (Desktop, Tablet, Mobile) and guidance for mobile users.

### 2. Physical Die-Cut Filing Folder Stack
- **Die-Cut Geometry:** Authentic SVG polygon tab paths: Left (`|‾\`), Center (`/‾\`), and Right (`/‾|`).
- **Interactive Expansion:** Hovering over any folder expands its revealed body to 140px, with the bottom royal blue base folder active by default.
- **Physical Open Envelope View:** Clicking any tab pulls the folder out of the stack, expanding it into a full envelope document reader.
- **Scroll-Triggered Binder Pages:** Flipping between repository documentation, file trees, and live code via trackpad / mousewheel scrolling or right-side tab bookmarks.
- **Draggable Notes Canvas:** Persistent notepad where users can write notes and move papers anywhere across the viewport.
- **Fast-Forward Return:** Smooth fast-forward animation packing papers back into the sleeve and docking the folder into the deck.

### 3. Automated Website Ingestion & Banner System
- **GitHub Ingestion (`/api/sync`):** Input any GitHub repository link (e.g. `https://github.com/chiragsatish2011-pixel/EditorOps`).
- **Automated 16:9 Screenshot Capture:** Automated Playwright headless chromium captures the live deployment at `1920x1080`, encodes to optimized `.webp`, and saves to `public/captures/${slug}.webp`.
- **GitHub Actions & Webhook Integration (`/api/webhooks/github`):** Push events automatically refresh commit telemetry and re-capture the 16:9 banner without human intervention.
- **In-App Modal:** One-click "+ Add Website" modal directly inside the navigation bar.

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/chiragsatish2011-pixel/Showcase.git
cd Showcase

# Install dependencies
npm install

# Generate Prisma client and initialize database
npm run db:generate
npm run db:push

# Start production-ready development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the showcase.

---

## ☁️ Deploying to Vercel (Production)

This repository is pre-configured for **zero-config Vercel deployment**:

1. **Import Repository in Vercel:** Connect your GitHub account and select this repository.
2. **Build Settings:** Pre-configured via `vercel.json` and `package.json`:
   - Framework Preset: `Next.js`
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`
3. **Environment Variables:**
   ```env
   DATABASE_URL="file:./prisma/vault.db"
   ADMIN_SESSION_SECRET="your-ultra-secure-random-secret"
   ```
4. **Deploy:** Click Deploy. The showcase automatically falls back to verified pre-cached assets and metadata so all 24 projects and 3D cards render immediately on edge serverless runtimes.

---

## 📡 Automated GitHub Actions Sync

To auto-update the showcase whenever you push code to any of your project repositories:

1. Copy [`.github/workflows/showcase-sync.yml`](.github/workflows/showcase-sync.yml) into your project repo.
2. Set your production showcase URL.
3. Every push to `main` will automatically trigger `/api/webhooks/github` to re-fetch the latest commit tree and re-capture the live 16:9 website banner.

---

## 🧪 Production Verification

Run the full end-to-end verification suite:

```bash
# Verify build
npm run build

# Run Playwright visual motion verification
node scripts/verify-full-motion-cycle.cjs
```

---

## 🔒 Security & Guardrails

- **Strict SSRF Guard:** Inspects all ingested URLs against private IP subnets and metadata ranges (`169.254.169.254`, `10.0.0.0/8`, `127.0.0.0/8`, etc.).
- **Content Security Policy:** Validates remote framing permissions (`X-Frame-Options`, `frame-ancestors`).
- **Zero Hallucination Guarantee:** All telemetry, commit hashes, branches, and file paths are directly grounded in verified GitHub repositories.
