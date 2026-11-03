# PRD 05: Functional Requirements - Interactive Boosting Calculator

---

### 1. Komponen Kalkulator Boosting Interaktif
Halaman Jasa Boosting menyediakan alat perhitungan estimasi biaya secara otomatis berstandar Rupiah (IDR) berdasarkan tarif yang dikonfigurasi admin.

#### Alur & Input Kalkulator:
1. **Pilih Game:** Dropdown / Tab pilihan game (contoh: Mobile Legends, Valorant).
2. **Pilih Rank Awal:** Select-box rank/tier saat ini (contoh: Epic II, Bintang 3 / Gold I).
3. **Pilih Rank Tujuan:** Select-box rank/tier target (contoh: Mythic Immortal, Bintang 50 / Diamond I).
4. **Input Opsional / Add-ons (Opsional):**
   * Checkbox Request Hero Spesifik (+10% Biaya).
   * Checkbox Mabar bersama Joki (+20% Biaya).
   * Checkbox Pengerjaan Express / Kilat (+15% Biaya).

#### Output Kalkulator:
* **Total Estimasi Biaya:** Dihitung secara real-time dalam IDR (Rp) berdasarkan matriks tarif per bintang/tier.
* **Estimasi Waktu Pengerjaan:** (misal: *1 - 2 Hari*).
* **Rincian Perhitungan:** Break-down biaya berdasarkan tier yang dilewati.

### 2. CTA Order Boosting Terformat
Saat pembeli menekan tombol **"Pesan Joki Sekarang"**, sistem akan membuka WhatsApp / Telegram / Discord dengan template pesan:

> *"Halo Admin, saya mau order Jasa Boosting **[Nama Game]**:
- Rank Awal: **[Rank Awal]**
- Rank Target: **[Rank Target]**
- Add-ons: **[Hero Request / Express]**
- Estimasi Biaya: **Rp 250.000**

Mohon info ketersediaan joki. Terima kasih!"*

### 3. Price List Statis / Tabel Tarif
Selain kalkulator interaktif, halaman ini menyediakan tabel cetak tarif dasar per bintang/tier (IDR) sebagai acuan cepat pembeli.
