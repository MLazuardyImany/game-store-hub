# PRD 01: System Overview & Scope
## Platform Katalog & Penjualan Akun Game + Jasa Boosting

---

### 1. Executive Summary
Dokumen ini mendefinisikan kebutuhan produk untuk platform web katalog penjualan akun game online dan penyediaan jasa boosting (joki). Web ini dirancang khusus untuk mempermudah calon pembeli (*buyer*) menelusuri stok akun, melihat bukti screenshot dan spesifikasi detail, serta melakukan estimasi biaya joki secara interaktif sebelum akhirnya diarahkan ke saluran obrolan penjual (WhatsApp, Telegram, Discord).

### 2. Visi & Tujuan Produk
* **Tujuan Utama:** Menyajikan katalog visual yang rapi, cepat, dan transparan untuk stok akun game serta daftar harga jasa boosting dengan mata uang utama **IDR (Rupiah)**.
* **Efisiensi Operasional:** Mengurangi pertanyaan berulang dari pembeli mengenai "Stok ini masih ada?", "Lihat screenshot detail dong", atau "Berapa harganya dari rank X ke Y?".
* **Meningkatkan Konversi:** Memudahkan transaksi dengan tombol tindakan (*Call to Action* / CTA) otomatis yang membawa pesan terformat langsung ke WhatsApp, Telegram, atau Discord seller.

### 3. Ruang Lingkup MVP (Minimum Viable Product)
| Fitur / Modul | Dalam Cakupan (In-Scope MVP) | Di Luar Cakupan (Out-of-Scope MVP) |
| :--- | :--- | :--- |
| **Akses Pembeli** | Mode Tamu / Guest User (Tanpa Register/Login) | Sistem Registrasi/Login Pembeli |
| **Pemesanan Akun** | Redirect Direct CTA ke WA, Telegram, & Discord | Payment Gateway Otomatis (Midtrans/QRIS) |
| **Jasa Boosting** | Kalkulator Estimasi Biaya Boosting Interaktif (IDR) | Penjadwalan Joki Otomatis & Tracker Progress |
| **Manajemen Stok** | Dashboard Admin CRUD Stok, Kategori, & Rate Joki | Sistem Multi-Vendor / Multi-Seller |
| **Penyimpanan Media** | Cloudflare R2 Object Storage (Zero Egress Fee) | Local Server File Storage |
| **Notifikasi Seller** | Webhook Notifikasi Otomatis ke Telegram Bot & Discord | SMS / Email Automated Gateway |

### 4. Target Pengguna
1. **Calon Pembeli Akun (Guest Buyers):** Gamer yang mencari akun game (smurf, main account, atau akun bertema khusus) dengan spesifikasi terverifikasi.
2. **Pencari Jasa Boosting (Boosting Clients):** Gamer yang ingin menaikkan rank/tier akun game mereka.
3. **Penjual / Admin (Seller):** Pemilik toko yang mengunggah stok, memperbarui status ketersediaan, dan mengelola harga joki.
