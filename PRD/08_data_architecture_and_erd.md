# PRD 08: Data Architecture & Database Schema (ERD)

---

### 1. Entity Relationship Diagram (ERD) Logic

```
   ┌──────────────┐          ┌───────────────────┐          ┌──────────────────────┐
   │    GAMES     │1        N│     ACCOUNTS      │1        N│    ACCOUNT_IMAGES    │
   ├──────────────┤──────────┼───────────────────┼──────────┼──────────────────────┤
   │ id (PK)      │          │ id (PK)           │          │ id (PK)              │
   │ name         │          │ stock_id (Unique) │          │ account_id (FK)      │
   │ slug         │          │ game_id (FK)      │          │ r2_image_url         │
   │ icon_url     │          │ title             │          │ is_primary           │
   └──────────────┘          │ price_idr         │          │ display_order        │
                             │ status            │          └──────────────────────┘
                             │ specs_json        │
                             │ description       │
                             └───────────────────┘
                                       │ 1
                                       │
                                       │ N
                             ┌───────────────────┐
                             │   INQUIRY_LOGS    │
                             ├───────────────────┤
                             │ id (PK)           │
                             │ account_id (FK)   │
                             │ channel (WA/Tele) │
                             │ created_at        │
                             └───────────────────┘
```

### 2. Skema Tabel Relasional (PostgreSQL / MySQL)

#### Tabel: `games`
| Column | Type | Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | INT / UUID | Primary Key | ID Unik Game |
| `name` | VARCHAR(100) | NOT NULL | Nama Game |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Slug URL |
| `icon_url` | VARCHAR(255) | NULL | URL Icon Game (Cloudflare R2) |

#### Tabel: `accounts`
| Column | Type | Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | INT / UUID | Primary Key | ID Database |
| `stock_id` | VARCHAR(50) | UNIQUE, NOT NULL | ID Stok Publik (misal: STOK-010) |
| `game_id` | INT / UUID | FK -> `games.id` | ID Game Terkait |
| `title` | VARCHAR(255) | NOT NULL | Judul Stok Akun |
| `price_idr` | DECIMAL(12,2)| NOT NULL | Harga Akun dalam Rupiah (IDR) |
| `status` | ENUM | 'READY', 'BOOKED', 'SOLD' | Status Ketersediaan |
| `specs_json` | JSON / JSONB | NOT NULL | Dynamic Key-Value Specs |
| `description`| TEXT | NULL | Catatan & Deskripsi Akun |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Tanggal Upload |

#### Tabel: `account_images`
| Column | Type | Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | INT / UUID | Primary Key | ID Gambar |
| `account_id`| INT / UUID | FK -> `accounts.id` | ID Akun Terkait |
| `r2_image_url`| VARCHAR(255)| NOT NULL | URL Cloudflare R2 Storage Screenshot |
| `is_primary` | BOOLEAN | DEFAULT FALSE | Indicator Thumbnail Utama |

#### Tabel: `boosting_rates`
| Column | Type | Constraints | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | INT / UUID | Primary Key | ID Rate Boosting |
| `game_id` | INT / UUID | FK -> `games.id` | ID Game |
| `from_rank` | VARCHAR(50) | NOT NULL | Rank Awal |
| `to_rank` | VARCHAR(50) | NOT NULL | Rank Tujuan |
| `price_per_unit_idr`| DECIMAL(10,2)| NOT NULL | Harga (IDR) per Bintang/Level |
