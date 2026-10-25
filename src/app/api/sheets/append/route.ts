import { z } from "zod";

import { appendListingRow } from "@/lib/sheets";

const requestSchema = z.object({
  managementNumber: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(100),
  genre: z.string().trim().min(1).max(100),
  styleTags: z.string().trim().max(200),
  brand: z.string().trim().max(100).optional(),
  finalPrice: z.number().int().positive(),
  condition: z.enum([
    "new",
    "like-new",
    "no-notable-damage",
    "minor-damage",
    "damage",
    "poor",
  ]),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "入力内容が不正です。保存項目を確認してください。" },
      { status: 400 },
    );
  }

  try {
    await appendListingRow(parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("sheets append failed", error);
    return Response.json(
      { error: "スプレッドシートへの保存に失敗しました。設定を確認してください。" },
      { status: 500 },
    );
  }
}
