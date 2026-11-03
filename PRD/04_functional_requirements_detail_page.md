# PRD 04: Functional Requirements - Account Detail Page & Direct Redirect CTA

---

### 1. Galeri & Visual Akun (Powered by Cloudflare R2)
* **Hero Image Display:** Gambar utama berukuran besar yang dimuat langsung dari Cloudflare R2 Edge CDN dengan format terkompresi WebP.
* **Thumbnail Carousel / Grid:** Mengelompokkan seluruh screenshot spesifikasi yang diunggah seller.
* **Interactive Lightbox Modal:**
  * Saat screenshot diklik, muncul pop-up modal full-screen.
  * Mendukung pinch-to-zoom di perangkat mobile serta tombol navigasi Next/Previous.

### 2. Spesifikasi Detail & Catatan Akun
* **Tabel Spesifikasi Terstruktur:**
  * ID Stok Unik (Contoh: `#STOK-ML-088`)
  * Rank / Tier Saat Ini
  * Jumlah Hero / Champions
  * Jumlah Skin / Item Rare
  * Status Binding (misal: *Moonton Unbind*, *Google Unbind*, *FB Unbind*, *Email All Role Ready*)
  * Win Rate / Match Count
* **Harga Stok:** Ditampilkan jelas dalam mata uang IDR (Rp).
* **Deskripsi Tambahan:** Teks bebas dari seller berisi kelebihan akun atau bonus bawaan.
* **Blok Garansi & Syarat Ketentuan:** Informasi singkat jaminan keamanan transaksi dan garansi unbind.

### 3. Multi-Channel Redirect CTA (Call-To-Action)
Halaman detail dilengkapi dengan pilihan saluran pemesanan sesuai keinginan pembeli:

* **Button 1: Beli via WhatsApp (Utama)**
  * Generasi URL: `https://wa.me/{nomor_wa}?text={encoded_text}`
  * Template Pesan WA:
    > *"Halo Admin, saya ingin membeli stok akun **[Judul Akun]** (ID: **#STOK-104**) seharga **Rp 750.000**. Apakah stok ini masih ready?"*
* **Button 2: Order via Telegram**
  * Generasi URL: `https://t.me/{username_tele}?text={encoded_text}`
* **Button 3: Order via Discord**
  * Membuka server link atau profil Discord seller disertai fitur menyalin format pesan pemesanan ke clipboard secara otomatis.

### 4. Sticky Bottom Bar (Khusus Perangkat Mobile)
* Bar melayang di bagian bawah layar smartphone saat di-scroll down.
* Berisi informasi singkat Harga Produk (Rp) dan Tombol Utama "Beli via WA", menjamin tombol tindakan selalu terlihat tanpa perlu scroll ulang ke atas.
