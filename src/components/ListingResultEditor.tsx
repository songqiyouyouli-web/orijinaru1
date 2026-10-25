"use client";

import { useState } from "react";

import { assembleListingText } from "@/lib/listing-assembly";
import type { ListingAiOutput, ManualInput, SheetAppendRequestBody } from "@/types/listing";

interface ListingResultEditorProps {
  aiOutput: ListingAiOutput;
  manual: ManualInput;
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

// Note: this component is remounted via a `key` prop in the parent whenever a
// new aiOutput arrives, so initial state can be derived straight from props
// without an effect-based sync.
export function ListingResultEditor({ aiOutput, manual }: ListingResultEditorProps) {
  const [title, setTitle] = useState(aiOutput.title);
  const [bodyText, setBodyText] = useState(() => assembleListingText(aiOutput, manual));
  const [managementNumber, setManagementNumber] = useState("");
  const [finalPrice, setFinalPrice] = useState(
    Math.round((aiOutput.priceRangeLow + aiOutput.priceRangeHigh) / 2),
  );
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!managementNumber.trim()) {
      setSaveError("管理番号を入力してください。");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    const payload: SheetAppendRequestBody = {
      managementNumber: managementNumber.trim(),
      title,
      genre: manual.genre,
      styleTags: aiOutput.styleTags.join(" / "),
      brand: manual.brand,
      finalPrice,
      condition: manual.condition,
    };

    try {
      const res = await fetch("/api/sheets/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setSaveError(data.error ?? "スプレッドシートへの保存に失敗しました。");
        return;
      }

      setSaveMessage("スプレッドシートに保存しました。");
    } catch {
      setSaveError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          商品名（メルカリの商品名欄にそのまま貼り付け）
        </label>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={40}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          商品説明文
        </label>
        <textarea
          className={`${inputClass} min-h-80 font-mono`}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            最終価格（円）
          </label>
          <input
            type="number"
            className={inputClass}
            value={finalPrice}
            onChange={(e) => setFinalPrice(Number(e.target.value))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            管理番号
          </label>
          <input
            className={inputClass}
            value={managementNumber}
            onChange={(e) => setManagementNumber(e.target.value)}
            placeholder="例: 2610-085"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? "保存中..." : "スプレッドシートに保存"}
        </button>
        {saveMessage && <p className="text-sm text-green-600 dark:text-green-400">{saveMessage}</p>}
        {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      </div>
    </div>
  );
}
