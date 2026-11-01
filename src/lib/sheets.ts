import { google } from "googleapis";

import { CONDITION_OPTIONS, SHEET_COLUMN_MAPPING } from "@/lib/constants";
import type { SheetAppendRequestBody } from "@/types/listing";

function getAuth() {
  const encoded = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!encoded) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY が設定されていません。");
  }

  const credentials = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID が設定されていません。");
  }
  return spreadsheetId;
}

function getRange(suffix: string): string {
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME;
  return tabName ? `'${tabName.replace(/'/g, "''")}'!${suffix}` : suffix;
}

function getCurrentJstYyMm(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "2-digit",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "00";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}${month}`;
}

const MANAGEMENT_NUMBER_PATTERN = /^(\d{4})-(\d{3})$/;

export async function getNextManagementNumber(): Promise<string> {
  const currentYyMm = getCurrentJstYyMm();
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: getRange("A2:A"),
  });

  const values = res.data.values ?? [];
  let maxSeq = 0;
  for (const row of values) {
    const cell = row[0];
    if (typeof cell !== "string") continue;
    const match = cell.trim().match(MANAGEMENT_NUMBER_PATTERN);
    if (match && match[1] === currentYyMm) {
      maxSeq = Math.max(maxSeq, Number(match[2]));
    }
  }

  return `${currentYyMm}-${String(maxSeq + 1).padStart(3, "0")}`;
}

async function getSheetId(
  sheets: ReturnType<typeof getSheetsClient>,
  spreadsheetId: string,
): Promise<number> {
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME;
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = tabName
    ? meta.data.sheets?.find((s) => s.properties?.title === tabName)
    : meta.data.sheets?.[0];

  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined || sheetId === null) {
    throw new Error(`シート「${tabName}」が見つかりません。`);
  }
  return sheetId;
}

function formatValue(
  body: SheetAppendRequestBody,
  field: keyof SheetAppendRequestBody,
): string {
  if (field === "condition") {
    return (
      CONDITION_OPTIONS.find((option) => option.value === body.condition)?.label ??
      body.condition
    );
  }

  const value = body[field];
  return value === undefined || value === null ? "" : String(value);
}

export async function appendListingRow(body: SheetAppendRequestBody): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const sheetId = await getSheetId(sheets, spreadsheetId);
  const row = SHEET_COLUMN_MAPPING.map(({ field }) => formatValue(body, field));

  // 見出し行(1行目)の直後に空行を1行差し込み、そこへ新しいデータを書き込む。
  // これにより既存の行が常に下へ押し出され、「新しい順」の並びが保たれる。
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: 2 },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: getRange("A2"),
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
