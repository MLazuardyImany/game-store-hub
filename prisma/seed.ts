// =====================================================================
// Seed data awal — Game Store Hub
//
// Menjalankan:  npm run db:seed
// Skrip ini idempotent: aman dijalankan berulang (upsert berdasarkan
// kunci unik), sehingga tidak menggandakan data.
//
// Catatan gambar: data seed memakai aset SVG lokal di `public/mock/`
// supaya katalog bisa dilihat tanpa kredensial Cloudflare R2. Pada
// produksi, kolom `r2_image_url` diisi URL publik R2 hasil upload admin
// (AGENTS.md Rule 2).
// =====================================================================
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

import { PrismaClient, type AccountStatus } from "../src/generated/prisma/client";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL belum diset. Isi .env.local terlebih dahulu.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

interface RankSeed {
  name: string;
  rankOrder: number;
}

interface RateSeed {
  from: string;
  to: string;
  price: number;
}

interface GameSeed {
  name: string;
  slug: string;
  iconUrl: string;
  ranks: RankSeed[];
  rates: RateSeed[];
}

interface AccountSeed {
  stockId: string;
  gameSlug: string;
  title: string;
  priceIdr: number;
  status: AccountStatus;
  specs: Record<string, string | number>;
  description: string;
  images: string[];
}

const GAMES: GameSeed[] = [
  {
    name: "Mobile Legends",
    slug: "mobile-legends",
    iconUrl: "/mock/icons/mobile-legends.svg",
    ranks: [
      { name: "Warrior", rankOrder: 1 },
      { name: "Elite", rankOrder: 2 },
      { name: "Master", rankOrder: 3 },
      { name: "Grandmaster", rankOrder: 4 },
      { name: "Epic", rankOrder: 5 },
      { name: "Legend", rankOrder: 6 },
      { name: "Mythic", rankOrder: 7 },
      { name: "Mythical Glory", rankOrder: 8 },
      { name: "Mythical Immortal", rankOrder: 9 },
    ],
    rates: [
      { from: "Warrior", to: "Elite", price: 8000 },
      { from: "Elite", to: "Master", price: 10000 },
      { from: "Master", to: "Grandmaster", price: 12000 },
      { from: "Grandmaster", to: "Epic", price: 15000 },
      { from: "Epic", to: "Legend", price: 18000 },
      { from: "Legend", to: "Mythic", price: 22000 },
      { from: "Mythic", to: "Mythical Glory", price: 30000 },
      { from: "Mythical Glory", to: "Mythical Immortal", price: 45000 },
    ],
  },
  {
    name: "Valorant",
    slug: "valorant",
    iconUrl: "/mock/icons/valorant.svg",
    ranks: [
      { name: "Iron", rankOrder: 1 },
      { name: "Bronze", rankOrder: 2 },
      { name: "Silver", rankOrder: 3 },
      { name: "Gold", rankOrder: 4 },
      { name: "Platinum", rankOrder: 5 },
      { name: "Diamond", rankOrder: 6 },
      { name: "Ascendant", rankOrder: 7 },
      { name: "Immortal", rankOrder: 8 },
      { name: "Radiant", rankOrder: 9 },
    ],
    rates: [
      { from: "Iron", to: "Bronze", price: 15000 },
      { from: "Bronze", to: "Silver", price: 20000 },
      { from: "Silver", to: "Gold", price: 26000 },
      { from: "Gold", to: "Platinum", price: 33000 },
      { from: "Platinum", to: "Diamond", price: 42000 },
      { from: "Diamond", to: "Ascendant", price: 54000 },
      { from: "Ascendant", to: "Immortal", price: 68000 },
      { from: "Immortal", to: "Radiant", price: 95000 },
    ],
  },
  {
    name: "Genshin Impact",
    slug: "genshin-impact",
    iconUrl: "/mock/icons/genshin-impact.svg",
    ranks: [
      { name: "Adventure Rank 35", rankOrder: 1 },
      { name: "Adventure Rank 40", rankOrder: 2 },
      { name: "Adventure Rank 45", rankOrder: 3 },
      { name: "Adventure Rank 50", rankOrder: 4 },
      { name: "Adventure Rank 55", rankOrder: 5 },
      { name: "Adventure Rank 60", rankOrder: 6 },
    ],
    rates: [
      { from: "Adventure Rank 35", to: "Adventure Rank 40", price: 25000 },
      { from: "Adventure Rank 40", to: "Adventure Rank 45", price: 32000 },
      { from: "Adventure Rank 45", to: "Adventure Rank 50", price: 40000 },
      { from: "Adventure Rank 50", to: "Adventure Rank 55", price: 50000 },
      { from: "Adventure Rank 55", to: "Adventure Rank 60", price: 60000 },
    ],
  },
  {
    name: "Free Fire",
    slug: "free-fire",
    iconUrl: "/mock/icons/free-fire.svg",
    ranks: [
      { name: "Bronze", rankOrder: 1 },
      { name: "Silver", rankOrder: 2 },
      { name: "Gold", rankOrder: 3 },
      { name: "Platinum", rankOrder: 4 },
      { name: "Diamond", rankOrder: 5 },
      { name: "Heroic", rankOrder: 6 },
      { name: "Grandmaster", rankOrder: 7 },
    ],
    rates: [
      { from: "Bronze", to: "Silver", price: 7000 },
      { from: "Silver", to: "Gold", price: 9000 },
      { from: "Gold", to: "Platinum", price: 12000 },
      { from: "Platinum", to: "Diamond", price: 16000 },
      { from: "Diamond", to: "Heroic", price: 20000 },
      { from: "Heroic", to: "Grandmaster", price: 25000 },
    ],
  },
];

