import { Prisma } from "@/generated/prisma/client";
import { connection } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { notifyInquiry } from "@/lib/webhook";


const payloadSchema = z.object({
  stock_id: z.string().min(1).max(50),
  channel: z.enum(["WHATSAPP", "TELEGRAM", "DISCORD"]),
  title: z.string().min(1).max(255).optional(),
  game_name: z.string().min(1).max(100).optional(),
  price_idr: z.number().nonnegative().optional(),
});

/**
 * POST /api/v1/inquiry
 * Mencatat klik CTA lalu memicu webhook secara asynchronous.
 * Respons selalu cepat; kegagalan webhook tidak menggagalkan request.
 */
export async function POST(request: Request): Promise<Response> {
  await connection();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: "Payload tidak valid.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { stock_id, channel } = parsed.data;

  try {
    const account = await prisma.account.findUnique({
      where: { stockId: stock_id },
      select: { id: true, title: true, priceIdr: true, game: { select: { name: true } } },
    });

    if (!account) {
      return Response.json({ success: false, error: "Stok tidak ditemukan." }, { status: 404 });
    }

    await prisma.inquiryLog.create({ data: { accountId: account.id, channel } });

    // Tidak di-await: pembeli harus langsung diarahkan ke chat.
    void notifyInquiry({
      channel,
      stockId: stock_id,
      title: account.title,
      priceIdr: Number(account.priceIdr),
      gameName: account.game.name,
    });

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("[inquiry] prisma error:", error.code);
    } else {
      console.error("[inquiry] gagal mencatat:", error);
    }

    return Response.json(
      { success: false, error: "Gagal mencatat inquiry." },
      { status: 500 },
    );
  }
}
