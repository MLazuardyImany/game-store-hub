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

- Skema: `prisma/schema.prisma` — tabel `games`, `accounts`, `account_images`, `boosting_rates`,
  `inquiry_logs`, dan `admin_users`, plus enum `AccountStatus` & `InquiryChannel`.
- `DATABASE_URL` dibaca dari `.env.local` melalui `prisma7.config.ts` (satu sumber env dengan Next.js).
- Prisma 7 memakai **driver adapter** `@prisma/adapter-pg`; client singleton ada di `src/lib/db.ts`.
- Client Prisma di-generate ke `src/generated/prisma` (tidak di-commit).

| Perintah | Fungsi |
| :--- | :--- |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Buat & terapkan migrasi (dev) |
| `npm run db:deploy` | Terapkan migrasi yang ada (produksi/CI) |
| `npm run db:status` | Cek status migrasi terhadap database |
| `npm run db:studio` | Buka Prisma Studio |

Migrasi awal sudah tersedia di `prisma/migrations/*_init/migration.sql`. Setelah `DATABASE_URL`
menunjuk database yang hidup, jalankan `npm run db:deploy` (atau `db:migrate` untuk development).

## Konvensi yang wajib diikuti

1. **Mata uang:** angka disimpan sebagai numerik di DB, ditampilkan lewat `Intl.NumberFormat("id-ID")` → `Rp 750.000`.
2. **Gambar:** kompres ke WebP (maks 1920px, kualitas 80%) sebelum upload ke R2; DB hanya menyimpan URL publik.
3. **CTA:** `https://wa.me/{nomor}?text=${encodeURIComponent(pesan)}`; pesan memuat ID stok, judul, dan harga.
4. **Webhook:** dikirim asynchronous, tidak boleh menahan redirect pembeli.
5. **Tema:** dark gaming permanen (`#090D16`, `#0F172A`, `#1E293B`, `#06B6D4`, `#10B981`), target sentuh ≥ 44px, nyaman di 360px.
6. **Kode:** TypeScript strict, tanpa `any` implisit, tanpa placeholder `// TODO`.

Dokumen acuan lengkap ada di `PRD/`, `ARCHITECTURE/`, `AGENTS/`, `SKILL/`, `WORKFLOW/`, dan `TODO/`.

## Status

Fase 1 (setup repositori & environment) selesai: Next.js App Router + TypeScript, Tailwind v4 dengan
token tema gelap, paket esensial, konfigurasi environment, serta skema Prisma + migrasi awal.
Langkah berikutnya: seed data awal dan helper backend (R2, format Rupiah, CTA, webhook).
