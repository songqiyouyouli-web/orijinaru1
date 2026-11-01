import { getNextManagementNumber } from "@/lib/sheets";

export async function GET() {
  try {
    const managementNumber = await getNextManagementNumber();
    return Response.json({ managementNumber });
  } catch (error) {
    console.error("next management number fetch failed", error);
    return Response.json(
      { error: "管理番号の取得に失敗しました。" },
      { status: 500 },
    );
  }
}
