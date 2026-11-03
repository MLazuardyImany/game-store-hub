import { formatRupiah } from "@/lib/currency";

/**
 * Notifikasi seller lewat Discord Webhook & Telegram Bot — PRD 09 §2.
 * Semua fungsi di sini "best effort": kegagalan webhook TIDAK boleh
 * menggagalkan atau memperlambat redirect pembeli (AGENTS.md Rule 5).
 */

const REQUEST_TIMEOUT_MS = 5_000;

export interface InquiryEvent {
  channel: "WHATSAPP" | "TELEGRAM" | "DISCORD";
  stockId: string;
  title: string;
  priceIdr: number;
  gameName?: string;
  pageUrl?: string;
  occurredAt?: Date;
}

interface DiscordField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  color: number;
  fields: DiscordField[];
  footer: { text: string };
}

export interface DiscordPayload {
  username: string;
  embeds: DiscordEmbed[];
}

const CHANNEL_LABEL: Record<InquiryEvent["channel"], string> = {
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  DISCORD: "Discord",
};

function formatWib(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(date) + " WIB";
}

export function buildDiscordPayload(event: InquiryEvent): DiscordPayload {
  const occurredAt = event.occurredAt ?? new Date();

  const fields: DiscordField[] = [
    { name: "ID Stok", value: event.stockId, inline: true },
    { name: "Harga", value: formatRupiah(event.priceIdr), inline: true },
    { name: "Judul Akun", value: event.title },
  ];

  if (event.gameName) {
    fields.push({ name: "Game", value: event.gameName, inline: true });
  }

  fields.push(
    { name: "Saluran Diklik", value: CHANNEL_LABEL[event.channel], inline: true },
    { name: "Waktu", value: formatWib(occurredAt), inline: true },
  );

  return {
    username: "Game Store Notification Bot",
    embeds: [
      {
        title: "🔥 ADA CALON BUYER TERTARIK!",
        color: 5_814_783,
        fields,
        footer: { text: "Game Store Catalog System" },
      },
    ],
  };
}

export function buildTelegramMessage(event: InquiryEvent): string {
  const occurredAt = event.occurredAt ?? new Date();
  const lines = [
    "🔔 *NOTIFIKASI CALON PEMBELI BARU!*",
    "",
    `📦 *Stok ID:* ${event.stockId}`,
  ];

  if (event.gameName) lines.push(`🎮 *Game:* ${event.gameName}`);
  lines.push(`📝 *Akun:* ${event.title}`);
  lines.push(`💰 *Harga:* ${formatRupiah(event.priceIdr)}`);
  lines.push(`📲 *Target Saluran:* ${CHANNEL_LABEL[event.channel]}`);

  if (event.pageUrl) lines.push(`🔗 [Buka halaman](${event.pageUrl})`);

  lines.push("", `🕒 ${formatWib(occurredAt)}`);
  lines.push("", "_Pembeli baru saja menekan tombol pesan pada web katalog._");

  return lines.join("\n");
}

async function postJson(url: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    return response.ok;
  } catch (error) {
    console.error("[webhook] gagal mengirim:", error);
    return false;
  }
}

export async function sendDiscordNotification(event: InquiryEvent): Promise<boolean> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return false;

  return postJson(url, buildDiscordPayload(event));
}

export async function sendTelegramNotification(event: InquiryEvent): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  return postJson(`https://api.telegram.org/bot${token}/sendMessage`, {
    chat_id: chatId,
    text: buildTelegramMessage(event),
    parse_mode: "Markdown",
    disable_web_page_preview: false,
  });
}

/**
 * Kirim ke semua kanal yang dikonfigurasi, tanpa menunggu satu sama lain.
 * Selalu resolve (tidak pernah throw) agar pemanggil bisa lanjut redirect.
 */
export async function notifyInquiry(event: InquiryEvent): Promise<{
  discord: boolean;
  telegram: boolean;
}> {
  const [discord, telegram] = await Promise.all([
    sendDiscordNotification(event),
    sendTelegramNotification(event),
  ]);

  return { discord, telegram };
}
