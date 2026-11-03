# SKILLS.md - Technical Competencies & Domain Knowledge

This document specifies the domain expertise, technical capabilities, and code generation routines required by developers and AI agents (such as DeepSeek, Claude, Cursor, or Windsurf) working on the Game Store & Boosting Service Hub.

---

## 1. Domain & Business Logic Expertise

### 🎮 Online Gaming & Account Terminology
* **Binding & Credential Protocols:** Deep understanding of game account binding types (e.g., *Moonton Unbind*, *Google All Role Ready*, *Riot ID Change Available*, *Hoyoverse Clean Spec*, *FB Soft/Hard Lock*).
* **Rank & Tier Systems:** Familiarity with competitive ranking ladders across target titles:
  * *Mobile Legends:* Warrior $\rightarrow$ Elite $\rightarrow$ Master $\rightarrow$ Grandmaster $\rightarrow$ Epic $\rightarrow$ Legend $\rightarrow$ Mythic $\rightarrow$ Mythical Glory $\rightarrow$ Mythical Immortal.
  * *Valorant:* Iron $\rightarrow$ Bronze $\rightarrow$ Silver $\rightarrow$ Gold $\rightarrow$ Platinum $\rightarrow$ Diamond $\rightarrow$ Ascendant $\rightarrow$ Immortal $\rightarrow$ Radiant.
  * *Genshin Impact / Star Rail:* Adventure Rank (AR), Trailblaze Level, 5-Star Character / Weapon counts.

### 💰 Indonesian E-Commerce & Currency Handling
* Standard formatting using Indonesian Rupiah (`IDR` / `Rp`) via native `Intl.NumberFormat('id-ID')`.
* Direct-to-Chat buyer journey conventions popular in Southeast Asian gaming markets (WhatsApp, Telegram, Discord).

---

## 2. Core Engineering Skills

### 🎨 1. Modern Dark Gaming Frontend & Mobile UX
* **Tailwind CSS Styling:** Mastery of custom slate/obsidian color palettes (`#0F172A`, `#1E293B`), neon accents (`#06B6D4`, `#10B981`), and responsive CSS grids.
* **Mobile-First Touch UI:** Implementing touch-swipe galleries, pinch-to-zoom Lightbox modals, and fixed/sticky bottom CTA bars for 360px+ viewport widths.
* **Grayscale Visual Effects:** Applying CSS filters (`grayscale(100%)`) and badge overlays for `SOLD OUT / TERJUAL` stock cards.

### ☁️ 2. Cloudflare R2 & Media Optimization Pipeline
* **S3 Protocol SDK (`@aws-sdk/client-s3`):** Initializing S3 clients for Cloudflare R2 endpoints with Zero Egress fees.
* **Image Compression with Sharp:** Server-side transformation of uploaded game screenshots into optimized **WebP format** (quality 80%, max dimension 1920px) before dispatching to R2 storage.

### ⚡ 3. API & Asynchronous Webhook Integration
* **Deep-Link Generation:** Building safe, encoded URL strings using `encodeURIComponent()` for WhatsApp (`wa.me`) and Telegram (`t.me`).
* **Non-Blocking Webhook Dispatches:** Triggering background HTTP POST requests to Discord Webhook embeds and Telegram Bot API endpoints without blocking the buyer's UI redirection.

### 🗄️ 4. Relational Database & Dynamic JSON Handling
* **Relational ORM Operations:** Writing clean queries with Prisma / Drizzle ORM for `games`, `accounts`, `account_images`, and `boosting_rates`.
* **Flexible Dynamic Specs:** Storing and querying unstructured account properties (e.g., skin counts, win rates, hero lists) using PostgreSQL `JSONB` / MySQL `JSON` fields.

---

## 3. Code Generation & Refactoring Directives for AI Agents

When tasked with generating or updating code for this project, AI Agents must demonstrate the following execution behaviors:

1. **Zero Placeholder Rule:** Never write comments like `// TODO: Implement later` or `/* rest of code */`. Write complete, runnable, and functional implementations.
2. **Strict Type Declarations:** Every module, prop, function parameter, and API response must have explicit TypeScript types or interfaces.
3. **Pure Math Functions:** Isolate boosting math calculations, percentage add-on multipliers, and currency formatting into standalone, unit-testable pure functions in `src/lib/`.
4. **Environment Safety:** Always access sensitive credentials (`CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `JWT_SECRET`, `DISCORD_WEBHOOK_URL`) strictly via process environment variables (`process.env`).