/**
 * Format & konversi Rupiah (IDR).
 * Aturan: angka disimpan numerik di DB, diformat hanya saat tampil
 * (AGENTS.md Rule 1). Intl memakai spasi non-breaking; di sini
 * dinormalkan agar konsisten saat diuji dan disalin.
 */
const formatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Nilai yang bisa berasal dari Prisma Decimal, string, atau number. */
export type NumericLike = number | string | { toString(): string };

export function toIdrNumber(value: NumericLike): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value.toString());
  return Number.isFinite(parsed) ? parsed : 0;
}

/** 750000 → "Rp 750.000" */
export function formatRupiah(value: NumericLike): string {
  return formatter.format(toIdrNumber(value)).replace(/\u00a0/g, " ");
}

/** "Rp 1.250.000" / "1250000" → 1250000 (untuk input filter harga). */
export function parseRupiah(input: string): number | null {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.length === 0) return null;

  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Ringkas untuk kartu sempit: 1250000 → "Rp 1,25 jt". */
export function formatRupiahCompact(value: NumericLike): string {
  const amount = toIdrNumber(value);

  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `Rp ${millions.toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
  }

  if (amount >= 1_000) {
    const thousands = amount / 1_000;
    return `Rp ${thousands.toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  }

  return formatRupiah(amount);
}
