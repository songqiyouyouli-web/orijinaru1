# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test suite configured in this repo (no test script, no test runner installed).

## Architecture

This is a single-purpose Next.js (App Router) app: **メルカリ出品文メーカー** — given product photos and a few manually-entered fields, it uses an LLM to draft a complete Mercari (Japanese secondhand marketplace) listing, then lets the user save the finalized listing as a row in a Google Sheet.

### Request flow

1. `src/app/page.tsx` is the only page. It holds `photos` and `manual` (form) state and renders `PhotoUploader` → `ManualFieldsForm` → generate button → `ListingResultEditor`.
2. On submit, it POSTs `{ images, manual }` to `src/app/api/generate/route.ts`, which:
   - validates the body with a zod schema (mirrors `src/types/listing.ts` shapes),
   - calls `generateText` (from the `ai` package) with the images attached as `file` parts, model `"anthropic/claude-sonnet-5"` (a plain provider/model string routed through the Vercel AI Gateway — don't swap in `@ai-sdk/anthropic` directly),
   - constrains output via `Output.object({ schema: listingAiOutputSchema })` where `listingAiOutputSchema` lives in `src/lib/ai/schema.ts`,
   - prompts are built in `src/lib/ai/prompt.ts` (`buildSystemPrompt` / `buildUserPrompt`) — these encode the actual business rules for how titles/features/price ranges should be written, in Japanese.
3. The AI output (`ListingAiOutput`) plus the manual form fields are combined by `src/lib/listing-assembly.ts` (`assembleListingText`) into the final listing body text, by interleaving AI-generated sections with static boilerplate blocks (greeting, caution, shipping, inquiry) defined in `src/lib/constants.ts`. This assembled text is what the user edits in `ListingResultEditor`.
4. On save, `ListingResultEditor` POSTs to `src/app/api/sheets/append/route.ts`, which validates the body and calls `appendListingRow` in `src/lib/sheets.ts` to append one row to a Google Sheet via `googleapis`, using column order defined in `SHEET_COLUMN_MAPPING` (`src/lib/constants.ts`).

### Key shared files

- `src/types/listing.ts` — the canonical types for manual input, AI output, and API request/response bodies. The zod schemas in `api/generate/route.ts`, `api/sheets/append/route.ts`, and `lib/ai/schema.ts` must stay structurally in sync with these.
- `src/lib/constants.ts` — single source of truth for condition options (`CONDITION_OPTIONS`), the static Japanese text blocks used in the assembled listing, and the Sheet column mapping. Changes to the listing's static copy or the sheet's column order happen here, not inline in components.

### Environment variables (not committed)

- `GOOGLE_SERVICE_ACCOUNT_KEY` — base64-encoded Google service account JSON credentials (decoded in `lib/sheets.ts`)
- `GOOGLE_SHEET_ID` — target spreadsheet ID
- `GOOGLE_SHEET_TAB_NAME` — optional sheet/tab name; if unset, appends start at `A1` of the default sheet

### Notes

- All user-facing copy and AI prompts are in Japanese — keep new UI strings and prompt text consistent with the existing tone (casual-but-polite secondhand-seller voice, described explicitly in `buildSystemPrompt`).
- `next.config.ts` has `cacheComponents: true` and `partialPrefetching: true` enabled (Next.js 16 Cache Components / PPR).
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

## 説明のルール
- 私はプログラミング初心者です。説明は専門用語を避け、使う場合は一言で意味を添えること
- 作業の前に「何を・なぜやるか」を3行以内で説明すること
- 作業の後に「何が変わったか」を箇条書きで説明すること
- 回答は日本語で行うこと
- 実装前に必ず計画を提示し、私の承認を待つこと

## エラーが起きたときのルール
- エラーが起きたら、すぐ直す前に次の3つを説明すること
  1. 何が起きたか（エラーの意味を一言で）
  2. なぜ起きたか（原因）
  3. どう直すか（修正方針）
- 直した後、同じエラーを防ぐために気をつけることがあれば一言添えること