const ACCOUNTS: AccountSeed[] = [
  {
    stockId: "STOK-ML-101",
    gameSlug: "mobile-legends",
    title: "MLBB Mythic 87 Skin Monsep Lengkap",
    priceIdr: 1_250_000,
    status: "READY",
    specs: {
      "Rank Saat Ini": "Mythic",
      "Jumlah Hero": 110,
      "Jumlah Skin": 87,
      "Win Rate": "68%",
      Binding: "Moonton Unbind",
    },
    description:
      "Akun main sejak season 12, koleksi skin Monsep dan Collector lengkap. Email all-role ready, aman untuk rebind.",
    images: ["/mock/accounts/mlbb-1.svg", "/mock/accounts/mlbb-2.svg"],
  },
  {
    stockId: "STOK-ML-102",
    gameSlug: "mobile-legends",
    title: "MLBB Mythical Glory 120 Skin Collector",
    priceIdr: 3_750_000,
    status: "READY",
    specs: {
      "Rank Saat Ini": "Mythical Glory",
      "Jumlah Hero": 124,
      Emblem: "Max Semua",
      "Jumlah Skin": 120,
      Binding: "Moonton Unbind",
    },
    description:
      "Akun end-game dengan 4 skin Collector dan emblem penuh. Sudah lolos verifikasi tim kami.",
    images: ["/mock/accounts/mlbb-1.svg"],
  },
  {
    stockId: "STOK-ML-103",
    gameSlug: "mobile-legends",
    title: "MLBB Epic 45 Hero All Role",
    priceIdr: 450_000,
    status: "SOLD",
    specs: {
      "Rank Saat Ini": "Epic",
      "Jumlah Hero": 45,
      "Jumlah Skin": 18,
      Binding: "Google Unbind",
    },
    description: "Paket hemat untuk pemula. Stok sudah terjual, bisa request akun serupa.",
    images: ["/mock/accounts/mlbb-2.svg"],
  },
  {
    stockId: "STOK-VAL-201",
    gameSlug: "valorant",
    title: "Valorant Immortal 3 Full Bundle",
    priceIdr: 2_150_000,
    status: "READY",
    specs: {
      "Rank Saat Ini": "Immortal 3",
      "Jumlah Skin": 42,
      Bundle: "Reaver, Prime, Oni",
      Binding: "Riot ID Change Available",
    },
    description:
      "Akun kompetitif dengan MMR stabil. Riot ID bisa diganti satu kali setelah pembelian.",
    images: ["/mock/accounts/valorant-1.svg"],
  },
  {
    stockId: "STOK-VAL-202",
    gameSlug: "valorant",
    title: "Valorant Platinum 2 Reaver Set",
    priceIdr: 650_000,
    status: "READY",
    specs: {
      "Rank Saat Ini": "Platinum 2",
      "Jumlah Skin": 21,
      Bundle: "Reaver",
      Binding: "Email All Role Ready",
    },
    description: "Cocok untuk push rank santai. Semua email terhubung dan bisa dilepas.",
    images: ["/mock/accounts/valorant-1.svg"],
  },
  {
    stockId: "STOK-GI-301",
    gameSlug: "genshin-impact",
    title: "Genshin AR 58 12x 5-Star Character",
    priceIdr: 1_850_000,
    status: "READY",
    specs: {
      "Adventure Rank": 58,
      "5-Star Character": 12,
      "5-Star Weapon": 5,
      "Primogem": "4.200",
      Binding: "Hoyoverse Clean Spec",
    },
    description:
      "Akun bersih tanpa ban, semua region terbuka. Spesifikasi lengkap ada di screenshot.",
    images: ["/mock/accounts/genshin-1.svg"],
  },
  {
    stockId: "STOK-GI-302",
    gameSlug: "genshin-impact",
    title: "Genshin AR 45 Starter Whale",
    priceIdr: 700_000,
    status: "BOOKED",
    specs: {
      "Adventure Rank": 45,
      "5-Star Character": 6,
      "Primogem": "1.800",
      Binding: "Hoyoverse Clean Spec",
    },
    description: "Sedang dalam proses booking. Hubungi admin untuk antrean berikutnya.",
    images: ["/mock/accounts/genshin-1.svg"],
  },
  {
    stockId: "STOK-FF-401",
    gameSlug: "free-fire",
    title: "Free Fire Grandmaster 90 Skin",
    priceIdr: 950_000,
    status: "READY",
    specs: {
      "Rank Saat Ini": "Grandmaster",
      "Jumlah Skin": 90,
      Pet: "Level 60",
      Binding: "FB Unbind",
    },
    description: "Koleksi bundle lama yang sudah tidak dijual lagi. Login harian aktif.",
    images: ["/mock/accounts/free-fire-1.svg"],
  },
];

