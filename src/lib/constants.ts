import type {
  ClothingCategory,
  ConditionValue,
  SheetAppendRequestBody,
  SizeMeasurements,
} from "@/types/listing";

export const CONDITION_OPTIONS: { value: ConditionValue; label: string }[] = [
  { value: "new", label: "新品、未使用" },
  { value: "like-new", label: "未使用に近い" },
  { value: "no-notable-damage", label: "目立った傷や汚れなし" },
  { value: "minor-damage", label: "やや傷や汚れあり" },
  { value: "damage", label: "傷や汚れあり" },
  { value: "poor", label: "全体的に状態が悪い" },
];

export const CATEGORY_OPTIONS: { value: ClothingCategory; label: string }[] = [
  { value: "tops", label: "トップス" },
  { value: "bottoms", label: "ボトムス" },
  { value: "dress", label: "ワンピース" },
  { value: "outer", label: "アウター" },
  { value: "bag", label: "バッグ" },
  { value: "shoes", label: "シューズ" },
  { value: "other", label: "その他" },
];

export const SIZE_FIELD_CONFIG: Record<
  ClothingCategory,
  { key: keyof SizeMeasurements; label: string }[]
> = {
  tops: [
    { key: "shoulder", label: "肩幅" },
    { key: "bust", label: "身幅" },
    { key: "sleeve", label: "袖丈" },
    { key: "length", label: "着丈" },
  ],
  bottoms: [
    { key: "waist", label: "ウエスト" },
    { key: "rise", label: "股上" },
    { key: "inseam", label: "股下" },
    { key: "thigh", label: "もも幅" },
    { key: "hem", label: "裾幅" },
    { key: "length", label: "丈" },
  ],
  dress: [
    { key: "shoulder", label: "肩幅" },
    { key: "bust", label: "身幅" },
    { key: "sleeve", label: "袖丈" },
    { key: "length", label: "着丈" },
  ],
  outer: [
    { key: "shoulder", label: "肩幅" },
    { key: "bust", label: "身幅" },
    { key: "sleeve", label: "袖丈" },
    { key: "length", label: "着丈" },
  ],
  shoes: [{ key: "shoeSize", label: "サイズ(cm)" }],
  bag: [
    { key: "bagWidth", label: "幅" },
    { key: "bagHeight", label: "高さ" },
    { key: "bagDepth", label: "マチ" },
  ],
  other: [],
};

export const MAX_PHOTOS = 5;

export const DIVIDER = "─────────────────";

export const GREETING_BLOCK =
  "閲覧いただき、誠にありがとうございます！\n即購入大歓迎です◎\n\n#古着屋Arua ← 他の商品もぜひご覧ください♪";

export const CAUTION_BLOCK =
  "★必ず以下を確認の上ご購入をよろしくお願いいたします★\n\n【商品詳細】\n・古着のため多少の使用感がございます\n・目立つ汚れ等はできる限り記載しておりますが、見落としがある場合もございます\n・写真の写り方や光の加減により、実際の色味と多少異なる場合がございます\n→写真は実物をスマホで撮影しております！";

export const SHIPPING_BLOCK =
  "【発送について】\n・1〜2日以内の発送を心がけております\n・コンパクトに畳んで発送するため、畳みジワはご了承ください";

export const INQUIRY_LINE = "質問等ございましたら、お気軽にコメントください！";

export const CLOSING_LINE = "好きな方におすすめです！";

export const HISTORY_UNUSED_NOTE = "履歴機能は今回のアプリでは提供しません。";

export const SHEET_COLUMN_MAPPING: {
  header: string;
  field: keyof SheetAppendRequestBody;
}[] = [
  { header: "管理番号", field: "managementNumber" },
  { header: "商品名", field: "title" },
  { header: "ジャンル", field: "genre" },
  { header: "系統", field: "styleTags" },
  { header: "ブランド", field: "brand" },
  { header: "出品価格", field: "finalPrice" },
  { header: "商品の状態", field: "condition" },
];
