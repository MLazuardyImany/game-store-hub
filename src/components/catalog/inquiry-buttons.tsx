"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Send } from "lucide-react";

import type { CtaChannel } from "@/lib/cta";

export interface CtaLink {
  channel: CtaChannel;
  label: string;
  href: string;
}

const ICON: Record<CtaChannel, typeof MessageCircle> = {
  WHATSAPP: MessageCircle,
  TELEGRAM: Send,
  DISCORD: Send,
};

const STYLE: Record<CtaChannel, string> = {
  WHATSAPP: "bg-accent-emerald text-obsidian hover:bg-accent-emerald/90",
  TELEGRAM: "bg-accent text-obsidian hover:bg-accent/90",
  DISCORD: "border border-line bg-surface text-ink hover:border-accent-violet/60",
};

/**
 * Tombol CTA: mencatat klik ke /api/v1/inquiry (fire-and-forget) lalu
 * langsung membuka kanal chat. Webhook tidak boleh menahan redirect
 * (AGENTS.md Rule 5).
 */
export function InquiryButtons({
  links,
  message,
  stockId,
  gameName,
  title,
  priceIdr,
  compact = false,
}: {
  links: CtaLink[];
  message: string;
  stockId: string;
  gameName: string;
  title: string;
  priceIdr: number;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function logInquiry(channel: CtaChannel) {
    void fetch("/api/v1/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stock_id: stockId,
        channel,
        title,
        game_name: gameName,
        price_idr: priceIdr,
      }),
      keepalive: true,
    }).catch(() => {
      /* pencatatan gagal tidak boleh menghalangi pembeli */
    });
  }

  async function handleClick(link: CtaLink) {
    logInquiry(link.channel);

    if (link.channel === "DISCORD") {
      try {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {
        /* clipboard bisa diblokir browser; tetap buka Discord */
      }
    }

    window.open(link.href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-2 sm:grid-cols-3"}>
      {links.map((link) => {
        const Icon = link.channel === "DISCORD" && copied ? Check : ICON[link.channel];

        return (
          <button
            key={link.channel}
            type="button"
            onClick={() => void handleClick(link)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${STYLE[link.channel]}`}
          >
            <Icon className="size-4" aria-hidden />
            {link.channel === "DISCORD" && copied ? "Pesan tersalin" : link.label}
          </button>
        );
      })}

      {copied ? (
        <p className="col-span-2 inline-flex items-center gap-1.5 text-[11px] text-accent-emerald sm:col-span-3">
          <Copy className="size-3.5" aria-hidden />
          Format pesan disalin ke clipboard — tempel di Discord bila perlu.
        </p>
      ) : null}
    </div>
  );
}
