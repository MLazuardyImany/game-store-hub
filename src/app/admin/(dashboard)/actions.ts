"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { gameInputSchema, rankInputSchema, rateInputSchema } from "@/lib/validation";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createGameAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = gameInputSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug").toLowerCase(),
    iconUrl: str(formData, "iconUrl") || null,
  });

  if (!parsed.success) {
    redirect("/admin/categories?error=Data+kategori+tidak+valid");
  }

  try {
    await prisma.game.create({ data: parsed.data });
  } catch {
    redirect("/admin/categories?error=Slug+sudah+dipakai+atau+data+duplikat");
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories?ok=Kategori+dibuat");
}

export async function updateGameAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = str(formData, "id");
  const parsed = gameInputSchema.safeParse({
    name: str(formData, "name"),
    slug: str(formData, "slug").toLowerCase(),
    iconUrl: str(formData, "iconUrl") || null,
  });

  if (!id || !parsed.success) {
    redirect("/admin/categories?error=Data+kategori+tidak+valid");
  }

  try {
    await prisma.game.update({ where: { id }, data: parsed.data });
  } catch {
    redirect("/admin/categories?error=Gagal+memperbarui+kategori");
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories?ok=Kategori+diperbarui");
}

export async function deleteGameAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) redirect("/admin/categories?error=ID+kosong");

  try {
    await prisma.game.delete({ where: { id } });
  } catch {
    redirect("/admin/categories?error=Game+masih+punya+stok+atau+tarif");
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories?ok=Kategori+dihapus");
}

export async function createRankAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = rankInputSchema.safeParse({
    gameId: str(formData, "gameId"),
    name: str(formData, "name"),
    rankOrder: Number(str(formData, "rankOrder")),
  });

  if (!parsed.success) {
    redirect("/admin/boosting?error=Rank+tidak+valid");
  }

  try {
    await prisma.rank.create({ data: parsed.data });
  } catch {
    redirect("/admin/boosting?error=Nama+atau+urutan+rank+sudah+dipakai");
  }

  revalidatePath("/admin/boosting");
  redirect("/admin/boosting?ok=Rank+ditambahkan");
}

export async function upsertRateAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const fromRankId = str(formData, "fromRankId");
  const toRankId = str(formData, "toRankId");
  const price = Number(str(formData, "pricePerUnitIdr").replace(/[^\d]/g, ""));

  const parsed = rateInputSchema.safeParse({
    fromRankId,
    toRankId,
    pricePerUnitIdr: price,
  });

  if (!parsed.success) {
    redirect("/admin/boosting?error=Tarif+tidak+valid");
  }

  const [from, to] = await Promise.all([
    prisma.rank.findUnique({ where: { id: fromRankId } }),
    prisma.rank.findUnique({ where: { id: toRankId } }),
  ]);

  if (!from || !to || from.rankOrder >= to.rankOrder || from.gameId !== to.gameId) {
    redirect("/admin/boosting?error=Rank+tujuan+harus+lebih+tinggi+dan+satu+game");
  }

  await prisma.boostingRate.upsert({
    where: { fromRankId_toRankId: { fromRankId, toRankId } },
    update: { pricePerUnitIdr: parsed.data.pricePerUnitIdr },
    create: {
      fromRankId,
      toRankId,
      pricePerUnitIdr: parsed.data.pricePerUnitIdr,
    },
  });

  revalidatePath("/admin/boosting");
  redirect("/admin/boosting?ok=Tarif+disimpan");
}

export async function deleteRateAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) redirect("/admin/boosting?error=ID+kosong");

  await prisma.boostingRate.delete({ where: { id } }).catch(() => undefined);

  revalidatePath("/admin/boosting");
  redirect("/admin/boosting?ok=Tarif+dihapus");
}
