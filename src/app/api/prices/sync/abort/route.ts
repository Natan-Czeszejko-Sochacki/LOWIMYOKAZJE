import { NextResponse } from "next/server";
import { pauseSync } from "@/lib/sync-control-node";

export const dynamic = "force-dynamic";

export async function POST() {
  pauseSync();
  return NextResponse.json({ ok: true, message: "Synchronizacja wstrzymana" });
}
