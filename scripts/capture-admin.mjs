// Screenshot dashboard admin: login lewat request context agar cookie sesi
// terpasang, lalu buka /admin. Dipakai terpisah karena langkah login
// membutuhkan penanganan khusus.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const OUT = "docs/screenshots";

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "id-ID",
      timezoneId: "Asia/Jakarta",
    });

    const login = await context.request.post(`${BASE}/api/v1/admin/login`, {
      data: {
        username: process.env.ADMIN_USERNAME ?? "admin",
        password: process.env.ADMIN_PASSWORD ?? "Admin#2026",
      },
      timeout: 20_000,
    });

    console.log("login status:", login.status());

    const page = await context.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${OUT}/admin-dashboard.png` });
    console.log("OK admin-dashboard.png");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Gagal:", error.message);
  process.exitCode = 1;
});
