# PRD 10: Technical System Architecture & Tech Stack

---

### 1. Arsitektur Sistem Overview
Platform menggunakan pola arsitektur decoupled modern (Client-Server Architecture) yang memanfaatkan **Cloudflare R2** sebagai Object Storage utama untuk file media/screenshot dengan **Zero Egress Fee**.

```
 [ Buyer Mobile / PC Browser ]
             │
             │ HTTP / REST API
             ▼
 ┌──────────────────────────────────────┐
 │     Frontend Web (SSG / SSR / SPA)    │
 └──────────────────────────────────────┘
             │
             │ REST API Calls & Image Fetch
             ├─────────────────────────────────────────┐
             ▼                                         ▼
 ┌──────────────────────────────────────┐   ┌──────────────────────────┐
 │       Backend Server (Node/Laravel)  │   │ Cloudflare R2 CDN Bucket │
 └──────────────────────────────────────┘   │ (Free Egress Screenshot) │
    │                   │                   └──────────────────────────┘
    │ DB Query          │ Upload via S3 SDK
    ▼                   ▼
┌──────────────┐  ┌───────────────────┐
│ Database     │  │ Discord / Tele    │
│ (PostgreSQL/ │  │ Webhook API       │
│ SQLite/MySQL)│  └───────────────────┘
└──────────────┘
```

### 2. Terkonfirmasi Tech Stack & Storage
* **Mata Standar:** IDR (Rupiah).
* **Object Storage:** **Cloudflare R2**
  * **Keunggulan:** 0 USD Egress Fee, 10 GB Free Storage, terintegrasi global CDN Cloudflare.
  * **Protokol:** AWS S3-Compatible API (Diakses via `@aws-sdk/client-s3` pada Node.js atau Flysystem R2 Driver pada Laravel).
* **Frontend Framework:** Next.js (React) / Nuxt.js (Vue) dengan Tailwind CSS.
* **Backend Server:** Node.js (Express/Fastify) atau Laravel (PHP).
* **Database:** PostgreSQL atau MySQL.

### 3. Strategi Penyimpanan & Optimasi Gambar di Cloudflare R2
1. Admin mengunggah file screenshot di Dashboard Admin.
2. Server/Backend memproses kompresi gambar menjadi format **WebP** (kualitas 80%).
3. Backend mengunggah file hasil kompresi langsung ke **Cloudflare R2 Bucket**.
4. URL publik gambar R2 disimpan ke tabel database `account_images`.
5. Gambar disajikan ke pembeli melalui Cloudflare Edge CDN dengan respon super cepat.
