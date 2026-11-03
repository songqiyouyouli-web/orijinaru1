"use client";

import { MAX_PHOTOS } from "@/lib/constants";

export interface PhotoItem {
  base64: string;
  mediaType: string;
  previewUrl: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

// AIが特徴を読み取るのに十分な画質を保ちつつ、送信データ量を抑えて生成を速くする
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = url;
  });
}

async function resizeImage(file: File): Promise<PhotoItem> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unsupported");
    ctx.drawImage(img, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    return { base64, mediaType: "image/jpeg", previewUrl: dataUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function PhotoUploader({ photos, onChange }: PhotoUploaderProps) {
  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const files = Array.from(fileList).slice(0, remainingSlots);

    const newPhotos = await Promise.all(files.map((file) => resizeImage(file)));

    onChange([...photos, ...newPhotos]);
  }

  function handleRemove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        商品写真（最大{MAX_PHOTOS}枚、正面・背面・タグなど）
      </label>

      <div className="flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt={`商品写真 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-400">
            + 追加
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