async function seedGames(): Promise<Map<string, string>> {
  const gameIdBySlug = new Map<string, string>();

  for (const game of GAMES) {
    const record = await prisma.game.upsert({
      where: { slug: game.slug },
      update: { name: game.name, iconUrl: game.iconUrl },
      create: { name: game.name, slug: game.slug, iconUrl: game.iconUrl },
    });
    gameIdBySlug.set(game.slug, record.id);
  }

  return gameIdBySlug;
}

async function seedRanksAndRates(gameIdBySlug: Map<string, string>): Promise<void> {
  for (const game of GAMES) {
    const gameId = gameIdBySlug.get(game.slug);
    if (!gameId) throw new Error(`Game ${game.slug} tidak ditemukan setelah upsert.`);

    const rankIdByName = new Map<string, string>();

    for (const rank of game.ranks) {
      const record = await prisma.rank.upsert({
        where: { gameId_name: { gameId, name: rank.name } },
        update: { rankOrder: rank.rankOrder },
        create: { gameId, name: rank.name, rankOrder: rank.rankOrder },
      });
      rankIdByName.set(rank.name, record.id);
    }

    for (const rate of game.rates) {
      const fromRankId = rankIdByName.get(rate.from);
      const toRankId = rankIdByName.get(rate.to);

      if (!fromRankId || !toRankId) {
        throw new Error(`Rank ${rate.from} → ${rate.to} tidak ditemukan pada game ${game.slug}.`);
      }

      await prisma.boostingRate.upsert({
        where: { fromRankId_toRankId: { fromRankId, toRankId } },
        update: { pricePerUnitIdr: rate.price },
        create: { fromRankId, toRankId, pricePerUnitIdr: rate.price },
      });
    }
  }
}

async function seedAccounts(gameIdBySlug: Map<string, string>): Promise<void> {
  for (const account of ACCOUNTS) {
    const gameId = gameIdBySlug.get(account.gameSlug);
    if (!gameId) throw new Error(`Game ${account.gameSlug} tidak ditemukan.`);

    const images = account.images.map((url, index) => ({
      r2ImageUrl: url,
      isPrimary: index === 0,
      displayOrder: index,
    }));

    await prisma.account.upsert({
      where: { stockId: account.stockId },
      update: {
        gameId,
        title: account.title,
        priceIdr: account.priceIdr,
        status: account.status,
        specsJson: account.specs,
        description: account.description,
        images: { deleteMany: {}, create: images },
      },
      create: {
        stockId: account.stockId,
        gameId,
        title: account.title,
        priceIdr: account.priceIdr,
        status: account.status,
        specsJson: account.specs,
        description: account.description,
        images: { create: images },
      },
    });
  }
}

async function seedInquiryLogs(): Promise<void> {
  const sample = await prisma.account.findUnique({ where: { stockId: "STOK-ML-101" } });
  if (!sample) return;

  const existing = await prisma.inquiryLog.count({ where: { accountId: sample.id } });
  if (existing > 0) return;

  await prisma.inquiryLog.createMany({
    data: [
      { accountId: sample.id, channel: "WHATSAPP" },
      { accountId: sample.id, channel: "WHATSAPP" },
      { accountId: sample.id, channel: "TELEGRAM" },
    ],
  });
}

async function main(): Promise<void> {
  const gameIdBySlug = await seedGames();
  await seedRanksAndRates(gameIdBySlug);
  await seedAccounts(gameIdBySlug);
  await seedInquiryLogs();

  const [games, ranks, rates, accounts, images, logs] = await Promise.all([
    prisma.game.count(),
    prisma.rank.count(),
    prisma.boostingRate.count(),
    prisma.account.count(),
    prisma.accountImage.count(),
    prisma.inquiryLog.count(),
  ]);

  console.log(
    `Seed selesai → games: ${games}, ranks: ${ranks}, boosting_rates: ${rates}, ` +
      `accounts: ${accounts}, account_images: ${images}, inquiry_logs: ${logs}`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
