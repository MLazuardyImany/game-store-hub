# ARCHITECTURE.md - Game Store & Boosting Service Hub

This document defines the software architecture, system workflows, database relations, and deployment patterns for the Game Store & Boosting Service Hub.

---

## 1. System Topology & Overview

The system uses a decoupled, modern web architecture optimized for high-performance mobile browsing, zero egress media delivery via Cloudflare R2, and instant lead redirection to chat channels.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|   +--------------------------+                  +-----------------------------+   |
|   | Guest Buyer (Mobile/PC)  |                  | Admin / Seller Dashboard    |   |
|   | - Catalog & Search       |                  | - Auth Protected            |   |
|   | - Account Detail Modal   |                  | - CRUD Accounts & Boosting  |   |
|   | - Interactive Calculator |                  | - Multi-image Drag & Drop   |   |
|   +-------------+------------+                  +--------------+--------------+   |
+-----------------|----------------------------------------------|------------------+
                  |                                              |
                  | HTTPS / REST API / Server Actions            |
                  v                                              v
+-----------------------------------------------------------------------------------+
|                                APPLICATION SERVER                                 |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   | Node.js / Next.js Server & Edge Handlers                                  |   |
|   |                                                                           |   |
|   |  [ Public API Routes ]    [ Admin Auth Middleware ]   [ Webhook Worker ]  |   |
|   |  - Catalog & Search       - JWT / Session Validation  - Async Event Queue |   |
|   |  - Boosting Math Calc     - Input Sanitization        - Webhook Formatter |   |
|   +--------+----------------------------+-----------------------+-------------+   |
+------------|----------------------------|-----------------------|-----------------+
             |                            |                       |
             | Read/Write                 | S3 Put Object         | HTTP POST
             v                            v                       v
+------------------------+   +------------------------+   +-------------------------+
|    DATABASE LAYER      |   |   OBJECT STORAGE (R2)  |   |  NOTIFICATION TARGETS   |
|                        |   |                        |   |                         |
| PostgreSQL / MySQL     |   | Cloudflare R2 Bucket   |   | Discord Webhook Endpoint|
| - Games & Categories   |   | - WebP Image Assets    |   | Telegram Bot API        |
| - Account Stocks & JSON|   | - Fast Edge CDN        |   |                         |
| - Boosting Rate Tables |   | - Zero Egress Fees     |   |                         |
+------------------------+   +------------------------+   +-------------------------+
```

---

## 2. Tech Stack Specification

| Component | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) / Vite + React | High performance, SEO-friendly SSR/SSG for stock details, fast client interactivity. |
| **Styling** | Tailwind CSS + Lucide Icons | Rapid UI construction, dark gaming aesthetic, zero runtime CSS overhead. |
| **Database** | PostgreSQL / MySQL (via Prisma or Drizzle) | Strong relational integrity for stock listings and category trees. |
| **Object Storage** | Cloudflare R2 | S3-compatible API with $0$ egress bandwidth charges for heavy image delivery. |
| **Image Optimization** | Sharp / WebP Encoder | Automatically compresses screenshot uploads on server before dispatching to R2. |
| **Authentication** | Jose / NextAuth / JWT | Lightweight, secure session management for `/admin` routes. |

---

## 3. Data Flow & Sequence Diagrams

### 3.1 Buyer CTA Order Flow (Lead Redirect & Webhook Trigger)

```
[Buyer]                [Client Web UI]            [Backend Server]            [Discord/Telegram]        [WhatsApp App]
   |                          |                          |                            |                       |
   |-- Click "Beli via WA" -->|                          |                            |                       |
   |                          |-- POST /api/inquiry ---->|                            |                       |
   |                          |   (Async Webhook Trigger)|-- Send Webhook Payload --->|                       |
   |                          |                          |   (Non-blocking response)  |                       |
   |                          |<-- 200 OK (Instant) -----|                            |                       |
   |                          |                          |                            |                       |
   |-- Redirect to Deep Link -------------------------------------------------------------------------------->|
   |   (wa.me/?text=EncodedMsg)|                         |                            |                       |
```

### 3.2 Admin Image Upload Flow (Cloudflare R2 Integration)

```
[Admin Dashboard]                [Server Handler]               [Sharp / Compress]          [Cloudflare R2 Bucket]
        |                               |                               |                             |
        |-- Upload Multiple Images ---->|                               |                             |
        |                               |-- Compress File to WebP ----->|                             |
        |                               |<-- Return WebP Buffer --------|                             |
        |                               |                                                             |
        |                               |-- PutObjectCommand (@aws-sdk/client-s3) ------------------->|
        |                               |<-- Upload Success (Returns Public R2 URL) ------------------|
        |                               |                                                             |
        |-- Save Account to DB -------->|                                                             |
        |   (with R2 URLs array)        |                                                             |
```

---

## 4. Subsystem Specifications

### A. Frontend Architecture
* **Routing Strategy:**
  * `/` : Home catalog, game category selectors, featured stocks.
  * `/catalog/[game_slug]` : Filterable stock listing page.
  * `/account/[stock_id]` : Stock detail page, image gallery, specs table, sticky mobile CTA bar.
  * `/boosting` : Interactive boosting cost calculator & price table.
  * `/admin/*` : Protected admin layout (Stock Manager, Category Manager, Boosting Rate Manager).
* **State Management:**
  * URL Search Parameters (`useSearchParams`) for catalog filtering/sorting to support shareable deep-links.
  * Local React State (`useState` / `useReducer`) for real-time boosting calculator math.

### B. Image Pipeline (Cloudflare R2 Setup)
1. **S3 SDK Client Configuration:**
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```
2. **Compression Rule:** Max dimensions $1920 \times 1080$ px, WebP format, quality 80%.

### C. Boosting Math Engine Formula

The total price calculation formula for boosting requests:

$$
\text{Total Price (IDR)} = \left( \sum_{i=\text{StartRank}}^{\text{TargetRank}} \text{Rate}_i \right) \times \left( 1 + \sum \text{Addon Multipliers} \right)
$$

Where:
* $\text{Rate}_i$ is the unit rate in IDR for tier $i$.
* $\text{Addon Multipliers}$ (e.g., Express $= 0.15$, Hero Request $= 0.10$).

---

## 5. Security & Performance Baseline

* **Zero-Trust Input Handling:** All admin CRUD inputs sanitized against XSS and validated using `zod` schemas.
* **Rate Limiting:** `/api/admin/login` restricted to 5 requests/minute per IP address to prevent brute-force attacks.
* **Caching Layer:** Public catalog endpoints leverage `stale-while-revalidate` caching strategy for sub-second responses.
* **Open Graph Meta Tags:** Every account detail route renders custom Open Graph tags (`og:image`, `og:title`, `og:description`) referencing Cloudflare R2 assets for rich preview links on social apps.