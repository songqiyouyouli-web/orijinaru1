export type ConditionValue =
  | "new"
  | "like-new"
  | "no-notable-damage"
  | "minor-damage"
  | "damage"
  | "poor";

export interface SizeMeasurements {
  shoulder?: string;
  bust?: string;
  sleeve?: string;
  length?: string;
  note?: string;
}

export interface ManualInput {
  condition: ConditionValue;
  brand?: string;
  purchasePrice?: number;
  genre: string;
  material: string;
  size: SizeMeasurements;
}

export interface ImageInput {
  base64: string;
  mediaType: string;
}

export interface ListingAiOutput {
  title: string;
  featureParagraph: string;
  coordinateSuggestions: [string, string];
  styleTags: string[];
  designFeatures: string[];
  color: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  searchKeywords: string[];
}

export interface GenerateListingRequestBody {
  images: ImageInput[];
  manual: ManualInput;
}

export interface GenerateListingResponseBody {
  output: ListingAiOutput;
}

export interface SheetAppendRequestBody {
  managementNumber: string;
  title: string;
  genre: string;
  styleTags: string;
  brand?: string;
  finalPrice: number;
  condition: ConditionValue;
}

export interface SheetAppendResponseBody {
  ok: true;
}
