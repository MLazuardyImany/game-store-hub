import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

/**
 * Integrasi Cloudflare R2 (S3-compatible) — ARCHITECTURE §4B.
 * Aturan keras:
 *  - gambar dikompres ke WebP (maks 1920px, kualitas 80%) SEBELUM upload;
 *  - yang disimpan di database hanya URL publik, bukan buffer/base64.
 */

/** Batas dimensi & kualitas sesuai ARCHITECTURE §4B dan AGENTS.md Rule 2. */
export const IMAGE_MAX_DIMENSION = 1920;
export const IMAGE_WEBP_QUALITY = 80;

let cachedClient: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_DOMAIN,
  );
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variabel ${name} belum diset. Lengkapi .env.local sebelum memakai fitur upload R2.`,
    );
  }
  return value;
}

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const accountId = requireEnv("CLOUDFLARE_ACCOUNT_ID");

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return cachedClient;
}

export interface CompressedImage {
  buffer: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
}

/** Kompresi server-side: auto-rotate EXIF, batasi dimensi, encode WebP q80. */
export async function compressToWebp(input: Buffer): Promise<CompressedImage> {
  const pipeline = sharp(input, { failOn: "error" }).rotate().resize({
    width: IMAGE_MAX_DIMENSION,
    height: IMAGE_MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const { data, info } = await pipeline
    .webp({ quality: IMAGE_WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: data,
    contentType: "image/webp",
    width: info.width,
    height: info.height,
  };
}

export interface UploadedImage {
  url: string;
  key: string;
  bytes: number;
  width: number;
  height: number;
}

export interface UploadImageOptions {
  /** Folder logis di dalam bucket, mis. "accounts" atau "games". */
  folder: string;
  filenameHint?: string;
}

function buildObjectKey(folder: string, filenameHint?: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const base = (filenameHint ?? "image")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${folder}/${year}/${month}/${randomUUID()}-${base || "image"}.webp`;
}

/** URL publik untuk sebuah key, dari R2_PUBLIC_DOMAIN (tanpa slash ganda). */
export function buildPublicUrl(key: string): string {
  const domain = requireEnv("R2_PUBLIC_DOMAIN").replace(/\/+$/, "");
  return `${domain}/${key}`;
}

export async function uploadImage(
  file: Buffer,
  options: UploadImageOptions,
): Promise<UploadedImage> {
  const compressed = await compressToWebp(file);
  const key = buildObjectKey(options.folder, options.filenameHint);

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
      Body: compressed.buffer,
      ContentType: compressed.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    url: buildPublicUrl(key),
    key,
    bytes: compressed.buffer.byteLength,
    width: compressed.width,
    height: compressed.height,
  };
}

/** Hapus objek R2 berdasarkan URL publiknya (dipakai saat stok dihapus). */
export async function deleteImageByUrl(url: string): Promise<boolean> {
  const domain = process.env.R2_PUBLIC_DOMAIN?.replace(/\/+$/, "");
  if (!domain || !url.startsWith(`${domain}/`)) return false;

  const key = url.slice(domain.length + 1);
  if (!key) return false;

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: requireEnv("R2_BUCKET_NAME"),
      Key: key,
    }),
  );

  return true;
}
