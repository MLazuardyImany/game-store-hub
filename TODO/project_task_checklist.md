# TODO.md - Game Store & Boosting Service Hub Implementation Roadmap

> Track development progress for the Game Store & Boosting Hub.
> Tick off items as they are implemented and verified.

---

## 🛠️ Phase 1: Environment & Project Setup

- [x] **Repository Setup**
  - [x] Initialize Next.js (App Router) or React project with TypeScript.
  - [x] Configure Tailwind CSS with the Dark Gaming Color Palette (`#0F172A` Slate, `#1E293B` Charcoal, `#06B6D4` Cyan, `#10B981` Emerald).
  - [x] Install essential packages (`lucide-react`, `@aws-sdk/client-s3`, `sharp`, `clsx`, `tailwind-merge`, `zod`).

- [x] **Environment Configuration (`.env.local`)**
  - [x] Set `DATABASE_URL` (PostgreSQL / MySQL).
  - [x] Set Cloudflare R2 credentials (`CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN`).
  - [x] Set `ADMIN_JWT_SECRET` & Admin credentials.
  - [x] Set Discord Webhook URL & Telegram Bot Token / Chat ID.

- [x] **Database & ORM Setup**
  - [x] Setup Prisma ORM / Drizzle ORM.
  - [x] Create initial migration scripts based on `08_data_architecture_and_erd.md`.

---

## 🗄️ Phase 2: Core Helpers & Backend Services

- [x] **Cloudflare R2 Integration (`src/lib/r2.ts`)**
  - [x] Build S3 client initializer for R2.
  - [x] Create server-side WebP image compression helper using `sharp`.
  - [x] Build upload helper function returning public Cloudflare R2 URLs (`r2_image_url`).

- [x] **Formatting & Utility Modules (`src/lib/currency.ts`, `src/lib/cta.ts`)**
  - [x] Build IDR Rupiah formatter (`Intl.NumberFormat('id-ID')`).
  - [x] Create URL encoder for WhatsApp (`wa.me/?text=...`) and Telegram (`t.me/?text=...`).
  - [x] Implement asynchronous Discord Embed & Telegram Bot Webhook trigger functions.

- [x] **Database Seed Script (`prisma/seed.ts`)**
  - [x] Seed initial game categories (Mobile Legends, Valorant, Genshin Impact, Free Fire).
  - [x] Seed dummy stock accounts with multiple screenshot URLs.
  - [x] Seed initial boosting rate matrices.

---

## 🌐 Phase 3: Guest Buyer Frontend UI

- [x] **Global Navigation & Layout**
  - [x] Header / Sticky Navbar (Logo, Game Links, Search Bar, Boosting Link).
  - [x] Footer with warranty notice, terms, and social links.

- [x] **Home & Catalog Listing (`/` and `/catalog/[game_slug]`)**
  - [x] Game Category Selector Grid (Cards with stock badges).
  - [x] Search input & Filter Bar (Min/Max Price in IDR, Status, Sort dropdown).
  - [x] Account Stock Card Grid Component:
    - [x] Display primary R2 thumbnail image.
    - [x] Display IDR price formatted (`Rp 750.000`).
    - [x] Implement Grayscale overlay + **SOLD OUT / TERJUAL** red badge for unavailable stocks.

- [x] **Account Detail Page (`/account/[stock_id]`)**
  - [x] Image Gallery with Lightbox Modal (Pinch-to-zoom & mobile swipe support).
  - [x] Structured Specs Table (Rank, Skins, Heroes, Binding status).
  - [x] Multi-channel Direct CTA Buttons ("Beli via WhatsApp", "Order Telegram", "Discord").
  - [x] Mobile Sticky Bottom CTA Bar (visible on screen resolution < 768px).
  - [x] Dynamic Open Graph Meta Tags (`og:image`, `og:title`, `og:description`) using R2 images for WhatsApp link previews.

- [x] **Interactive Boosting Calculator Page (`/boosting`)**
  - [x] Game Selector Tabs.
  - [x] Rank Selector dropdowns (Start Tier $\rightarrow$ Target Tier).
  - [x] Add-ons checkboxes (Express service +15%, Request Hero +10%, Mabar +20%).
  - [x] Real-time IDR Price calculation logic.
  - [x] "Pesan Joki via WA" CTA button with pre-filled encoded order details.

---

## 🔐 Phase 4: Admin Dashboard (`/admin`)

- [x] **Admin Authentication**
  - [x] Protected Login Page (`/admin/login`) with Rate Limiting (max 5 attempts per 15 min).
  - [x] JWT / Session authentication middleware protecting `/admin/*` routes.

- [x] **Stock Account Management (`/admin/accounts`)**
  - [x] Stock Account List Table with Quick Status Toggle (`READY` $\leftrightarrow$ `SOLD OUT`).
  - [x] Create / Edit Stock Form:
    - [x] Dynamic Key-Value builder for specs (`Level`, `Skins`, `Win Rate`).
    - [x] Drag-and-drop Multi-Image Upload field directly pushing WebP images to Cloudflare R2.
    - [x] Set Primary Thumbnail selector.

- [x] **Boosting Rate & Category Management**
  - [x] CRUD interface for Game Categories & Logos.
  - [x] Pricing Matrix editor for boosting rates per tier.

- [x] **Inquiry Click Analytics (`/admin/analytics`)**
  - [x] Basic log counter showing which stock accounts received the most CTA button clicks.

---

## 🧪 Phase 5: Testing, QA & Polish

- [ ] **Acceptance Criteria Verification (AC-01 to AC-10)**
  - [ ] Verify guest catalog navigation without login requirement.
  - [ ] Test mobile responsiveness down to 360px screen width.
  - [ ] Test WhatsApp direct link redirect on actual mobile devices.
  - [ ] Verify Discord Embed and Telegram Bot notifications dispatch correctly when CTA buttons are clicked.
  - [ ] Check Cloudflare R2 bucket storage usage and WebP image delivery speeds.

- [ ] **Performance & Security Audit**
  - [x] Sanitize all admin form inputs with Zod schemas.
  - [ ] Verify PageSpeed / Lighthouse performance score (>90 on Mobile).

---

## 🚀 Phase 6: Deployment

- [ ] Deploy Web Application to Vercel / Render / VPS.
- [ ] Bind custom domain and SSL certificate.
- [ ] Test production database connections and environment variables.