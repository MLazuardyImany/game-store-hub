import { connection } from "next/server";

import { formatRupiah, toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";

const CHANNEL_LABEL: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  DISCORD: "Discord",
};

/** Analitik sederhana: stok yang paling banyak menerima klik CTA (PRD 06 §5). */
export default async function AdminAnalyticsPage() {
  await connection();

  const [total, byChannel, topAccounts] = await Promise.all([
    prisma.inquiryLog.count(),
    prisma.inquiryLog.groupBy({ by: ["channel"], _count: { _all: true } }),
    prisma.account.findMany({
      orderBy: { inquiryLogs: { _count: "desc" } },
      take: 15,
      select: {
        stockId: true,
        title: true,
        status: true,
        priceIdr: true,
        game: { select: { name: true } },
        _count: { select: { inquiryLogs: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Analitik Klik CTA</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Dihitung dari <code className="text-accent">inquiry_logs</code> — setiap klik tombol
          WhatsApp/Telegram/Discord pada halaman detail.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-4">
        <li className="rounded-card border border-line/70 bg-surface/50 p-4">
          <p className="text-[11px] text-ink-muted">Total klik</p>
          <p className="mt-1 text-2xl font-semibold">{total}</p>
        </li>
        {byChannel.map((row) => (
          <li key={row.channel} className="rounded-card border border-line/70 bg-surface/50 p-4">
            <p className="text-[11px] text-ink-muted">
              {CHANNEL_LABEL[row.channel] ?? row.channel}
            </p>
            <p className="mt-1 text-2xl font-semibold">{row._count._all}</p>
          </li>
        ))}
      </ul>

      <div className="overflow-x-auto rounded-card border border-line/70">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="bg-surface/70 text-left text-[11px] tracking-wide text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">ID Stok</th>
              <th className="px-4 py-3 font-medium">Judul</th>
              <th className="px-4 py-3 font-medium">Game</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Klik</th>
            </tr>
          </thead>
          <tbody>
            {topAccounts.map((account, index) => (
              <tr key={account.stockId} className="border-t border-line/50">
                <td className="px-4 py-3 text-ink-muted">{index + 1}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">
                  {account.stockId}
                </td>
                <td className="max-w-[280px] truncate px-4 py-3 text-ink">{account.title}</td>
                <td className="px-4 py-3 text-ink-muted">{account.game.name}</td>
                <td className="px-4 py-3 text-ink">{formatRupiah(toIdrNumber(account.priceIdr))}</td>
                <td className="px-4 py-3 font-semibold text-accent">
                  {account._count.inquiryLogs}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total === 0 ? (
        <p className="rounded-card border border-dashed border-line/70 p-8 text-center text-sm text-ink-muted">
          Belum ada klik tercatat. Data muncul setelah pembeli menekan tombol CTA.
        </p>
      ) : null}
    </div>
  );
}
