# 🎮 Game Store Hub

A catalog for selling game accounts **and** a boosting (rank-up service) price calculator,
built for the Indonesian market. Buyers browse without signing up, inspect real screenshots
of each stock, calculate boosting costs in IDR in real time, and are handed off directly to
WhatsApp / Telegram / Discord with a pre-filled message.

Built with Next.js 16 (App Router), strict TypeScript, Tailwind CSS v4, PostgreSQL,
Prisma 7, and Cloudflare R2 for screenshot storage.

---

## 📸 Preview

### Landing page & catalog
![Game Store Hub landing page](docs/screenshots/landing-catalog.png)

### Stock catalog with price filters
![Account stock catalog](docs/screenshots/katalog-stok.png)

### Account detail: gallery, specs, and multi-channel CTA
![Account detail](docs/screenshots/account-detail.png)

### Real-time boosting calculator
![Boosting calculator](docs/screenshots/boosting-calculator.png)

### Admin dashboard
![Admin dashboard](docs/screenshots/admin-dashboard.png)

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Stock Catalog** | Account grid with thumbnails, IDR prices, status badges (`READY` / `BOOKED` / `SOLD`), plus game, price-range, and status filters, search, sorting, and pagination — all encoded in the URL so results are shareable. |
| **Account Detail** | Screenshot gallery with a lightbox (zoom, keyboard, swipe), a dynamic specification table (JSONB), seller notes, and a **sticky CTA bar** on mobile viewports. |
| **Direct WhatsApp / Telegram / Discord CTA** | `wa.me` / `t.me` deep links carrying a URL-encoded message with the stock ID, title, and price. Each click is logged and triggers a webhook **without blocking the buyer's redirect**. |
| **Boosting Calculator** | Pick a game, starting rank, target rank, and add-ons (Express +15%, Request Hero +10%, Play-with-booster +20%). The total updates instantly using sequential per-tier rates ordered by `rank_order`. |
| **Cloudflare R2 Integration** | Admin uploads are compressed to **WebP** (max 1920px, quality 80%) by `sharp` before being sent to R2 through the S3 SDK. The database only stores public URLs. |
| **Admin Dashboard** | Bcrypt login with HMAC sessions, rate limited to 5 attempts per 15 minutes, stock CRUD (specs builder, multi-upload, primary thumbnail), category CRUD, rank & rate editor, and CTA click analytics. |
| **Webhook Alerts** | Discord embed and Telegram Bot notifications whenever a prospective buyer presses a contact button. Delivered on a best-effort basis — a failing webhook never breaks the purchase flow. |

---

## 🧰 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | **Next.js 16** (App Router, Server Components, Route Handlers) |
| Language | **TypeScript** (strict, no implicit `any`) |
| Styling | **Tailwind CSS v4** with `@theme` design tokens (permanent dark theme) |
| Database | **PostgreSQL 18** |
| ORM | **Prisma 7** + `@prisma/adapter-pg` (driver adapter; the Rust query engine was removed in v7) |
| Object Storage | **Cloudflare R2** (`@aws-sdk/client-s3`) + `sharp` for WebP conversion |
| Validation | **Zod** (every admin input) |
| Authentication | Hand-rolled HS256 JWT + `httpOnly` cookie, Bcrypt passwords (`bcryptjs`) |
| Icons | `lucide-react` |

---

## 🚀 Installation & Local Setup

### 1. Prerequisites

- Node.js **20+** (tested on Node 24)
- A running local PostgreSQL **14+**
- A Cloudflare R2 account (optional — only needed for uploads)

### 2. Clone & install

```bash
git clone https://github.com/MLazuardyImany/game-store-hub.git
cd game-store-hub
npm install
```

### 3. Configure the environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in at least:

