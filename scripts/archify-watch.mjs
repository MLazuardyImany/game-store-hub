// Pemantau perubahan kode untuk diagram Archify.
//
// Menulis `.archify/drift.json` setiap kali file arsitektur berubah, sehingga
// dashboard menampilkan peringatan "kode berubah". Ini penanda bahwa candidate
// JSON perlu ditinjau ulang; penulisan ulang makna diagram tetap dilakukan
// lewat sesi agent (atau `node <archify>/bin/archify.mjs finalize ...`).
//
// Jalankan: npm run arch:watch
import { watch } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const WATCH_TARGETS = [
  "src",
  "prisma",
  "next.config.ts",
  "package.json",
  ".archify",
];
const IGNORED =
  /(node_modules|\.next|\.git|\.appdata|\.npm-cache|src[\\/]generated|drift\.json|[\\/]?[^\\/]*\.html$)/;
const DRIFT_FILE = resolve(ROOT, ".archify", "drift.json");

let timer = null;
const pending = new Set();

async function flush() {
  const files = Array.from(pending);
  pending.clear();
  if (files.length === 0) return;

  const payload = {
    changedAt: new Date().toISOString(),
    files: files.slice(0, 25),
  };

  await mkdir(resolve(ROOT, ".archify"), { recursive: true });
  await writeFile(DRIFT_FILE, JSON.stringify(payload, null, 2) + "\n", "utf8");
  console.log(`[archify-watch] ${payload.changedAt} — ${files.length} file berubah`);
}

function schedule(filename) {
  const name = filename ?? "";
  if (name && IGNORED.test(name)) return;
  pending.add(name);
  clearTimeout(timer);
  timer = setTimeout(() => {
    flush().catch((error) => console.error("[archify-watch] gagal menulis drift:", error));
  }, 500);
}

for (const target of WATCH_TARGETS) {
  try {
    watch(resolve(ROOT, target), { recursive: true }, (_event, filename) => schedule(filename));
    console.log(`[archify-watch] memantau ${target}`);
  } catch (error) {
    console.warn(`[archify-watch] tidak bisa memantau ${target}:`, error.message);
  }
}

console.log("[archify-watch] siap — perubahan akan dicatat di .archify/drift.json");
