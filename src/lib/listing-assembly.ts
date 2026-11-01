import {
  CAUTION_BLOCK,
  CLOSING_LINE,
  CONDITION_OPTIONS,
  DIVIDER,
  GREETING_BLOCK,
  INQUIRY_LINE,
  SHIPPING_BLOCK,
  SIZE_FIELD_CONFIG,
} from "@/lib/constants";
import type { ListingAiOutput, ManualInput } from "@/types/listing";

function formatSize(manual: ManualInput): string {
  const { size, category } = manual;
  const lines = SIZE_FIELD_CONFIG[category]
    .filter(({ key }) => size[key])
    .map(({ key, label }) => `・${label}:約${size[key]}`);
  if (size.note) lines.push(`・${size.note}`);
  return lines.join("\n");
}

export function assembleListingText(
  aiOutput: ListingAiOutput,
  manual: ManualInput,
): string {
  const conditionLabel =
    CONDITION_OPTIONS.find((option) => option.value === manual.condition)?.label ??
    manual.condition;

  const featureBlock = [
    "【商品特徴】",
    "",
    aiOutput.featureParagraph,
    "",
    ...aiOutput.coordinateSuggestions.map((item) => `☑ ${item}`),
    "",
    `${aiOutput.styleTags.join(" / ")} 好きな方にもおすすめ◎`,
  ].join("\n");

  const designBlock = [
    "【デザイン】",
    "",
    ...aiOutput.designFeatures.map((item) => `•${item}`),
  ].join("\n");

  const detailBlock = [
    `【カラー】 ${aiOutput.color}`,
    "",
    `【素材】 ${aiOutput.material}`,
    "",
    `【状態】 ${conditionLabel}`,
    "",
    "【サイズ】↓平置き実寸（cm）",
    formatSize(manual),
    "",
    "※素人採寸ですので多少の誤差はご容赦下さい。",
  ].join("\n");

  const searchBlock = [aiOutput.searchKeywords.join(" "), CLOSING_LINE].join("\n");

  return [
    GREETING_BLOCK,
    DIVIDER,
    featureBlock,
    DIVIDER,
    designBlock,
    DIVIDER,
    detailBlock,
    DIVIDER,
    CAUTION_BLOCK,
    "",
    SHIPPING_BLOCK,
    "",
    INQUIRY_LINE,
    "",
    searchBlock,
    "",
    "管理番号: ",
  ].join("\n\n");
}
