// Konfigurasi Prisma CLI (Prisma 7).
// CLI Prisma 7 mencari file bernama `prisma7.config.ts`.
//
// Sumber env: `.env.local` (satu sumber kebenaran, sama dengan Next.js).
// Di CI/produksi file itu tidak ada; dotenv tidak menimpa variabel yang
// sudah disediakan platform, sehingga `DATABASE_URL` dari dashboard tetap
// dipakai.
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
