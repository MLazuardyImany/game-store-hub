# PRD 11: Non-Functional Requirements & Security

---

### 1. Performa & Speed Optimization
* **Waktu Muat Halaman (Page Load Time):** First Contentful Paint (FCP) di bawah 1.2 detik pada jaringan mobile 4G.
* **Optimasi Gambar (Cloudflare R2 + WebP):** Setiap screenshot dikompres otomatis ke format WebP (< 250 KB) sebelum diunggah ke Cloudflare R2, menjaga kejelasan detail skin/hero tanpa memperlambat loading.
* **CDN Caching:** Pemanfaatan Cloudflare Edge Network untuk caching thumbnail dan aset statis web.

### 2. Responsivitas & Aksesibilitas Mobile
* **Mobile-First Standard:** 100% elemen dapat diakses dan digunakan dengan nyaman pada layar smartphone berukuran mulai dari 360px.
* **Touch Targets:** Ukuran tombol minimal 44x44 pixel untuk kenyamanan tap di layar sentuh.

### 3. Open Graph (OG) & Social Media Preview Meta
Saat link halaman detail stok dibagikan ke WhatsApp, Telegram, Discord, atau Facebook, sistem secara otomatis menyajikan preview yang menarik:
* `og:title`: "[READY] MLBB Mythic 100+ Skins - Rp 750.000"
* `og:description`: "Cek detail spesifikasi dan screenshot lengkap akun ini di toko kami."
* `og:image`: URL Cloudflare R2 Gambar Thumbnail Utama Stok.

### 4. Keamanan Sistem (Security)
* **HTTPS Standard:** Seluruh komunikasi data wajib menggunakan enkripsi SSL/TLS.
* **Admin Rate Limiting:** Pembatasan percobaan login admin (maksimal 5 kali percobaan gagal per 15 menit) untuk mencegah serangan *Brute Force*.
* **Sanitasi Input:** Mencegah celah keamanan *XSS (Cross-Site Scripting)* dan *SQL Injection* pada form input stok dan pencarian.
