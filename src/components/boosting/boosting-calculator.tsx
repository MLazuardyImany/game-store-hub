"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Send, Sparkles } from "lucide-react";

import {
  BOOSTING_ADDONS,
  addonLabels,
  calculateBoosting,
  type BoostingGame,
} from "@/lib/boosting";import { buildBoostingInquiryMessage, buildTelegramUrl, buildWhatsAppUrl } from "@/lib/cta";
import { formatRupiah } from "@/lib/currency";

/** Kalkulator boosting interaktif — PRD 05 §1, dihitung real-time di klien. */
export function BoostingCalculator({ games }: { games: BoostingGame[] }) {
  const [gameId, setGameId] = useState(games[0]?.id ?? "");
  const [fromRankId, setFromRankId] = useState<string>(() => {
    const first = games[0];
    return first?.ranks[0]?.id ?? "";
  });
  const [toRankId, setToRankId] = useState<string>(() => {
    const first = games[0];
    return first?.ranks[first.ranks.length - 1]?.id ?? "";
  });
  const [addonIds, setAddonIds] = useState<string[]>([]);

  const game = useMemo(() => games.find((item) => item.id === gameId) ?? games[0], [games, gameId]);

  const result = useMemo(() => {
    if (!game) return null;
    return calculateBoosting({
      ranks: game.ranks,
      rates: game.rates,
      fromRankId,
      toRankId,
      addonIds,
    });
  }, [game, fromRankId, toRankId, addonIds]);

  function selectGame(nextId: string) {
    setGameId(nextId);
    const next = games.find((item) => item.id === nextId);
    if (next) {
      setFromRankId(next.ranks[0]?.id ?? "");
      setToRankId(next.ranks[next.ranks.length - 1]?.id ?? "");
    }
  }

  function toggleAddon(id: string) {
    setAddonIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  if (!game || !result) {
    return (
      <p className="rounded-card border border-dashed border-line/70 p-8 text-center text-sm text-ink-muted">
        Data tarif boosting belum tersedia.
      </p>
    );
  }

  const fromRank = game.ranks.find((rank) => rank.id === fromRankId);
  const toRank = game.ranks.find((rank) => rank.id === toRankId);
  const message =
    result.ok && fromRank && toRank
      ? buildBoostingInquiryMessage({
          gameName: game.name,
          fromRank: fromRank.name,
          toRank: toRank.name,
          addons: addonLabels(addonIds),
          totalIdr: result.totalIdr,
          estimatedDays: result.estimatedDays,
        })
      : "";

  const fieldClass =
    "min-h-11 w-full rounded-lg border border-line bg-backdrop/70 px-3 text-sm text-ink outline-none focus:border-accent/60";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5 rounded-card border border-line/70 bg-surface/50 p-5">
        <div>
          <p className="mb-2 text-[11px] tracking-wide text-ink-muted uppercase">Pilih game</p>
          <div className="flex flex-wrap gap-2">
            {games.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectGame(item.id)}
                aria-pressed={item.id === game.id}
                className={`min-h-11 rounded-lg border px-4 text-sm transition ${
                  item.id === game.id
                    ? "border-accent bg-accent/15 font-semibold text-accent"
                    : "border-line text-ink-muted hover:border-accent/40 hover:text-ink"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="from" className="mb-1.5 block text-[11px] text-ink-muted">
              Rank awal
            </label>
            <select
              id="from"
              value={fromRankId}
              onChange={(event) => setFromRankId(event.target.value)}
              className={fieldClass}
            >
              {game.ranks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="to" className="mb-1.5 block text-[11px] text-ink-muted">
              Rank tujuan
            </label>
            <select
              id="to"
              value={toRankId}
              onChange={(event) => setToRankId(event.target.value)}
              className={fieldClass}
            >
              {game.ranks.map((rank) => (
                <option key={rank.id} value={rank.id}>
                  {rank.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-[11px] tracking-wide text-ink-muted uppercase">
            Add-ons (opsional)
          </legend>
          <div className="space-y-2">
            {BOOSTING_ADDONS.map((addon) => (
              <label
                key={addon.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-line/70 p-3 transition hover:border-accent/40"
              >
                <input
                  type="checkbox"
                  checked={addonIds.includes(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                  className="mt-0.5 size-4 accent-cyan-500"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    {addon.label}
                    <span className="text-[11px] text-accent">
                      +{Math.round(addon.multiplier * 100)}%
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {addon.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4">
        <div className="rounded-card border border-line/70 bg-surface/70 p-5 shadow-card">
          <p className="text-[11px] tracking-wide text-ink-muted uppercase">Estimasi biaya</p>

          {result.ok ? (
            <>
              <p className="mt-2 text-3xl font-semibold text-accent-emerald">
                {formatRupiah(result.totalIdr)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                <Clock className="size-3.5" aria-hidden />
                Estimasi pengerjaan {result.estimatedDays}
              </p>

              <dl className="mt-4 space-y-1.5 border-t border-line/60 pt-3 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <dt>Subtotal tarif</dt>
                  <dd>{formatRupiah(result.subtotalIdr)}</dd>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <dt>Add-on ({Math.round((result.multiplier - 1) * 100)}%)</dt>
                  <dd>{formatRupiah(result.addonTotalIdr)}</dd>
                </div>
                {result.breakdown.map((item) => (
                  <div
                    key={`${item.fromRank}-${item.toRank}`}
                    className="flex justify-between text-ink-muted/80"
                  >
                    <dt>
                      {item.fromRank} → {item.toRank}
                    </dt>
                    <dd>{formatRupiah(item.priceIdr)}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 space-y-2">
                <a
                  href={buildWhatsAppUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-emerald text-sm font-semibold text-obsidian transition hover:bg-accent-emerald/90"
                >
                  <Sparkles className="size-4" aria-hidden />
                  Pesan Joki via WA
                </a>
                <a
                  href={buildTelegramUrl(message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-ink transition hover:border-accent/50"
                >
                  <Send className="size-4" aria-hidden />
                  Kirim ke Telegram
                </a>
              </div>
            </>
          ) : (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {result.error}
            </p>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-ink-muted">
          Estimasi bersifat acuan. Harga final dikonfirmasi admin setelah melihat rank dan
          riwayat akun.
        </p>
      </aside>
    </div>
  );
}
