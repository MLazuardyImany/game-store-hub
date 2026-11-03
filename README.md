# Game Store Hub

Web katalog penjualan akun game online + kalkulator jasa boosting (joki) untuk pasar Indonesia.
Pembeli mengakses sebagai **tamu** (tanpa register), lalu diarahkan ke WhatsApp / Telegram / Discord
dengan pesan yang sudah terformat otomatis.

## Stack

| Komponen | Teknologi |
| :--- | :--- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (design token di `src/app/globals.css`) |
| Ikon | `lucide-react` |
| Database | PostgreSQL / MySQL via Prisma (fase berikutnya) |
| Media | Cloudflare R2 (`@aws-sdk/client-s3`) + `sharp` (WebP) |
| Validasi | `zod` |

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev                  # http://localhost:3000
```

| Script | Fungsi |
| :--- | :--- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build |
| `npm run lint` | ESLint (flat config) |
| `npm run typecheck` | `tsc --noEmit` tanpa emit |

## Struktur proyek

```
src/
├── app/                 # Route App Router
│   ├── (public)/        # Halaman tamu: katalog, detail akun, boosting
│   ├── admin/           # Dashboard admin (terproteksi)
│   ├── layout.tsx       # Root layout: metadata, viewport, tema gelap
│   ├── page.tsx         # Landing page
│   └── globals.css      # Import Tailwind + design token
├── components/
│   ├── ui/              # Primitif: button, modal, input
│   ├── catalog/         # Grid stok, filter, kartu, galeri
│   ├── boosting/        # Kalkulator & tabel tarif
│   └── admin/           # Form upload, tabel stok, toggle status
├── lib/                 # Utilitas (utils.ts, nanti r2.ts, currency.ts, webhook.ts)
├── types/               # Interface & tipe bersama
└── styles/              # Stylesheet tambahan
```

## Database & Migrasi (Prisma 7)

- Skema: `prisma/schema.prisma` — tabel `games`, `ranks`, `accounts`, `account_images`,
  `boosting_rates`, `inquiry_logs`, dan `admin_users`, plus enum `AccountStatus` & `InquiryChannel`.
- `ranks` adalah master peringkat per game dengan `rank_order`; `boosting_rates` mereferensikan
  rank lewat FK, sehingga tarif bisa dijumlahkan sekuensial dari rank awal ke target tanpa
  mengisi matriks semua pasangan rank.
- `DATABASE_URL` dibaca dari `.env.local` melalui `prisma7.config.ts` (satu sumber env dengan Next.js).
- Prisma 7 memakai **driver adapter** `@prisma/adapter-pg`; client singleton ada di `src/lib/db.ts`.
- Client Prisma di-generate ke `src/generated/prisma` (tidak di-commit).

| Perintah | Fungsi |
| :--- | :--- |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Buat & terapkan migrasi (dev) |
| `npm run db:deploy` | Terapkan migrasi yang ada (produksi/CI) |
| `npm run db:status` | Cek status migrasi terhadap database |
| `npm run db:seed` | Isi data contoh (idempotent) |
| `npm run db:studio` | Buka Prisma Studio |

Migrasi awal ada di `prisma/migrations/*_init/migration.sql`. Setelah `DATABASE_URL` menunjuk
database yang hidup, jalankan `npm run db:deploy` lalu `npm run db:seed`.

## API dasar

| Endpoint | Fungsi |
| :--- | :--- |
| `GET /api/v1/games` | Daftar kategori game + jumlah stok READY per game |
| `GET /api/v1/accounts` | Katalog stok; query: `game`, `search`, `min_price`, `max_price`, `status`, `sort`, `page`, `limit` |
| `GET /api/v1/accounts/:stock_id` | Detail satu stok + seluruh screenshot (404 bila tidak ada) |

Semua handler memakai `await connection()` sehingga selalu dirender saat request (bukan
di-prerender saat build) karena membaca database.

## Konvensi yang wajib diikuti

1. **Mata uang:** angka disimpan sebagai numerik di DB, ditampilkan lewat `Intl.NumberFormat("id-ID")` → `Rp 750.000`.
2. **Gambar:** kompres ke WebP (maks 1920px, kualitas 80%) sebelum upload ke R2; DB hanya menyimpan URL publik.
3. **CTA:** `https://wa.me/{nomor}?text=${encodeURIComponent(pesan)}`; pesan memuat ID stok, judul, dan harga.
4. **Webhook:** dikirim asynchronous, tidak boleh menahan redirect pembeli.
5. **Tema:** dark gaming permanen (`#090D16`, `#0F172A`, `#1E293B`, `#06B6D4`, `#10B981`), target sentuh ≥ 44px, nyaman di 360px.
6. **Kode:** TypeScript strict, tanpa `any` implisit, tanpa placeholder `// TODO`.

Dokumen acuan lengkap ada di `PRD/`, `ARCHITECTURE/`, `AGENTS/`, `SKILL/`, `WORKFLOW/`, dan `TODO/`.

## Status

Fase 1 selesai: Next.js App Router + TypeScript, Tailwind v4 (token tema gelap), environment,
skema Prisma + migrasi awal. Sebagian Fase 2 selesai: master rank & tarif boosting, seed data
contoh (4 game, 31 rank, 27 tarif, 8 stok), dan tiga endpoint API baca.
Langkah berikutnya: helper R2, format Rupiah, CTA, webhook, lalu UI katalog.
