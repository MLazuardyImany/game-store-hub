# PRD 12: API Contracts & Endpoints Specification

---

### 1. Public API Endpoints (Guest / Buyer)

#### `GET /api/v1/games`
* **Fungsi:** Mengambil daftar kategori game.
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Mobile Legends", "slug": "mobile-legends", "total_stock": 12 },
    { "id": 2, "name": "Valorant", "slug": "valorant", "total_stock": 5 }
  ]
}
```

#### `GET /api/v1/accounts`
* **Query Params:** `game`, `search`, `min_price`, `max_price`, `status`, `sort`, `page`, `limit`.
* **Response (200 OK):** Menampilkan daftar stok akun terfilter dalam harga IDR.

#### `GET /api/v1/accounts/:stock_id`
* **Fungsi:** Mengambil spesifikasi detail dan daftar URL gambar Cloudflare R2 untuk satu akun.

#### `POST /api/v1/boosting/calculate`
* **Request Body:**
```json
{
  "game_id": 1,
  "current_rank_id": 10,
  "target_rank_id": 15,
  "addons": ["express", "request_hero"]
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "estimated_price_idr": 285000,
  "estimated_days": "1-2 Hari"
}
```

#### `POST /api/v1/inquiry/log`
* **Fungsi:** Mencatat klik CTA buyer dan memicu pengiriman notifikasi Webhook ke Telegram/Discord seller.

---

### 2. Admin API Endpoints (Protected Routes)

* `POST /api/v1/admin/login` - Authenticate admin & return JWT token.
* `POST /api/v1/admin/accounts` - Create new stock account with file uploads to Cloudflare R2.
* `PUT /api/v1/admin/accounts/:id` - Update stock specifications or status.
* `PATCH /api/v1/admin/accounts/:id/status` - Quick update status (`READY` / `SOLD`).
* `DELETE /api/v1/admin/accounts/:id` - Delete stock item & purge R2 images.
