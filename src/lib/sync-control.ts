const ABORT_KEY = Symbol.for("lowimyokazje.syncAbort");

type SyncGlobal = typeof globalThis & {
  [ABORT_KEY]?: boolean;
};

export function isSyncDisabled(): boolean {
  return (
    process.env.SYNC_DISABLED === "1" ||
    process.env.DISABLE_PRICE_CRON === "1"
  );
}

export function requestSyncAbort(): void {
  (globalThis as SyncGlobal)[ABORT_KEY] = true;
}

export function clearSyncAbort(): void {
  (globalThis as SyncGlobal)[ABORT_KEY] = false;
}

export function isSyncAborted(): boolean {
  return (globalThis as SyncGlobal)[ABORT_KEY] === true || isSyncDisabled();
}
