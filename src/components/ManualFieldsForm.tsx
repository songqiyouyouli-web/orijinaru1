"use client";

import { CATEGORY_OPTIONS, CONDITION_OPTIONS, SIZE_FIELD_CONFIG } from "@/lib/constants";
import type { ManualInput } from "@/types/listing";

interface ManualFieldsFormProps {
  value: ManualInput;
  onChange: (value: ManualInput) => void;
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function ManualFieldsForm({ value, onChange }: ManualFieldsFormProps) {
  function update<K extends keyof ManualInput>(key: K, v: ManualInput[K]) {
    onChange({ ...value, [key]: v });
  }

  function updateSize<K extends keyof ManualInput["size"]>(
    key: K,
    v: ManualInput["size"][K],
  ) {
    onChange({ ...value, size: { ...value.size, [key]: v } });
  }

  const sizeFields = SIZE_FIELD_CONFIG[value.category];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            商品の状態
          </label>
          <select
            className={inputClass}
            value={value.condition}
            onChange={(e) => update("condition", e.target.value as ManualInput["condition"])}
          >
            {CONDITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            カテゴリー
          </label>
          <select
            className={inputClass}
            value={value.category}
            onChange={(e) =>
              update("category", e.target.value as ManualInput["category"])
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            ブランド名（任意）
          </label>
          <input
            className={inputClass}
            value={value.brand ?? ""}
            onChange={(e) => update("brand", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            購入時価格（任意・円）
          </label>
          <input
            type="number"
            className={inputClass}
            value={value.purchasePrice ?? ""}
            onChange={(e) =>
              update(
                "purchasePrice",
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      {sizeFields.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            サイズ実寸（cm）
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sizeFields.map(({ key, label }) => (
              <input
                key={key}
                className={inputClass}
                placeholder={label}
                value={value.size[key] ?? ""}
                onChange={(e) => updateSize(key, e.target.value)}
              />
            ))}
          </div>
          <input
            className={inputClass}
            placeholder="その他の採寸メモ（任意）"
            value={value.size.note ?? ""}
            onChange={(e) => updateSize("note", e.target.value)}
          />
        </div>
      )}

      {sizeFields.length === 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            サイズ・採寸メモ
          </label>
          <input
            className={inputClass}
            placeholder="自由に記入してください"
            value={value.size.note ?? ""}
            onChange={(e) => updateSize("note", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
