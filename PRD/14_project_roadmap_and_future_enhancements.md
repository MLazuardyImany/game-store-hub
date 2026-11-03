# PRD 14: Project Roadmap & Future Enhancements

---

### 1. Tahapan Pengembangan (Development Roadmap)

#### Fase 1: MVP Release (2 - 3 Minggu)
* Pengaturan Database, API Backend, dan Cloudflare R2 Bucket Integration.
* Pembuatan Dashboard Admin (CRUD Kategori, Stok Akun, Multi-upload Gambar ke R2).
* Pembuatan Frontend Katalog & Halaman Detail Akun (Harga IDR).
* Pembuatan Kalkulator Boosting Interaktif.
* Integrasi Direct CTA (WA, Telegram, Discord) + Webhook Alert.

#### Fase 2: Optimization & Analytics (Minggu ke-4)
* Optimasi kecepatan muat halaman, kompresi WebP, dan Mobile Polish.
* Pengaturan Open Graph Meta Tags untuk preview link sosial media dengan gambar R2.
* Pemasangan Analytics sederhana untuk melacak stok paling banyak dilihat.

---

### 2. Rencana Pengembangan Masa Depan (Future Enhancements)

1. **Payment Gateway Automations (Midtrans / QRIS):**
   * Memungkinkan pembayaran otomatis secara langsung. Begitu pembayaran terverifikasi, status stok otomatis berubah menjadi *Sold Out*.
2. **Automated Credential Vault (Pengiriman Akun Otomatis):**
   * Setelah pembayaran berhasil, sistem menyerahkan data login akun (Email & Password) secara terenkripsi kepada pembeli.
3. **Sistem Rekber / Escrow Internal:**
   * Menyediakan fitur penahanan dana sementara hingga pembeli selesai mengamankan dan menguji login akun game.
4. **Live Chat Widget:**
   * Fitur obrolan langsung di web tanpa perlu berpindah ke aplikasi obrolan eksternal.
