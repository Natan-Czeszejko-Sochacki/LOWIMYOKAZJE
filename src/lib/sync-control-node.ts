import fs from "node:fs";
import path from "node:path";
import {
  clearSyncAbort,
  isSyncDisabled,
  requestSyncAbort,
} from "./sync-control";

const PAUSE_FILE = path.join(process.cwd(), ".sync-paused");

export function isSyncPaused(): boolean {
  return isSyncDisabled() || fs.existsSync(PAUSE_FILE);
}

export function pauseSync(): void {
  fs.writeFileSync(PAUSE_FILE, new Date().toISOString(), "utf8");
  requestSyncAbort();
}

export function resumeSync(): void {
  if (fs.existsSync(PAUSE_FILE)) fs.unlinkSync(PAUSE_FILE);
  clearSyncAbort();
}

export function shouldAbortSync(): boolean {
  return isSyncPaused();
}
