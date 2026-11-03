# WORKFLOW.md - Development & Operational Workflows

This document defines the standard operating procedures, Git version control rules, AI agent interaction flows, database migration processes, and deployment pipelines for the Game Store & Boosting Service Hub.

---

## 1. Git & Version Control Workflow

### A. Branching Strategy

We follow a feature-branch workflow to maintain stability on the main branch:

* **`main`**: Production-ready branch. Only merge fully tested, approved code here.
* **`staging` / `dev`**: Integration branch for feature verification before production releases.
* **`feature/<feature-name>`**: Branch for developing new components or endpoints (e.g., `feature/boosting-calculator`, `feature/r2-uploader`).
* **`fix/<bug-name>`**: Branch for bug fixes (e.g., `fix/whatsapp-url-encoding`).

### B. Commit Message Conventions (Conventional Commits)

All commits must follow the Conventional Commits specification:

* `feat:` A new user-facing feature (e.g., `feat(catalog): add min-max price filter in IDR`).
* `fix:` A bug fix (e.g., `fix(r2): resolve missing content-type in webp upload`).
* `docs:` Documentation changes (e.g., `docs: update ARCHITECTURE.md for R2 bucket`).
* `style:` Formatting, missing semi-colons, no code change.
* `refactor:` Code refactoring without functionality changes.
* `test:` Adding or updating tests.
* `chore:` Updating dependencies or build scripts.

---

## 2. AI Agent (DeepSeek) Coding Workflow

When leveraging AI Coding Agents (Cursor, Windsurf, DeepSeek Harness, Claude Code):

```
┌────────────────────────┐      ┌────────────────────────┐      ┌────────────────────────┐
│  1. Task Selection     │ ───> │  2. Context Prompting  │ ───> │  3. Code Generation   │
│  Select item from      │      │  Feed AGENTS.md +      │      │  DeepSeek generates   │
│  TODO.md               │      │  relevant target file  │      │  zero-placeholder code │
└────────────────────────┘      └────────────────────────┘      └────────────────────────┘
                                                                             │
┌────────────────────────┐      ┌────────────────────────┐                   │
│  5. Commit & Checkoff  │ <─── │  4. QA & Verification  │ <─────────────────┘
│  Tick off item in      │      │  Run local build &     │
│  TODO.md and commit    │      │  verify against ACs    │
└────────────────────────┘      └────────────────────────┘
```

1. **Task Selection:** Pick one atomic task from `TODO.md` (e.g., "Build IDR Rupiah formatter").
2. **Context Feeding:** Ensure the AI agent reads `AGENTS.md`, `SKILLS.md`, and the relevant file path before executing prompts.
3. **Execution Directive:** Enforce the *Zero Placeholder Rule*. Do not accept incomplete code templates.
4. **Local Verification:** Test generated components manually and ensure TypeScript passes with zero errors (`npm run build` / `npx tsc --noEmit`).
5. **Task Checkoff:** Update `TODO.md` status upon successful verification.

---

## 3. Local Development Setup Workflow

### Step 1: Environment Initialization

```bash
# Clone the repository
git clone https://github.com/your-username/game-store-hub.git
cd game-store-hub

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Configure Environment Variables

Populate `.env.local` with local development keys:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gamestore_db"
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="gamestore-bucket"
R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"
ADMIN_JWT_SECRET="super-secret-jwt-key"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
TELEGRAM_BOT_TOKEN="123456789:ABC..."
TELEGRAM_CHAT_ID="-100xxxx"
```

### Step 3: Database Synchronization & Seeding

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed initial categories & sample stocks
npm run seed
```

### Step 4: Run Development Server

```bash
npm run dev
# Server accessible at http://localhost:3000
```

---

## 4. Database Schema Change Workflow

When modifying database tables or relations:

1. **Update Schema:** Edit `prisma/schema.prisma` or your Drizzle schema definition file.
2. **Generate Migration:**
   ```bash
   npx prisma migrate dev --name describe_your_changes
   ```
3. **Update TypeScript Types:** Re-generate ORM client types:
   ```bash
   npx prisma generate
   ```
4. **Update Seed Script:** Reflect schema updates in `prisma/seed.ts` if new required fields were added.

---

## 5. Cloudflare R2 Upload & Media Testing Workflow

When testing media uploads locally:

1. **Verify Bucket Access:** Ensure `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` have `Admin Read & Write` permissions on Cloudflare dashboard.
2. **Local Upload Test:**
   * Go to `/admin/accounts/new`.
   * Upload sample PNG/JPG screenshot files.
   * Verify server console logs for WebP conversion via `sharp`.
3. **CDN Verification:**
   * Copy generated `r2_image_url` output.
   * Open in browser to confirm the Cloudflare Edge CDN serves the WebP image properly.

---

## 6. Testing & Quality Assurance Workflow

Before submitting a Pull Request or deploying to production, execute the QA checklist:

* [ ] **Type Check:** `npx tsc --noEmit` passes without errors.
* [ ] **Build Check:** `npm run build` completes successfully.
* [ ] **CTA Redirect Check:** Verify WhatsApp CTA generates proper URL string (`https://wa.me/...`).
* [ ] **Webhook Alert Check:** Click CTA button on local catalog and check Discord channel or Telegram chat for incoming alert payload.
* [ ] **Responsive View Check:** Test catalog display on Chrome DevTools Mobile View (360px - iPhone SE / Android).

---

## 7. Deployment Workflow

### Deployment Target: Vercel / Render / VPS

1. **Connect Repository:** Link GitHub repository to Vercel or your hosting platform.
2. **Environment Variables Config:** Add all production `.env` keys in the hosting dashboard.
3. **Build Command Configuration:**
   * **Build Command:** `npx prisma generate && next build`
   * **Output Directory:** `.next`
4. **Database Migration on Deploy:**
   * Run production database migrations before or during deploy:
     ```bash
     npx prisma migrate deploy
     ```
5. **Post-Deploy Smoke Test:**
   * Open live site URL.
   * Check stock catalog rendering speed.
   * Perform trial inquiry click on live WhatsApp button.
   * Verify Webhook message arrives on Discord/Telegram.