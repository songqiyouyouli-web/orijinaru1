import { z } from "zod";

export const listingAiOutputSchema = z.object({
  title: z
    .string()
    .max(40)
    .describe("商品名。年代+vintage+特徴+アイテム種別+丈感+サイズ、40字以内"),
  material: z
    .string()
    .describe("写真のタグ等から読み取れる、または見た目から推測した素材（例: コットン100%、デニム）。読み取れない場合は見た目からの推測と分かるように書く"),
  featureParagraph: z
    .string()
    .describe("商品特徴の説明文（生地感・カット・特徴的ディテール）"),
  coordinateSuggestions: z
    .array(z.string())
    .length(2)
    .describe("コーデ提案を2つ（「☑」は付けず本文のみ）"),
  styleTags: z
    .array(z.string())
    .min(1)
    .describe("系統・ターゲット層タグ（例: y2k, グランジ, 平成レトロ）"),
  designFeatures: z
    .array(z.string())
    .min(1)
    .describe("デザイン特徴の箇条書き（柄・ネックライン・袖丈・シルエット等）"),
  color: z.string().describe("写真から判断した色"),
  priceRangeLow: z.number().int().positive().describe("価格帯の下限（円）"),
  priceRangeHigh: z.number().int().positive().describe("価格帯の上限（円）"),
  searchKeywords: z
    .array(z.string())
    .min(1)
    .describe("検索ワード（年代・系統・アイテム種別・デザイン特徴など単語単位）"),
});

export type ListingAiOutputSchema = z.infer<typeof listingAiOutputSchema>;
