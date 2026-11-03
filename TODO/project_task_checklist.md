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

- [ ] **Database & ORM Setup**
  - [ ] Setup Prisma ORM / Drizzle ORM.
  - [ ] Create initial migration scripts based on `08_data_architecture_and_erd.md`.

---

## 🗄️ Phase 2: Core Helpers & Backend Services

- [ ] **Cloudflare R2 Integration (`src/lib/r2.ts`)**
  - [ ] Build S3 client initializer for R2.
  - [ ] Create server-side WebP image compression helper using `sharp`.
  - [ ] Build upload helper function returning public Cloudflare R2 URLs (`r2_image_url`).

- [ ] **Formatting & Utility Modules (`src/lib/currency.ts`, `src/lib/cta.ts`)**
  - [ ] Build IDR Rupiah formatter (`Intl.NumberFormat('id-ID')`).
  - [ ] Create URL encoder for WhatsApp (`wa.me/?text=...`) and Telegram (`t.me/?text=...`).
  - [ ] Implement asynchronous Discord Embed & Telegram Bot Webhook trigger functions.

- [ ] **Database Seed Script (`prisma/seed.ts`)**
  - [ ] Seed initial game categories (Mobile Legends, Valorant, Genshin Impact, Free Fire).
  - [ ] Seed dummy stock accounts with multiple screenshot URLs.
  - [ ] Seed initial boosting rate matrices.

---

## 🌐 Phase 3: Guest Buyer Frontend UI

- [ ] **Global Navigation & Layout**
  - [ ] Header / Sticky Navbar (Logo, Game Links, Search Bar, Boosting Link).
  - [ ] Footer with warranty notice, terms, and social links.

- [ ] **Home & Catalog Listing (`/` and `/catalog/[game_slug]`)**
  - [ ] Game Category Selector Grid (Cards with stock badges).
  - [ ] Search input & Filter Bar (Min/Max Price in IDR, Status, Sort dropdown).
  - [ ] Account Stock Card Grid Component:
    - [ ] Display primary R2 thumbnail image.
    - [ ] Display IDR price formatted (`Rp 750.000`).
    - [ ] Implement Grayscale overlay + **SOLD OUT / TERJUAL** red badge for unavailable stocks.

- [ ] **Account Detail Page (`/account/[stock_id]`)**
  - [ ] Image Gallery with Lightbox Modal (Pinch-to-zoom & mobile swipe support).
  - [ ] Structured Specs Table (Rank, Skins, Heroes, Binding status).
  - [ ] Multi-channel Direct CTA Buttons ("Beli via WhatsApp", "Order Telegram", "Discord").
  - [ ] Mobile Sticky Bottom CTA Bar (visible on screen resolution < 768px).
  - [ ] Dynamic Open Graph Meta Tags (`og:image`, `og:title`, `og:description`) using R2 images for WhatsApp link previews.

- [ ] **Interactive Boosting Calculator Page (`/boosting`)**
  - [ ] Game Selector Tabs.
  - [ ] Rank Selector dropdowns (Start Tier $\rightarrow$ Target Tier).
  - [ ] Add-ons checkboxes (Express service +15%, Request Hero +10%, Mabar +20%).
  - [ ] Real-time IDR Price calculation logic.
  - [ ] "Pesan Joki via WA" CTA button with pre-filled encoded order details.

---

## 🔐 Phase 4: Admin Dashboard (`/admin`)

- [ ] **Admin Authentication**
  - [ ] Protected Login Page (`/admin/login`) with Rate Limiting (max 5 attempts per 15 min).
  - [ ] JWT / Session authentication middleware protecting `/admin/*` routes.

- [ ] **Stock Account Management (`/admin/accounts`)**
  - [ ] Stock Account List Table with Quick Status Toggle (`READY` $\leftrightarrow$ `SOLD OUT`).
  - [ ] Create / Edit Stock Form:
    - [ ] Dynamic Key-Value builder for specs (`Level`, `Skins`, `Win Rate`).
    - [ ] Drag-and-drop Multi-Image Upload field directly pushing WebP images to Cloudflare R2.
    - [ ] Set Primary Thumbnail selector.

- [ ] **Boosting Rate & Category Management**
  - [ ] CRUD interface for Game Categories & Logos.
  - [ ] Pricing Matrix editor for boosting rates per tier.

- [ ] **Inquiry Click Analytics (`/admin/analytics`)**
  - [ ] Basic log counter showing which stock accounts received the most CTA button clicks.

---

## 🧪 Phase 5: Testing, QA & Polish

- [ ] **Acceptance Criteria Verification (AC-01 to AC-10)**
  - [ ] Verify guest catalog navigation without login requirement.
  - [ ] Test mobile responsiveness down to 360px screen width.
  - [ ] Test WhatsApp direct link redirect on actual mobile devices.
  - [ ] Verify Discord Embed and Telegram Bot notifications dispatch correctly when CTA buttons are clicked.
  - [ ] Check Cloudflare R2 bucket storage usage and WebP image delivery speeds.

- [ ] **Performance & Security Audit**
  - [ ] Sanitize all admin form inputs with Zod schemas.
  - [ ] Verify PageSpeed / Lighthouse performance score (>90 on Mobile).

---

## 🚀 Phase 6: Deployment

- [ ] Deploy Web Application to Vercel / Render / VPS.
- [ ] Bind custom domain and SSL certificate.
- [ ] Test production database connections and environment variables.