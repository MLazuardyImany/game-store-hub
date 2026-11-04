# 🎮 Game Store Hub

Katalog penjualan akun game **dan** kalkulator jasa boosting (joki) untuk pasar Indonesia.
Pembeli menjelajah tanpa perlu mendaftar, melihat screenshot asli tiap stok, menghitung
estimasi biaya joki dalam Rupiah secara *real-time*, lalu diarahkan langsung ke
WhatsApp / Telegram / Discord dengan pesan yang sudah terisi otomatis.

Dibangun dengan Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, PostgreSQL,
Prisma 7, dan Cloudflare R2 untuk penyimpanan screenshot.

---

## 📸 Preview

### Landing page & katalog
![Landing page Game Store Hub](docs/screenshots/landing-catalog.png)

### Katalog stok dengan filter harga
![Katalog stok akun](docs/screenshots/katalog-stok.png)

### Detail akun: galeri, spesifikasi, dan CTA multi-kanal
![Detail akun](docs/screenshots/account-detail.png)

### Kalkulator boosting real-time
![Kalkulator boosting](docs/screenshots/boosting-calculator.png)

### Dashboard admin
![Dashboard admin](docs/screenshots/admin-dashboard.png)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
| :--- | :--- |
| **Katalog Stok** | Grid akun dengan thumbnail, harga IDR, badge status (`READY` / `BOOKED` / `TERJUAL`), filter game, rentang harga, status, pencarian, sorting, dan paginasi — semuanya lewat URL agar bisa dibagikan. |
| **Detail Akun** | Galeri screenshot dengan lightbox (zoom, keyboard, swipe), tabel spesifikasi dinamis (JSONB), catatan penjual, serta **sticky CTA bar** di layar mobile. |
| **Direct CTA WhatsApp / Telegram / Discord** | Deep-link `wa.me` / `t.me` dengan pesan ter-encode berisi ID stok, judul, dan harga. Klik CTA tercatat di database lalu memicu webhook **tanpa menahan redirect** pembeli. |
| **Boosting Calculator** | Pilih game, rank awal, rank target, dan add-on (Express +15%, Request Hero +10%, Mabar +20%). Total dihitung seketika memakai penjumlahan tarif sekuensial berbasis `rank_order`. |
| **Cloudflare R2 Integration** | Upload admin dikompres ke **WebP** (maks 1920px, kualitas 80%) oleh `sharp` sebelum dikirim ke R2 via S3 SDK. Database hanya menyimpan URL publik. |
| **Admin Dashboard** | Login ber-Bcrypt + sesi HMAC, rate limit 5 percobaan/15 menit, CRUD stok (specs builder, multi-upload, pemilihan thumbnail utama), CRUD kategori, editor rank & tarif, serta analitik klik CTA. |
| **Webhook Alerts** | Notifikasi Discord Embed dan Telegram Bot setiap kali calon pembeli menekan tombol pesan. Dikirim *best effort* — kegagalan webhook tidak pernah menggagalkan transaksi. |

---

## 🧰 Tech Stack

| Lapisan | Teknologi |
| :--- | :--- |
| Framework | **Next.js 16** (App Router, Server Components, Route Handlers) |
| Bahasa | **TypeScript** (strict, tanpa `any` implisit) |
| Styling | **Tailwind CSS v4** dengan design token `@theme` (tema gelap permanen) |
| Database | **PostgreSQL 18** |
| ORM | **Prisma 7** + `@prisma/adapter-pg` (driver adapter, query engine Rust sudah dihapus) |
| Object Storage | **Cloudflare R2** (`@aws-sdk/client-s3`) + `sharp` untuk konversi WebP |
| Validasi | **Zod** (semua input admin) |
| Autentikasi | JWT HS256 buatan sendiri + cookie `httpOnly`, password Bcrypt (`bcryptjs`) |
| Ikon | `lucide-react` |

---

## 🚀 Panduan Instalasi & Setup Lokal

### 1. Prasyarat

- Node.js **20+** (diuji pada Node 24)
- PostgreSQL **14+** yang berjalan lokal
- Akun Cloudflare R2 (opsional — hanya diperlukan untuk fitur upload)

### 2. Clone & install

```bash
git clone <url-repo-anda> game-store-hub
cd game-store-hub
npm install
```

### 3. Siapkan environment

```bash
cp .env.example .env.local
```

Buka `.env.local` lalu isi minimal:

