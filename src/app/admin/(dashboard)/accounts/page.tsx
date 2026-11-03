import Link from "next/link";
import { connection } from "next/server";
import { Pencil, Plus } from "lucide-react";

import { StatusToggle } from "@/components/admin/status-toggle";
import { formatRupiah, toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";

export default async function AdminAccountsPage() {
  await connection();

  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      game: { select: { name: true } },
      _count: { select: { inquiryLogs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Stok Akun</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {accounts.length} stok terdaftar. Klik badge status untuk mengubahnya.
          </p>
        </div>

        <Link
          href="/admin/accounts/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-obsidian"
        >
          <Plus className="size-4" aria-hidden />
          Stok baru
        </Link>
      </header>

      <div className="overflow-x-auto rounded-card border border-line/70">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface/70 text-left text-[11px] tracking-wide text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Game</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Klik</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-t border-line/50 hover:bg-surface/40">
                <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                  {account.stockId}
                </td>
                <td className="max-w-[280px] truncate px-4 py-3 text-ink">{account.title}</td>
                <td className="px-4 py-3 text-ink-muted">{account.game.name}</td>
                <td className="px-4 py-3 text-ink">{formatRupiah(toIdrNumber(account.priceIdr))}</td>
                <td className="px-4 py-3">
                  <StatusToggle id={account.id} status={account.status} />
                </td>
                <td className="px-4 py-3 text-ink-muted">{account._count.inquiryLogs}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/accounts/${account.id}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-muted hover:text-ink"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {accounts.length === 0 ? (
        <p className="rounded-card border border-dashed border-line/70 p-8 text-center text-sm text-ink-muted">
          Belum ada stok. Tambahkan stok pertama Anda.
        </p>
      ) : null}
    </div>
  );
}
