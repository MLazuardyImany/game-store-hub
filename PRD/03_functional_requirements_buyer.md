# PRD 03: Functional Requirements - Buyer & Catalog

---

### 1. Landing Page & Navigasi Utama
* **Header / Navbar:**
  * Logo Toko / Brand.
  * Navigasi Cepat: `Home`, `Katalog Akun`, `Jasa Boosting`, `Testimoni / Garansi`, `FAQ`.
  * Search Bar global untuk mencari game atau ID stok.
* **Hero Banner Section:**
  * Banner promosi atau pengumuman keamanan transaksi.
  * Teks penjelas singkat mengenai keunggulan toko (100% Aman, Garansi Unbind, Respon Cepat).
* **Grid Kategori Game:**
  * Menampilkan card interaktif berisi icon/banner game (misal: Mobile Legends, Valorant, Genshin Impact, Free Fire, PUBG Mobile).
  * Menampilkan badge jumlah stok akun yang *Ready* pada tiap kategori.

### 2. Halaman Katalog Stok Akun (Account Grid Page)
* **Fungsi Filter & Pencarian:**
  * **Pencarian:** Input kata kunci (misal: "Skin Collector", "Rank Radiance", "ID-102").
  * **Filter Kategori Game:** Dropdown atau tab pilihan game.
  * **Filter Rentang Harga (IDR):** Input Min Price dan Max Price dalam standar Rupiah.
  * **Filter Status:** Toggle `Semua`, `Ready Only`, `Sold Out`.
  * **Sorting Dropdown:**
    * Terbaru (Default)
    * Harga Terendah ke Tertinggi (IDR)
    * Harga Tertinggi ke Terendah (IDR)
* **Komponen Card Stok Akun:**
  * **Thumbnail Utama:** Screenshot highlight akun dari Cloudflare R2 CDN.
  * **Badge Status:** `READY` (Hijau) atau `SOLD OUT` (Merah/Grayscale).
  * **Judul Produk:** Nama singkat stok (misal: *MLBB Mythic 80+ Skins Monsep*).
  * **Tag Spesifikasi:** Pills tag kecil (misal: *WinRate 68%*, *Hero 110*, *All Unbind*).
  * **Harga:** Format Mata Uang IDR (Rp XXX.XXX).
  * **Action Button:** Button "Lihat Detail".
