# PRD 13: Testing & Quality Assurance Acceptance Criteria

---

### 1. Kriteria Penerimaan Halaman Katalog & Detail
* [ ] **AC-01:** Pengunjung dapat mencari stok berdasarkan kata kunci atau ID Stok tanpa harus mendaftar akun.
* [ ] **AC-02:** Stok bertanda *SOLD OUT* memiliki tampilan visual grayscale dan tombol beli dinonaktifkan/diubah statusnya.
* [ ] **AC-03:** Mengklik screenshot (dimuat dari Cloudflare R2) di halaman detail akan membuka modal Lightbox full-screen yang dapat di-zoom di mobile HP.
* [ ] **AC-04:** Tombol "Beli via WhatsApp" berhasil mengarahkan ke WhatsApp Web/App dengan teks isi pesan terformat rapi sesuai ID stok dan harga (IDR).

### 2. Kriteria Penerimaan Kalkulator Boosting
* [ ] **AC-05:** Perhitungan total biaya boosting (IDR) diperbarui secara real-time saat pengunjung mengubah rank awal atau rank tujuan.
* [ ] **AC-06:** Jika rank tujuan lebih rendah dari rank awal, sistem menampilkan peringatan validasi input.
* [ ] **AC-07:** Tombol "Pesan Joki" membawa rincian order yang akurat ke chat WhatsApp/Telegram seller.

### 3. Kriteria Penerimaan Admin & Cloudflare R2 Integration
* [ ] **AC-08:** Admin dapat mengunggah beberapa file screenshot sekaligus (multi-upload), terkompresi WebP, dan sukses terunggah ke Cloudflare R2 Bucket.
* [ ] **AC-09:** Mengubah status stok dari *Ready* ke *Sold* pada Admin Dashboard langsung merefleksikan perubahan di halaman publik secara instan.
* [ ] **AC-10:** Setiap kali pengunjung menekan tombol CTA order, notifikasi webhook berhasil terkirim ke Telegram Bot / Discord Webhook seller.
