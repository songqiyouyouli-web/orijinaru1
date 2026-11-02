import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from "@/lib/constants";
import type { ManualInput } from "@/types/listing";

export function buildSystemPrompt(): string {
  return [
    "あなたは日本の古着販売（メルカリ出品）の出品文作成を手伝う専門家です。",
    "添付された商品写真（正面・背面・タグなど複数枚の場合あり）を直接解析し、商品の特徴を判断してください。",
    "文体はカジュアルだが丁寧な、メルカリの個人出品者らしい語り口にすること。「◎」のような記号を軽く使ってよいが多用しない。絵文字は使わない。",
    "商品名（title）は40字以内。年代やvintageの表現＋目立つ特徴＋アイテム種別＋丈感＋サイズ、のような構成にすること。",
    "素材（material）は写真にタグが写っていれば読み取り、写っていなければ見た目の質感から推測すること。",
    "デザイン特徴（designFeatures）は、柄・ネックライン・ボタン・袖丈・シルエット・丈感などを短い体言止めの句で箇条書き向けに出すこと。文章にしない。",
    "コーデ提案（coordinateSuggestions）は必ず2つ、具体的な組み合わせ（アイテム×着こなしの方向性）を短い一文で。",
    "色（color）は写真から判断すること。ユーザーに確認を求めない。",
    "価格帯（priceRangeLow/priceRangeHigh）は、与えられたブランド名・購入時価格・商品の状態と、中古衣料品の一般的な相場知識から幅を持たせて提案すること。あくまで参考値。",
    "検索ワード（searchKeywords）は、年代・系統/テイスト・アイテム種別の同義語・デザイン特徴などを単語単位の配列で出すこと。",
  ].join("\n");
}

export function buildUserPrompt(manual: ManualInput): string {
  const conditionLabel =
    CONDITION_OPTIONS.find((option) => option.value === manual.condition)?.label ??
    manual.condition;
  const categoryLabel =
    CATEGORY_OPTIONS.find((option) => option.value === manual.category)?.label ??
    manual.category;

  const lines = [
    "添付の商品写真を踏まえて、出品情報を生成してください。",
    "以下は補足情報です。",
    `商品の状態: ${conditionLabel}`,
    `商品の大まかな分類（参考情報）: ${categoryLabel}`,
  ];

  if (manual.brand) {
    lines.push(`ブランド名: ${manual.brand}`);
  }
  if (manual.purchasePrice) {
    lines.push(`購入時価格: 約${manual.purchasePrice}円（価格帯の参考情報。出品文には含めない）`);
  }

  lines.push("指定された形式（title, material, featureParagraph, coordinateSuggestions, styleTags, designFeatures, color, priceRangeLow, priceRangeHigh, searchKeywords）で出力してください。");

  return lines.join("\n");
}
