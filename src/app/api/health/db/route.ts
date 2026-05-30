import { NextResponse } from "next/server";
import { checkDbConnection } from "@/lib/sql";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkDbConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
