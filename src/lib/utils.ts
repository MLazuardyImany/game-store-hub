import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan daftar class Tailwind secara deterministik.
 * class yang berkonflik (mis. `p-2` dan `p-4`) diselesaikan oleh tailwind-merge,
 * class kondisional diselesaikan oleh clsx.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
