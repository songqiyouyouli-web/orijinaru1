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
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("GOOGLE_SHEET_ID が設定されていません。");
  }

  const tabName = process.env.GOOGLE_SHEET_TAB_NAME;
  const range = tabName ? `${tabName}!A1` : "A1";

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = SHEET_COLUMN_MAPPING.map(({ field }) => formatValue(body, field));

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}
