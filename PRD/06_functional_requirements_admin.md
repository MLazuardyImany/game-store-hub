# PRD 06: Functional Requirements - Admin Dashboard

---

### 1. Autentikasi & Keamanan Admin
* **Form Login Admin:** Menggunakan Login berbasis Username / Password terenkripsi (Bcrypt) dan Session/JWT Token.
* **Keamanan Endpoint:** Mencegah akses ke rute `/admin` tanpa token valid.

### 2. Manajemen Kategori Game
* **Tambah / Edit / Hapus Kategori:**
  * Input Nama Game (misal: *Mobile Legends*).
  * Upload Icon / Logo Game (Direct upload ke Cloudflare R2).
  * Slugs URL otomatis (misal: `mobile-legends`).

### 3. Manajemen Stok Akun (CRUD Account Stock)
* **Form Upload Stok Baru:**
  * Select Game Category.
  * Judul Stok & Harga (IDR / Rp).
  * Multi-Image Upload (Drag-and-drop support, auto compress ke format WebP & upload langsung ke **Cloudflare R2 Bucket** via S3 SDK).
  * Penentuan Gambar Utama (Primary Thumbnail).
  * Status Toggle: `Ready` / `Booked` / `Sold Out`.
  * Dynamic Specs Builder: Input Key-Value untuk spesifikasi akun (misal: `Level: 100`, `Hero: 115`, `Skin Collector: 4`).
  * Deskripsi Lengkap (Markdown Support).
* **Daftar Stok Akun (Table View):**
  * Pencarian stok cepat & filter berdasarkan status.
  * Quick Toggle Status: Ubah status ke `Sold Out` hanya dengan 1 klik tanpa masuk ke edit page.
  * Action: Edit, Delete, View.

### 4. Manajemen Rate Jasa Boosting
* **Matriks Tarif Boosting (IDR):** Interface tabel untuk mengisi biaya per bintang / per tier pada setiap game dalam Rupiah.
* **Pengaturan Add-on Multiplier:** Menentukan persentase biaya tambahan untuk Request Hero, Express, dll.

### 5. Log Klik Inquiry / Analytics Sederhana
* Menampilkan ringkasan berapa kali tombol CTA pada masing-masing stok akun diklik oleh pengunjung.
