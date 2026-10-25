import { Output, generateText } from "ai";
import { z } from "zod";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import { listingAiOutputSchema } from "@/lib/ai/schema";
import { MAX_PHOTOS } from "@/lib/constants";

const requestSchema = z.object({
  images: z
    .array(
      z.object({
        base64: z.string().min(1),
        mediaType: z.string().regex(/^image\//),
      }),
    )
    .min(1)
    .max(MAX_PHOTOS),
  manual: z.object({
    condition: z.enum([
      "new",
      "like-new",
      "no-notable-damage",
      "minor-damage",
      "damage",
      "poor",
    ]),
    brand: z.string().trim().max(100).optional(),
    purchasePrice: z.number().positive().optional(),
    genre: z.string().trim().min(1).max(100),
    material: z.string().trim().max(200),
    size: z.object({
      shoulder: z.string().trim().max(20).optional(),
      bust: z.string().trim().max(20).optional(),
      sleeve: z.string().trim().max(20).optional(),
      length: z.string().trim().max(20).optional(),
      note: z.string().trim().max(200).optional(),
    }),
  }),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      { error: "入力内容が不正です。写真と必須項目を確認してください。" },
      { status: 400 },
    );
  }

  const { images, manual } = parsed.data;

  try {
    const result = await generateText({
      model: "anthropic/claude-sonnet-5",
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: [
            ...images.map((image) => ({
              type: "file" as const,
              data: image.base64,
              mediaType: image.mediaType,
            })),
            { type: "text" as const, text: buildUserPrompt(manual) },
          ],
        },
      ],
      output: Output.object({ schema: listingAiOutputSchema }),
    });

    return Response.json({ output: result.output });
  } catch (error) {
    console.error("generate failed", error);
    return Response.json(
      { error: "出品文の生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
