import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 tidak lagi memakai query engine bawaan; koneksi PostgreSQL
 * diberikan lewat driver adapter `@prisma/adapter-pg`.
 *
 * Client disimpan pada `globalThis` saat development supaya Next.js
 * Fast Refresh tidak membuat koneksi baru setiap kali modul dievaluasi
 * ulang (menghindari "too many clients" di PostgreSQL).
 */
const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL belum diset. Salin .env.example menjadi .env.local lalu isi nilainya.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma: PrismaClient =
  globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
