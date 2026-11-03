# PRD 09: External Integrations & Webhook Notifications

---

### 1. Integrasi Deep-Link Pemesanan (CTA Engine)
Sistem membuat URL dinamis terenkode saat pengunjung menekan tombol pemesanan:

#### A. WhatsApp Direct Link
* **Format:** `https://wa.me/{PHONE_NUMBER}?text={ENCODED_MESSAGE}`
* **Variabel Dinamis:** `[Title]`, `[Stock_ID]`, `[Price_IDR]`, `[URL_Page]`.

#### B. Telegram Direct Link
* **Format:** `https://t.me/{TELEGRAM_USERNAME}?text={ENCODED_MESSAGE}`

---

### 2. Integrasi Webhook Notifikasi Seller (Real-time Alert)
Setiap kali calon pembeli menekan tombol CTA (Beli via WA / Telegram / Discord), backend sistem secara *asynchronous* mengirimkan notifikasi ke **Telegram Bot** atau **Discord Webhook** milik seller.

#### A. Payload Discord Webhook (JSON)
```json
{
  "username": "Game Store Notification Bot",
  "avatar_url": "https://pub-xxxx.r2.dev/logo.png",
  "embeds": [
    {
      "title": "🔥 ADA CALON BUYER TERTARIK!",
      "color": 5814783,
      "fields": [
        { "name": "ID Stok", "value": "#STOK-104", "inline": true },
        { "name": "Harga", "value": "Rp 750.000", "inline": true },
        { "name": "Judul Akun", "value": "MLBB Mythic 100+ Skins Monsep" },
        { "name": "Saluran Diklik", "value": "WhatsApp", "inline": true },
        { "name": "Waktu", "value": "2026-11-03 16:40:00 WIB", "inline": true }
      ],
      "footer": { "text": "Game Store Catalog System" }
    }
  ]
}
```

#### B. Telegram Bot Notification Payload
```text
🔔 *NOTIFIKASI CALON PEMBELI BARU!*

📦 *Stok ID:* #STOK-104
🎮 *Game:* Mobile Legends
💰 *Harga:* Rp 750.000
📲 *Target Saluran:* WhatsApp

_Pembeli baru saja menekan tombol pesan pada web katalog._
```
