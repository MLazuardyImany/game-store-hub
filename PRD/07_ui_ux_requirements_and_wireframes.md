# PRD 07: UI/UX Requirements & Design Guidelines

---

### 1. Tema Visual & Palette Warna
* **Visual Style:** *Modern Dark Gaming Theme*. Kontras tinggi, tampilan elegan dan profesional khas platform gaming esports.
* **Palet Warna:**
  * **Background Principal:** Dark Slate / Obsidian (`#0F172A` / `#090D16`)
  * **Card Surface:** Dark Charcoal (`#1E293B`)
  * **Primary Accent (CTA Buttons):** Electric Cyan (`#06B6D4`) atau Neon Violet (`#8B5CF6`)
  * **Secondary Accent (WhatsApp CTA):** Emerald Green (`#10B981`)
  * **Alert / Sold Out Badge:** Crimson Red (`#EF4444`)
  * **Text Primary:** Pure White (`#F8FAFC`), Text Secondary: Muted Gray (`#94A3B8`)

### 2. Panduan UX & Interaktivitas

| Komponen UI | Perilaku Interaktif & UX |
| :--- | :--- |
| **Grid Stok Akun** | Hover effect pada card (skala membesar halus + glow aksen neon). Harga ditampilkan dalam format IDR (Rp). |
| **Status Sold Out** | Thumbnail produk otomatis berubah *grayscale* dengan overlay badge merah bertuliskan "TERJUAL". |
| **Galeri Screenshot** | Navigasi thumbnail dimuat cepat dari Cloudflare R2 CDN, mendukung swipe di HP dan modal zoom. |
| **Kalkulator Boosting** | Perubahan angka total biaya (Rp) terjadi instan (*real-time reactive*) tanpa perlu klik tombol refresh. |
| **Mobile Sticky Bar** | Menempel di bagian bawah viewport layar smartphone tanpa menutupi konten utama. |

### 3. Layout Responsif Breakdown
* **Mobile (375px - 640px):** Single column grid, bottom sticky CTA bar, touch swipe gallery.
* **Tablet (768px - 1024px):** 2 Column grid untuk stok akun, sidebar filter dapat di-collapse.
* **Desktop (1280px+):** 3-4 Column grid stok akun, sidebar filter sticky di sisi kiri.
