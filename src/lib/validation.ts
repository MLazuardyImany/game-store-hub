import { z } from "zod";

/** Skema validasi input admin (PRD 11 §4: sanitasi dengan Zod). */

export const accountImageSchema = z.object({
  url: z.string().min(1).max(500),
  isPrimary: z.boolean().default(false),
});

export const accountInputSchema = z.object({
  stockId: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, "ID stok hanya boleh huruf, angka, dan tanda hubung."),
  gameId: z.string().uuid(),
  title: z.string().min(3).max(255),
  priceIdr: z.number().int().nonnegative().max(999_999_999_999),
  status: z.enum(["READY", "BOOKED", "SOLD"]).default("READY"),
  description: z.string().max(5_000).nullish(),
  specs: z
    .record(z.string().min(1).max(50), z.union([z.string().max(200), z.number()]))
    .default({}),
  images: z.array(accountImageSchema).max(10).default([]),
});

export type AccountInput = z.infer<typeof accountInputSchema>;

export const statusInputSchema = z.object({
  status: z.enum(["READY", "BOOKED", "SOLD"]),
});

export const gameInputSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung."),
  iconUrl: z.string().max(500).nullish(),
});

export const rankInputSchema = z.object({
  gameId: z.string().uuid(),
  name: z.string().min(1).max(50),
  rankOrder: z.number().int().min(1).max(999),
});

export const rateInputSchema = z.object({
  fromRankId: z.string().uuid(),
  toRankId: z.string().uuid(),
  pricePerUnitIdr: z.number().int().nonnegative().max(999_999_999),
});

/** Pastikan tepat satu gambar utama; bila kosong, gambar pertama jadi utama. */
export function normalizeImages(
  images: Array<{ url: string; isPrimary: boolean }>,
): Array<{ r2ImageUrl: string; isPrimary: boolean; displayOrder: number }> {
  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const chosen = primaryIndex >= 0 ? primaryIndex : 0;

  return images.map((image, index) => ({
    r2ImageUrl: image.url,
    isPrimary: index === chosen,
    displayOrder: index,
  }));
}
