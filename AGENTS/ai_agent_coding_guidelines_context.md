# AGENTS.md - Game Store & Boosting Service Hub

> Document Instructions for AI Coding Agents (Cursor, Windsurf, GitHub Copilot, Claude Code, DeepSeek Harness, etc.)
> **Target LLM Engine:** DeepSeek V4.1 Flash / DeepSeek Models
> **Project Context:** Web Catalog for Game Online Accounts & Boosting Services.

## 1. Project Overview & Objective

This project is a light, high-performance, and mobile-first web catalog for selling online game accounts and providing automated/interactive game boosting service estimations.

* **Primary Currency:** IDR (Rupiah - `Rp`).
* **Media Storage:** Cloudflare R2 (S3-compatible, Zero Egress Fee).
* **Order Flow:** Direct redirect to WhatsApp, Telegram, or Discord with pre-filled encoded text messages + background Webhook notifications to Telegram Bot/Discord Server.
* **Buyer Access:** 100% Guest access (No registration/login required for buyers).
* **Admin Access:** Protected `/admin` dashboard for CRUD operations on game categories, stock accounts, boosting rates, and image uploads.

---

## 2. DeepSeek Execution Directives

When processing instructions using DeepSeek V4.1 Flash:

1. **Zero Placeholder Code:** Always provide full, runnable code blocks. Never leave placeholders like `// TODO: implement later` or `/* rest of the code here */`.
2. **Explicit Type Safety:** Strictly use explicit TypeScript types and interfaces. Avoid implicit `any` or ambiguous parameters.
3. **Deterministic Utility Functions:** Isolate complex mathematical calculations (e.g., boosting rates, tier differences, price multiplier math) into pure utility functions with unit test suitability.
4. **Edge & Server Compatibility:** Ensure Cloudflare R2 upload helpers and SDK calls use environment-safe code suitable for Next.js Server Actions / Node.js API handlers.

---

## 3. Core Technical Architecture & Conventions

### A. Tech Stack Assumptions

* **Frontend:** React / Next.js (App Router) or Vite + React, styled with Tailwind CSS.
* **Backend:** Node.js (Express/Fastify) or Next.js Server Actions / API Routes.
* **Database:** PostgreSQL / MySQL (managed via Prisma / Drizzle ORM or Supabase DB).
* **Object Storage:** Cloudflare R2 using `@aws-sdk/client-s3`.
* **Icons & Animation:** Lucide React (`lucide-react`) & Framer Motion.

### B. Directory & Structure Expectations

Strictly adhere to a clean component and module separation:

```
├── public/
├── src/
│   ├── app/ (or pages/)        # Route handlers and UI pages
│   │   ├── (public)/          # Guest facing routes (catalog, detail, boosting)
│   │   └── admin/             # Protected admin routes
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base primitives (buttons, modals, inputs)
│   │   ├── catalog/           # Stock grid, filters, cards, detail gallery
│   │   ├── boosting/          # Interactive calculator & price tables
│   │   └── admin/             # Upload forms, stock tables, status toggles
│   ├── lib/                   # Utility functions
│   │   ├── r2.ts              # Cloudflare R2 S3 Client helper
│   │   ├── currency.ts        # IDR formatting utilities (e.g., formatRupiah)
│   │   ├── webhook.ts         # Telegram/Discord notification triggers
│   │   └── db.ts              # Database client initialization
│   ├── types/                 # TypeScript interfaces and type definitions
│   └── styles/                # Global styles & Tailwind config
├── .env.example
├── AGENTS.md
└── package.json
```

---

## 4. Mandatory Business Logic & Rules for AI Agents

### Rule 1: IDR Currency Formatting
All prices must be handled as numeric numbers in DB (`DECIMAL`/`INT`) and formatted as Indonesian Rupiah on the UI using `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`.
* *Example Output:* `Rp 750.000`

### Rule 2: Cloudflare R2 Uploads & WebP Image Compression
* Before uploading any screenshot to Cloudflare R2, compress the image on the server/edge to **WebP format** (max width 1920px, quality 80%).
* Store only the public URL (`r2_image_url`) in the `account_images` table.
* Do not store raw base64 or local file paths in the database.

### Rule 3: Direct CTA & Message Encoding
When generating WhatsApp or Telegram links, ensure proper URL encoding:
* **WhatsApp:** `https://wa.me/{phone}?text=${encodeURIComponent(message)}`
* **Telegram:** `https://t.me/{username}?text=${encodeURIComponent(message)}`
* Standard message format must include the unique `stock_id` (e.g., `#STOK-ML-104`), title, and price in IDR.

### Rule 4: Boosting Calculator Logic
The boosting cost calculator must compute price dynamically:

$$
\text{Total Price} = \text{Base Tier Tarif} + \text{Addons Multiplier (e.g., Express +15\%, Request Hero +10\%)}
$$

Ensure real-time UI state updates without page refreshes.

### Rule 5: Asynchronous Webhook Triggers
Trigger background webhooks to Discord/Telegram whenever a guest clicks a CTA button ("Beli via WA" / "Pesan Joki"). Never block or delay the user redirect while waiting for the webhook response.

---

## 5. UI/UX & Design Guidelines

### Visual Theme: Modern Dark Gaming
* **Background:** Deep Obsidian Slate (`#0F172A` / `#090D16`)
* **Cards / Modals:** Dark Charcoal (`#1E293B`)
* **Primary Accent:** Electric Cyan (`#06B6D4`) or Neon Purple (`#8B5CF6`)
* **WhatsApp Accent:** Emerald Green (`#10B981`)
* **Sold Out Visual:**
  * Apply `grayscale` or opacity reduction to thumbnail images.
  * Overlay prominent red badge: `TERJUAL` / `SOLD OUT`.
  * Disable or alter purchase buttons for sold stock.

### Mobile-First Standard
* Mobile screen resolution support down to **360px**.
* Provide a **Sticky Bottom CTA Bar** on mobile viewports for Account Detail pages.
* Lightbox modal for image galleries must support touch/pinch zoom on mobile devices.

---

## 6. Code Quality Checklist for DeepSeek Execution

When generating or refactoring code:
1. **TypeScript Strictness:** Always define explicit interfaces (`Account`, `GameCategory`, `BoostingRate`, `WebhookPayload`).
2. **Error Handling:** Wrap R2 uploads and DB queries in `try/catch` blocks with clean fallback states.
3. **Environment Variables:** Keep sensitive keys (R2 Keys, DB Credentials, Webhook URLs, JWT Secret) strictly in `.env`.
4. **Modularity:** Ensure component functions are concise, single-responsibility, and easy to read.