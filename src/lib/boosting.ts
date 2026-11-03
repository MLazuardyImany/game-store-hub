/**
 * Mesin hitung jasa boosting — fungsi murni, tanpa I/O, mudah diuji.
 * Rumus (ARCHITECTURE §4C):
 *   total = (Σ tarif tier yang dilewati) × (1 + Σ multiplier add-on)
 * Penjumlahan bersifat sekuensial memakai `rankOrder`, sehingga admin
 * tidak perlu mengisi matriks semua pasangan rank.
 */

export interface RankRef {
  id: string;
  name: string;
  rankOrder: number;
}

export interface RateRef {
  fromRankId: string;
  toRankId: string;
  pricePerUnitIdr: number;
}

/** Data satu game yang dibutuhkan kalkulator (aman untuk klien). */
export interface BoostingGame {
  id: string;
  name: string;
  slug: string;
  ranks: RankRef[];
  rates: RateRef[];
}

export interface BoostingAddon {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

/** Add-on tetap sesuai PRD 05 §1 (Express +15%, Hero +10%, Mabar +20%). */
export const BOOSTING_ADDONS: readonly BoostingAddon[] = [
  {
    id: "express",
    label: "Pengerjaan Express",
    description: "Dikerjakan kilat, prioritas antrean joki.",
    multiplier: 0.15,
  },
  {
    id: "request_hero",
    label: "Request Hero Spesifik",
    description: "Joki hanya memakai hero pilihan Anda.",
    multiplier: 0.1,
  },
  {
    id: "mabar",
    label: "Mabar bersama Joki",
    description: "Bermain bersama joki, bukan login akun.",
    multiplier: 0.2,
  },
] as const;

export interface BoostingBreakdownItem {
  fromRank: string;
  toRank: string;
  priceIdr: number;
}

export interface BoostingResult {
  ok: boolean;
  error?: string;
  subtotalIdr: number;
  addonTotalIdr: number;
  totalIdr: number;
  multiplier: number;
  breakdown: BoostingBreakdownItem[];
  estimatedDays: string;
  tiers: number;
}

const EMPTY: BoostingResult = {
  ok: false,
  subtotalIdr: 0,
  addonTotalIdr: 0,
  totalIdr: 0,
  multiplier: 1,
  breakdown: [],
  estimatedDays: "-",
  tiers: 0,
};

export function estimateDays(tiers: number): string {
  if (tiers <= 0) return "-";
  if (tiers <= 2) return "1-2 Hari";
  if (tiers <= 4) return "2-4 Hari";
  if (tiers <= 6) return "3-6 Hari";
  return "5-10 Hari";
}

export function calculateBoosting(input: {
  ranks: RankRef[];
  rates: RateRef[];
  fromRankId: string;
  toRankId: string;
  addonIds: string[];
}): BoostingResult {
  const byId = new Map(input.ranks.map((rank) => [rank.id, rank]));
  const from = byId.get(input.fromRankId);
  const to = byId.get(input.toRankId);

  if (!from || !to) {
    return { ...EMPTY, error: "Rank awal atau rank tujuan tidak dikenal." };
  }

  if (to.rankOrder <= from.rankOrder) {
    return {
      ...EMPTY,
      error: "Rank tujuan harus lebih tinggi daripada rank awal.",
    };
  }

  // Segmen yang dilewati: dari rank berjalan sampai satu langkah sebelum target.
  const segments = input.rates
    .map((rate) => ({
      rate,
      start: byId.get(rate.fromRankId),
      end: byId.get(rate.toRankId),
    }))
    .filter((item): item is { rate: RateRef; start: RankRef; end: RankRef } =>
      Boolean(item.start && item.end),
    )
    .filter(
      (item) =>
        item.start.rankOrder >= from.rankOrder && item.end.rankOrder <= to.rankOrder,
    )
    .sort((a, b) => a.start.rankOrder - b.start.rankOrder);

  if (segments.length === 0) {
    return {
      ...EMPTY,
      error: "Tarif untuk rentang rank ini belum tersedia. Hubungi admin.",
    };
  }

  const breakdown: BoostingBreakdownItem[] = segments.map((item) => ({
    fromRank: item.start.name,
    toRank: item.end.name,
    priceIdr: item.rate.pricePerUnitIdr,
  }));

  const subtotalIdr = breakdown.reduce((sum, item) => sum + item.priceIdr, 0);

  const selected = BOOSTING_ADDONS.filter((addon) => input.addonIds.includes(addon.id));
  const multiplier = 1 + selected.reduce((sum, addon) => sum + addon.multiplier, 0);
  const totalIdr = Math.round(subtotalIdr * multiplier);

  return {
    ok: true,
    subtotalIdr,
    addonTotalIdr: totalIdr - subtotalIdr,
    totalIdr,
    multiplier,
    breakdown,
    estimatedDays: estimateDays(segments.length),
    tiers: segments.length,
  };
}

/** Nama add-on yang dipilih, untuk template pesan CTA. */
export function addonLabels(addonIds: string[]): string[] {
  return BOOSTING_ADDONS.filter((addon) => addonIds.includes(addon.id)).map(
    (addon) => addon.label,
  );
}
