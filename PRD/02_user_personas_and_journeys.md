# PRD 02: User Personas & User Journeys

---

### 1. User Personas

#### Persona A: Buyer (Guest User)
* **Nama Profil:** Rizky (Gamer Mobile & PC)
* **Karakteristik:** Mengakses web melalui smartphone (Android/iOS), ingin melihat stok akun secara instan tanpa perlu mendaftar akun web, dan sangat teliti melihat spesifikasi screenshot item/skin.
* **Kebutuhan Utama:** Kemudahan mencari game favorit, kejelasan status ketersediaan (*Ready* vs *Sold*), dan komunikasi cepat via WhatsApp/Telegram.

#### Persona B: Admin / Seller
* **Nama Profil:** Imany (Pemilik Game Store)
* **Karakteristik:** Mengelola puluhan stok akun game dan pesanan boosting harian. Menginginkan proses upload screenshot dan spesifikasi yang cepat serta notifikasi saat ada calon pembeli yang tertarik.
* **Kebutuhan Utama:** Dashboard admin yang responsif, kemudahan mengubah status *Sold Out*, serta pembaruan tarif boosting.

---

### 2. User Journey Mapping

#### Journey 1: Pembelian Akun Game (Guest Flow)
```
[Landing Page]
     │
     ▼
[Pilih Kategori Game / Search]
     │
     ▼
[Katalog Stok Akun] ── Filter Rank / Harga (IDR) / Status
     │
     ▼
[Halaman Detail Akun] ── Lihat Galeri Screenshot (Cloudflare R2) & Specs
     │
     ▼
[Klik CTA Beli (WA / Telegram / Discord)]
     │
     ├── (Sistem Mengirim Webhook ke Telegram Bot / Discord Admin)
     ▼
[Terhubung ke Chat Seller dengan Pesan Terformat Otomatis]
```

#### Journey 2: Estimasi & Pemesanan Jasa Boosting (Guest Flow)
```
[Halaman Jasa Boosting]
     │
     ▼
[Pilih Game]
     │
     ▼
[Input Rank Awal ──► Input Rank Tujuan]
     │
     ▼
[Kalkulator Menampilkan Total Biaya (IDR) & Estimasi Waktu]
     │
     ▼
[Klik CTA "Pesan Joki via WA / Discord"]
     │
     ▼
[Terhubung ke Chat Seller membawa rincian order boosting]
```

#### Journey 3: Pengelolaan Stok oleh Admin (Admin Flow)
```
[Login Admin]
     │
     ▼
[Dashboard Admin] ──► [Tambah Stok Baru]
     │
     ├── Input Judul & Kategori
     ├── Upload Multi-Image Screenshot (Auto Compress WebP -> Cloudflare R2)
     ├── Isi Spesifikasi Detail & Harga (IDR)
     └── Publish Stok (Status: Ready)
```
