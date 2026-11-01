"use client";

import { useState } from "react";

import { ListingResultEditor } from "@/components/ListingResultEditor";
import { ManualFieldsForm } from "@/components/ManualFieldsForm";
import { PhotoUploader, type PhotoItem } from "@/components/PhotoUploader";
import type { GenerateListingResponseBody, ListingAiOutput, ManualInput } from "@/types/listing";

const DEFAULT_MANUAL: ManualInput = {
  condition: "no-notable-damage",
  brand: "",
  purchasePrice: undefined,
  category: "tops",
  size: {},
};

export default function Home() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [manual, setManual] = useState<ManualInput>(DEFAULT_MANUAL);
  const [aiOutput, setAiOutput] = useState<ListingAiOutput | null>(null);
  const [resultKey, setResultKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = photos.length > 0;

  function handleReset() {
    setPhotos([]);
    setManual(DEFAULT_MANUAL);
    setAiOutput(null);
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: photos.map(({ base64, mediaType }) => ({ base64, mediaType })),
          manual,
        }),
      });

      const data = (await res.json()) as GenerateListingResponseBody & { error?: string };

      if (!res.ok || !data.output) {
        setError(data.error ?? "出品文の生成に失敗しました。");
        return;
      }

      setAiOutput(data.output);
      setResultKey((key) => key + 1);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            メルカリ出品文メーカー
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            商品写真を撮るだけで、出品に必要な文章一式を下書きします
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <PhotoUploader photos={photos} onChange={setPhotos} />
          <ManualFieldsForm value={manual} onChange={setManual} />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? "生成中..." : "出品文を生成する"}
          </button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </section>

        {aiOutput && (
          <ListingResultEditor
            key={resultKey}
            aiOutput={aiOutput}
            manual={manual}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
