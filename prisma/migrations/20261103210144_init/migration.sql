-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('READY', 'BOOKED', 'SOLD');

-- CreateEnum
CREATE TYPE "InquiryChannel" AS ENUM ('WHATSAPP', 'TELEGRAM', 'DISCORD');

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "icon_url" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "stock_id" VARCHAR(50) NOT NULL,
    "game_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "price_idr" DECIMAL(12,2) NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'READY',
    "specs_json" JSONB NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_images" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "r2_image_url" VARCHAR(255) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranks" (
    "id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "rank_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boosting_rates" (
    "id" UUID NOT NULL,
    "from_rank_id" UUID NOT NULL,
    "to_rank_id" UUID NOT NULL,
    "price_per_unit_idr" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gameId" UUID,

    CONSTRAINT "boosting_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_logs" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "channel" "InquiryChannel" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "games_name_idx" ON "games"("name");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_stock_id_key" ON "accounts"("stock_id");

-- CreateIndex
CREATE INDEX "accounts_game_id_status_idx" ON "accounts"("game_id", "status");

-- CreateIndex
CREATE INDEX "accounts_status_price_idr_idx" ON "accounts"("status", "price_idr");

-- CreateIndex
CREATE INDEX "accounts_created_at_idx" ON "accounts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "account_images_account_id_display_order_idx" ON "account_images"("account_id", "display_order");

-- CreateIndex
CREATE INDEX "ranks_game_id_rank_order_idx" ON "ranks"("game_id", "rank_order");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_game_id_name_key" ON "ranks"("game_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ranks_game_id_rank_order_key" ON "ranks"("game_id", "rank_order");

-- CreateIndex
CREATE INDEX "boosting_rates_from_rank_id_idx" ON "boosting_rates"("from_rank_id");

-- CreateIndex
CREATE INDEX "boosting_rates_to_rank_id_idx" ON "boosting_rates"("to_rank_id");

-- CreateIndex
CREATE UNIQUE INDEX "boosting_rates_from_rank_id_to_rank_id_key" ON "boosting_rates"("from_rank_id", "to_rank_id");

-- CreateIndex
CREATE INDEX "inquiry_logs_account_id_created_at_idx" ON "inquiry_logs"("account_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "inquiry_logs_channel_created_at_idx" ON "inquiry_logs"("channel", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_images" ADD CONSTRAINT "account_images_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranks" ADD CONSTRAINT "ranks_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosting_rates" ADD CONSTRAINT "boosting_rates_from_rank_id_fkey" FOREIGN KEY ("from_rank_id") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosting_rates" ADD CONSTRAINT "boosting_rates_to_rank_id_fkey" FOREIGN KEY ("to_rank_id") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boosting_rates" ADD CONSTRAINT "boosting_rates_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_logs" ADD CONSTRAINT "inquiry_logs_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

