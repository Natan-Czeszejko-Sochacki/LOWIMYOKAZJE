/**
 * Ręczna synchronizacja cen (np. z crona systemowego co 5h):
 * node scripts/sync-prices.mjs
 */
const base = process.env.SYNC_URL ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;

const res = await fetch(`${base}/api/prices/sync`, {
  method: "POST",
  headers: secret ? { Authorization: `Bearer ${secret}` } : {},
});

const data = await res.json();
console.log(res.status, JSON.stringify(data, null, 2));
process.exit(res.ok ? 0 : 1);
