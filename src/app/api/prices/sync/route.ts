import { NextRequest, NextResponse } from "next/server";
import { syncAllStorePrices } from "@/lib/price-sync";
import { isSyncPaused } from "@/lib/sync-control-node";

export const dynamic = "force-dynamic";
export const maxDuration = 900;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  if (request.headers.get("x-cron-secret") === secret) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (isSyncPaused()) {
    return NextResponse.json(
      { ok: false, error: "Synchronizacja wstrzymana (.sync-paused)" },
      { status: 503 }
    );
  }

  const result = await syncAllStorePrices();
  return NextResponse.json({
    ok: true,
    message:
      "Zsynchronizowano pełny katalog produktów ze wszystkich 20 sklepów",
    ...result,
  });
}

export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  if (!isVercelCron && !isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncAllStorePrices();
  return NextResponse.json({ ok: true, ...result });
}
