// Mengambil screenshot halaman utama untuk dokumentasi.
// Jalankan: node scripts/capture-screenshots.mjs [baseUrl]
// Memakai Chrome yang sudah terpasang (channel "chrome"), jadi tidak
// perlu mengunduh browser Playwright.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = "docs/screenshots";
const VIEWPORT = { width: 1440, height: 900 };

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Admin#2026";

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
  });
  const page = await context.newPage();

  async function shot(path, file, { fullPage = false } = {}) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${file}`, fullPage });
    console.log(`OK ${file} <- ${path}`);
  }

  await shot("/", "landing-catalog.png");
  await shot("/catalog", "katalog-stok.png");
  await shot("/account/STOK-ML-101", "account-detail.png");
  await shot("/boosting", "boosting-calculator.png");

  // Dashboard admin butuh sesi: login lewat form agar cookie httpOnly terpasang.
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await page.fill("#username", ADMIN_USERNAME);
  await page.fill("#password", ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL("**/admin", { timeout: 30_000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/admin-dashboard.png` });
  console.log("OK admin-dashboard.png <- /admin");

  await browser.close();
}

main().catch((error) => {
  console.error("Gagal mengambil screenshot:", error);
  process.exitCode = 1;
});
