import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";

import { ImageGallery } from "@/components/catalog/image-gallery";
import { InquiryButtons } from "@/components/catalog/inquiry-buttons";
import { buildAccountInquiryMessage, buildCtaLinks } from "@/lib/cta";
import { formatRupiah } from "@/lib/currency";
import { getAccountDetail } from "@/lib/queries";

/** Halaman memakai data runtime (DB) sehingga tidak di-prerender. */
export const instant = false;

interface PageProps {
  params: Promise<{ stock_id: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  READY: "READY",
  BOOKED: "BOOKED",
  SOLD: "TERJUAL",
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { stock_id } = await params;
  const account = await getAccountDetail(decodeURIComponent(stock_id));

  if (!account) return { title: "Stok tidak ditemukan" };

  const prefix = account.status === "READY" ? "[READY] " : "";
  const title = `${prefix}${account.title} - ${formatRupiah(account.priceIdr)}`;
  const description = `${account.gameName} · ${Object.entries(account.specs)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" · ")}`;

  const image = account.primaryImageUrl?.startsWith("http")
    ? account.primaryImageUrl
    : `${siteUrl()}${account.primaryImageUrl ?? ""}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${siteUrl()}/account/${account.stockId}`,
      images: account.primaryImageUrl ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: account.primaryImageUrl ? [image] : undefined,
    },
  };
}

export default async function AccountDetailPage({ params }: PageProps) {
  await connection();
  const { stock_id } = await params;
  const account = await getAccountDetail(decodeURIComponent(stock_id));

  if (!account) notFound();

  const isSold = account.status === "SOLD";
  const message = buildAccountInquiryMessage({
    title: account.title,
    stockId: account.stockId,
    priceIdr: account.priceIdr,
    pageUrl: `${siteUrl()}/account/${account.stockId}`,
  });
  const links = buildCtaLinks(message);
  const specs = Object.entries(account.specs);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-12">
      <Link
        href={`/catalog/${account.gameSlug}`}
        className="inline-flex items-center gap-2 text-xs text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Kembali ke katalog {account.gameName}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section>
          <ImageGallery images={account.images} title={account.title} />

          <div className="mt-8 rounded-card border border-line/70 bg-surface/50 p-5">
            <h2 className="text-sm font-semibold">Spesifikasi Akun</h2>
            <dl className="mt-3 divide-y divide-line/60">
              <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="text-ink-muted">ID Stok</dt>
                <dd className="font-mono text-xs text-ink">#{account.stockId}</dd>
              </div>
              {specs.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-ink-muted">{key}</dt>
                  <dd className="text-right font-medium text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>

          {account.description ? (
            <div className="mt-6 rounded-card border border-line/70 bg-surface/50 p-5">
              <h2 className="text-sm font-semibold">Catatan Penjual</h2>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-muted">
                {account.description}
              </p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-card border border-line/70 bg-surface/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-accent-emerald" aria-hidden />
                Garansi Unbind
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Garansi mengikuti status binding pada tabel spesifikasi. Klaim berlaku bila
                data akun tidak sesuai deskripsi.
              </p>
            </div>
            <div className="rounded-card border border-line/70 bg-surface/50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <BadgeCheck className="size-4 text-accent" aria-hidden />
                Transaksi Aman
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Pembayaran hanya melalui kanal resmi toko. Rekber tersedia atas permintaan.
              </p>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line/70 bg-surface/70 p-5 shadow-card">
            <p className="text-[11px] tracking-wide text-ink-muted uppercase">
              {account.gameName}
            </p>
            <h1 className="mt-1 text-xl leading-snug font-semibold">{account.title}</h1>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                  account.status === "READY"
                    ? "bg-accent-emerald/15 text-accent-emerald ring-accent-emerald/40"
                    : account.status === "BOOKED"
                      ? "bg-amber-400/15 text-amber-300 ring-amber-400/40"
                      : "bg-accent-danger/15 text-accent-danger ring-accent-danger/40"
                }`}
              >
                {STATUS_LABEL[account.status] ?? account.status}
              </span>
              <span className="font-mono text-[11px] text-ink-muted">#{account.stockId}</span>
            </div>

            <p className="mt-4 text-2xl font-semibold text-accent-emerald">
              {formatRupiah(account.priceIdr)}
            </p>

            <div className="mt-5">
              {isSold ? (
                <div className="rounded-xl border border-accent-danger/40 bg-accent-danger/10 p-4 text-sm text-accent-danger">
                  Stok ini sudah terjual.{" "}
                  <Link href={`/catalog/${account.gameSlug}`} className="underline">
                    Lihat stok serupa
                  </Link>
                  .
                </div>
              ) : (
                <InquiryButtons
                  links={links}
                  message={message}
                  stockId={account.stockId}
                  gameName={account.gameName}
                  title={account.title}
                  priceIdr={account.priceIdr}
                />
              )}
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
              Tombol di atas membuka chat admin dengan pesan yang sudah terisi otomatis.
            </p>
          </div>
        </aside>
      </div>

      {!isSold ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-obsidian/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] text-ink-muted">{account.title}</p>
              <p className="text-sm font-semibold text-accent-emerald">
                {formatRupiah(account.priceIdr)}
              </p>
            </div>
            <InquiryButtons
              compact
              links={links.filter((link) => link.channel !== "DISCORD")}
              message={message}
              stockId={account.stockId}
              gameName={account.gameName}
              title={account.title}
              priceIdr={account.priceIdr}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
