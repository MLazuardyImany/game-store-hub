import { formatRupiah } from "@/lib/currency";

/**
 * Pembuatan deep-link CTA dan template pesan (PRD 04 §3, PRD 09 §1).
 * Aturan: selalu encodeURIComponent pada isi pesan, dan pesan wajib
 * memuat stock_id, judul, serta harga dalam IDR (AGENTS.md Rule 3).
 */
export type CtaChannel = "WHATSAPP" | "TELEGRAM" | "DISCORD";

const FALLBACK_PHONE = "6281234567890";
const FALLBACK_TELEGRAM = "gamestorehub";
const FALLBACK_DISCORD = "https://discord.gg/gamestorehub";

function normalizePhone(raw: string | undefined): string {
  const digits = (raw ?? "").replace(/[^\d]/g, "");
  if (digits.length === 0) return FALLBACK_PHONE;

  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

function normalizeTelegram(raw: string | undefined): string {
  const handle = (raw ?? "").replace(/^@+/, "").trim();
  return handle.length > 0 ? handle : FALLBACK_TELEGRAM;
}

export function buildWhatsAppUrl(message: string): string {
  const phone = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildTelegramUrl(message: string): string {
  const handle = normalizeTelegram(process.env.NEXT_PUBLIC_TELEGRAM_USERNAME);
  return `https://t.me/${handle}?text=${encodeURIComponent(message)}`;
}

export function buildDiscordUrl(): string {
  const url = process.env.NEXT_PUBLIC_DISCORD_URL?.trim();
  return url && url.length > 0 ? url : FALLBACK_DISCORD;
}

export interface AccountInquiryInput {
  title: string;
  stockId: string;
  priceIdr: number;
  pageUrl?: string;
}

export function buildAccountInquiryMessage(input: AccountInquiryInput): string {
  const lines = [
    `Halo Admin, saya ingin membeli stok akun *${input.title}* (ID: *${input.stockId}*) ` +
      `seharga *${formatRupiah(input.priceIdr)}*. Apakah stok ini masih ready?`,
  ];

  if (input.pageUrl) {
    lines.push("", `Link: ${input.pageUrl}`);
  }

  return lines.join("\n");
}

export interface BoostingInquiryInput {
  gameName: string;
  fromRank: string;
  toRank: string;
  addons: string[];
  totalIdr: number;
  estimatedDays: string;
}

export function buildBoostingInquiryMessage(input: BoostingInquiryInput): string {
  const addons = input.addons.length > 0 ? input.addons.join(", ") : "Tidak ada";

  return [
    `Halo Admin, saya mau order Jasa Boosting *${input.gameName}*:`,
    `- Rank Awal: *${input.fromRank}*`,
    `- Rank Target: *${input.toRank}*`,
    `- Add-ons: *${addons}*`,
    `- Estimasi Biaya: *${formatRupiah(input.totalIdr)}*`,
    `- Estimasi Waktu: *${input.estimatedDays}*`,
    "",
    "Mohon info ketersediaan joki. Terima kasih!",
  ].join("\n");
}

/** Semua kanal sekaligus, dipakai tombol multi-channel di halaman detail. */
export function buildCtaLinks(message: string): Array<{
  channel: CtaChannel;
  label: string;
  href: string;
}> {
  return [
    { channel: "WHATSAPP", label: "Beli via WhatsApp", href: buildWhatsAppUrl(message) },
    { channel: "TELEGRAM", label: "Order Telegram", href: buildTelegramUrl(message) },
    { channel: "DISCORD", label: "Discord", href: buildDiscordUrl() },
  ];
}