| Variable | Required | Example |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | `postgresql://postgres:password@localhost:5432/gamestore_db?schema=public` |
| `ADMIN_JWT_SECRET` | ✅ | random string, 32+ characters |
| `ADMIN_USERNAME` | ✅ | `admin` |
| `ADMIN_PASSWORD_HASH` | ✅ | Bcrypt hash — see the note below |
| `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` | for uploads | — |
| `DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | for notifications | — |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_TELEGRAM_USERNAME`, `NEXT_PUBLIC_DISCORD_URL` | ✅ | seller contact channels used by the CTA buttons |

> **Important when generating the password hash:** a Bcrypt hash starts with `$2b$12$…`,
> and the Next.js env loader expands `$VAR` patterns. Escape every `$` as `\$`, otherwise
> the value is read as an empty string.
>
> ```bash
> node -e "console.log(require('bcryptjs').hashSync('YourPassword', 12))"
> # then in .env.local:  ADMIN_PASSWORD_HASH="\$2b\$12\$result..."
> ```

### 4. Prepare the database

```bash
# create the database if it does not exist yet
createdb -U postgres gamestore_db
# Windows: & "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres gamestore_db

# apply migrations and load sample data
npm run db:deploy
npm run db:seed
```

### 5. Run the app

```bash
npm run dev
```

- Storefront: <http://localhost:3000>
- Catalog: <http://localhost:3000/catalog>
- Boosting calculator: <http://localhost:3000/boosting>
- Admin: <http://localhost:3000/admin/login>

---

## 📁 Project Structure

```
game-store-hub/
├── prisma/
│   ├── schema.prisma            # 6 models + 2 enums (data source of truth)
│   ├── migrations/              # SQL migrations (applied with db:deploy)
│   └── seed.ts                  # idempotent sample data
├── public/
│   └── mock/                    # placeholder SVG assets (stand-ins for R2)
├── docs/
│   └── screenshots/             # documentation images referenced by this README
├── scripts/
│   ├── capture-screenshots.mjs  # automated screenshots (Playwright)
│   ├── capture-admin.mjs        # dashboard screenshot (requires login)
│   ├── archify-serve.mjs        # static server for architecture diagrams
│   └── archify-watch.mjs        # architecture drift watcher
├── src/
│   ├── app/
│   │   ├── page.tsx                     # landing page
│   │   ├── catalog/                     # /catalog and /catalog/[game_slug]
│   │   ├── account/[stock_id]/          # account detail
│   │   ├── boosting/                    # boosting calculator
│   │   ├── admin/                       # login + dashboard (protected)
│   │   └── api/v1/                      # public and admin route handlers
│   ├── components/
│   │   ├── layout/                      # header & footer
│   │   ├── catalog/                     # cards, filters, gallery, CTA
│   │   ├── boosting/                    # calculator
│   │   └── admin/                       # stock form, status toggle, logout
│   ├── lib/                             # r2, currency, cta, webhook, auth, queries, boosting
│   └── generated/prisma/                # generated Prisma Client (not committed)
├── prisma7.config.ts            # Prisma CLI config (reads .env.local)
├── next.config.ts               # remotePatterns for R2 images
└── package.json
```

---

## 📜 npm Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy` | Apply existing migrations |
| `npm run db:seed` | Load sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run arch:serve` / `arch:watch` | Architecture diagram dashboard and drift watcher |

---

## 🗄️ Data Model

`games` → `ranks` → `boosting_rates` (per-tier rates referencing ranks through foreign keys)
`games` → `accounts` → `account_images`, and `accounts` → `inquiry_logs`
`admin_users` stores admin credentials.

Prices use `DECIMAL`, account specifications are stored as `JSONB`, and the enums are
`AccountStatus` (`READY` / `BOOKED` / `SOLD`) and `InquiryChannel`
(`WHATSAPP` / `TELEGRAM` / `DISCORD`).

---

## 🔐 Security Notes

- Buyers need **no account**; only `/admin` is protected by a session.
- Every admin input is validated with Zod on the server, not only in the browser.
- Session cookies are `httpOnly` + `sameSite=lax` and become `secure` in production.
- `.env.local`, `node_modules`, `.next`, and the generated Prisma Client are never committed.

---

## 📄 License

Private project.
