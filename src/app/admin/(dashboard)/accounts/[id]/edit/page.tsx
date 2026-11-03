import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AccountForm } from "@/components/admin/account-form";
import { toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";

/** Halaman admin membaca DB saat request; blokir sampai data siap. */
export const instant = false;

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

  const [account, games] = await Promise.all([
    prisma.account.findUnique({
      where: { id },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    prisma.game.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!account) notFound();

  const specs = Object.entries((account.specsJson ?? {}) as Record<string, unknown>).map(
    ([key, value]) => ({ key, value: String(value) }),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Stok</h1>
        <p className="mt-1 font-mono text-xs text-ink-muted">#{account.stockId}</p>
      </header>

      <AccountForm
        games={games}
        initial={{
          id: account.id,
          stockId: account.stockId,
          gameId: account.gameId,
          title: account.title,
          priceIdr: toIdrNumber(account.priceIdr),
          status: account.status,
          description: account.description ?? "",
          specs,
          images: account.images.map((image) => ({
            url: image.r2ImageUrl,
            isPrimary: image.isPrimary,
          })),
        }}
      />
    </div>
  );
}
