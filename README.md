# VAULT

> **An Apple-style, cinematic gallery of digital products, web applications, and interactive systems.**  
> Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lenis, Sharp, and Puppeteer.

Live Public Gallery: [https://vault-showbook.vercel.app](https://vault-showbook.vercel.app)  
Admin Management: `https://vault-showbook.vercel.app/chirag`

---

##  Visual & Architectural Highlights

- **Apple Design Language**: Pure Apple product page aesthetic with large confident typography, system light (`#fbfbfd`) / dark (`#000000`) theme, Apple blue accent (`#0071e3` / `#2997ff`), and frosted glass navigation that appears only after scrolling past the hero.
- **Edge-to-Edge Screen Wall**: CSS grid of tiles with **zero gap, zero border, zero border-radius, zero outline**. Tiles touch edge-to-edge as a continuous wall of screens with 16:10 aspect ratio.
- **Strict Responsive Columns**:
  - `< 640px` (Mobile): **1 column**, always
  - `640px – 1023px`: **2 columns**
  - `1024px – 1535px`: **3 columns**
  - `1536px – 1919px`: **4 columns**
  - `1920px – 2559px`: **5 columns**
  - `≥ 2560px` (Ultrawide): **6 columns**
- **Tile Interaction**: Full-bleed WebP thumbnail (`object-fit: cover`). On hover/focus (and tap on mobile), a smooth gradient overlay slides up revealing the title, description, and "Visit ↗". Each tile is a keyboard-accessible `<a href target="_blank">` with high-contrast focus rings.
- **Motion & Smooth Scroll**: Lenis smooth scroll engine automatically disabled when `prefers-reduced-motion` is active. Hero parallax, scale, and fade linked to scroll progress.
- **Serverless Production Architecture**: Built specifically for Vercel's ephemeral runtime:
  - **Metadata Store**: Upstash Redis (with instant fallback to local JSON cache `public/sites-cache.json` for zero-setup local dev).
  - **Image Storage**: Vercel Blob (public CDN URLs, with local fallback in `public/captures/`).
  - **On-Demand Revalidation**: Adding or updating a site in `/chirag` instantly invalidates the Next.js cache via `revalidatePath("/")`.

---

## 🔑 Environment Variables

Configure these in your local `.env.local` or in the Vercel Project Settings:

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `ADMIN_PASSKEY_HASH` | Bcrypt hash of your admin passkey. Never commit plaintext! | **Yes** | `$2a$12$...` |
| `SESSION_SECRET` | 32+ character cryptographically random key used to sign JWT session cookies. | **Yes** | `min-32-chars-long-random-secret...` |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for cloud metadata storage. | Optional (local dev fallback) | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN`| Upstash Redis REST Token. | Optional (local dev fallback) | `AZ...` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for cloud thumbnail storage. | Optional (local dev fallback) | `vercel_blob_rw_...` |

> [!NOTE]  
> If Upstash Redis or Vercel Blob tokens are omitted, the application automatically uses local files (`public/sites-cache.json` and `public/captures/`), enabling zero-setup local development!

---

## 🛠️ Setup & Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/chiragsatish2011-pixel/VAULT.git
cd VAULT
npm install
```

### 2. Generate Your Admin Passkey Hash
Run the included standalone security utility:
```bash
npm run hash-passkey "your-super-secret-password"
```

Copy the generated hash into your `.env.local`:
```env
ADMIN_PASSKEY_HASH="$2a$12$..."
SESSION_SECRET="your-custom-secure-random-string-at-least-32-characters"
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public gallery, or [http://localhost:3000/chirag](http://localhost:3000/chirag) for admin management.

---

## 📸 Adding Sites

### Method A: Admin Dashboard (`/chirag`)
1. Navigate to `/chirag`.
2. Enter your admin passkey to sign in. A secure, signed JWT session cookie (`httpOnly; Secure; SameSite=Strict`, 8h expiry) is issued.
3. In the dashboard, enter the URL of any website you built (e.g. `https://my-app.vercel.app`).
4. Click **"Capture & Add Site"**.
5. The server loads the site in headless Chromium, **waits 5 seconds** for fonts, hero videos, and entrance animations to settle, captures the above-the-fold 1440x900 viewport, generates multi-size WebP thumbnails and blur placeholders with Sharp, saves to Vercel Blob/Redis, and revalidates the public gallery in real time!

### Method B: Offline CLI Capture
You can also capture and add sites directly from your terminal:
```bash
npm run capture -- https://my-app.vercel.app "Project Title" "Short project description"
```

---

## 🔒 Security Architecture

1. **Passkey Protection**: No hardcoded passwords or fallback hashes exist in the codebase. Admin verification compares against `ADMIN_PASSKEY_HASH` using constant-time bcrypt comparison.
2. **Stateless JWT Sessions**: Sessions are cryptographically signed using `jose` with HS256, strictly validated by `src/middleware.ts` and re-verified in every route handler.
3. **Brute-Force Rate Limiting**: Max 5 failed attempts per 15 minutes per IP. Backed by Upstash Redis with memory fallback.
4. **SSRF Guard**: URL capture rigorously blocks loopback (`127.0.0.1`), link-local (`169.254.169.254`), private IP subnets (RFC 1918), non-HTTP protocols, and URLs with embedded credentials.
5. **SEO & Indexing Protection**: `/chirag` has `noindex, nofollow`, is omitted from `robots.txt` and `sitemap.xml`, and returns an unlinked passkey gate to unauthorized visitors.

---

## 🚀 Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com/new), import your `VAULT` repository.
3. Under **Environment Variables**, add:
   - `ADMIN_PASSKEY_HASH`: Generated via `npm run hash-passkey`
   - `SESSION_SECRET`: Random 32+ character string
   - `UPSTASH_REDIS_REST_URL`: (Optional, from Vercel Marketplace Upstash integration)
   - `UPSTASH_REDIS_REST_TOKEN`: (Optional)
   - `BLOB_READ_WRITE_TOKEN`: (Optional, from Vercel Storage Blob tab)
4. Click **Deploy**. Vercel will build and deploy the production-ready gallery with zero errors.

---

## 🧪 Automated Test Suite

Run the full security, auth, and SSRF test suite:
```bash
npm test
```

Run Playwright responsive grid, hover, and access control verification:
```bash
node scripts/verify-apple-gallery.cjs
```