| Variabel | Wajib | Contoh |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | `postgresql://postgres:password@localhost:5432/gamestore_db?schema=public` |
| `ADMIN_JWT_SECRET` | ✅ | string acak ≥ 32 karakter |
| `ADMIN_USERNAME` | ✅ | `admin` |
| `ADMIN_PASSWORD_HASH` | ✅ | hash Bcrypt — lihat catatan di bawah |
| `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` | untuk upload | — |
| `DISCORD_WEBHOOK_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | untuk notifikasi | — |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_TELEGRAM_USERNAME`, `NEXT_PUBLIC_DISCORD_URL` | ✅ | kontak penjual untuk tombol CTA |

> **Penting saat membuat hash password:** hash Bcrypt diawali `$2b$12$…`, sedangkan
> loader env Next.js meng-expand pola `$VAR`. Tulis setiap `$` sebagai `\$`, jika tidak
> nilainya akan terbaca kosong.
>
> ```bash
> node -e "console.log(require('bcryptjs').hashSync('PasswordAnda', 12))"
> # lalu di .env.local:  ADMIN_PASSWORD_HASH="\$2b\$12\$hasil..."
> ```

### 4. Siapkan database

```bash
# buat database (jika belum ada)
createdb -U postgres gamestore_db      # Windows: & "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres gamestore_db

# terapkan migrasi + isi data contoh
npm run db:deploy
npm run db:seed
```

### 5. Jalankan

```bash
npm run dev
```

- Toko: <http://localhost:3000>
- Katalog: <http://localhost:3000/catalog>
- Kalkulator boosting: <http://localhost:3000/boosting>
- Admin: <http://localhost:3000/admin/login>

---

## 📁 Struktur Folder

```
game-store-hub/
├── prisma/
│   ├── schema.prisma            # 6 model + 2 enum (sumber kebenaran data)
│   ├── migrations/              # SQL migrasi (diterapkan dengan db:deploy)
│   └── seed.ts                  # data contoh idempotent
├── public/
│   └── mock/                    # aset SVG contoh (pengganti sementara R2)
├── docs/
│   └── screenshots/             # gambar dokumentasi README
├── scripts/
│   ├── capture-screenshots.mjs  # ambil screenshot otomatis (Playwright)
│   ├── capture-admin.mjs        # screenshot dashboard (perlu login)
│   ├── archify-serve.mjs        # server statis diagram arsitektur
│   └── archify-watch.mjs        # pemantau drift arsitektur
├── src/
│   ├── app/
│   │   ├── page.tsx                     # landing page
│   │   ├── catalog/                     # /catalog dan /catalog/[game_slug]
│   │   ├── account/[stock_id]/          # detail akun
│   │   ├── boosting/                    # kalkulator joki
│   │   ├── admin/                       # login + dashboard (terproteksi)
│   │   └── api/v1/                      # route handlers publik & admin
│   ├── components/
│   │   ├── layout/                      # header & footer
│   │   ├── catalog/                     # kartu, filter, galeri, CTA
│   │   ├── boosting/                    # kalkulator
│   │   └── admin/                       # form stok, toggle status, logout
│   ├── lib/                             # r2, currency, cta, webhook, auth, queries, boosting
│   └── generated/prisma/                # Prisma Client (di-generate, tidak di-commit)
├── prisma7.config.ts            # konfigurasi Prisma CLI (membaca .env.local)
├── next.config.ts               # remotePatterns gambar R2
└── package.json
```

---

## 📜 Skrip npm

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Server pengembangan (Turbopack) |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Buat & terapkan migrasi (dev) |
| `npm run db:deploy` | Terapkan migrasi yang ada |
| `npm run db:seed` | Isi data contoh |
| `npm run db:studio` | Buka Prisma Studio |
| `npm run arch:serve` / `arch:watch` | Dashboard & pemantau diagram arsitektur |

---

## 🗄️ Model Data

`games` → `ranks` → `boosting_rates` (tarif per segmen rank, referensi FK)
`games` → `accounts` → `account_images`, dan `accounts` → `inquiry_logs`
`admin_users` menyimpan kredensial admin.

Harga disimpan `DECIMAL`, spesifikasi akun dalam `JSONB`, dan enum `AccountStatus`
(`READY` / `BOOKED` / `SOLD`) serta `InquiryChannel` (`WHATSAPP` / `TELEGRAM` / `DISCORD`).

---

## 🔐 Catatan Keamanan

- Pembeli **tidak perlu akun**; hanya `/admin` yang terproteksi sesi.
- Semua input admin divalidasi Zod di server, bukan hanya di browser.
- Session cookie `httpOnly` + `sameSite=lax`, otomatis `secure` di produksi.
- `.env.local`, `node_modules`, `.next`, dan Prisma Client hasil generate tidak pernah di-commit.

---

## 📄 Lisensi

Proyek privat. Dokumen acuan produk tersedia di folder `PRD/`, `ARCHITECTURE/`,
`AGENTS/`, `SKILL/`, `WORKFLOW/`, dan `TODO/`.
