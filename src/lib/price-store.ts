import { promises as fs } from "fs";
import path from "path";
import type { StoreOffer } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const OFFERS_FILE = path.join(DATA_DIR, "offers.json");

export async function readOffers(): Promise<StoreOffer[]> {
  try {
    const raw = await fs.readFile(OFFERS_FILE, "utf-8");
    return JSON.parse(raw) as StoreOffer[];
  } catch {
    return [];
  }
}

export async function writeOffers(offers: StoreOffer[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(OFFERS_FILE, JSON.stringify(offers, null, 2), "utf-8");
}

export async function getLastSyncTime(): Promise<string | null> {
  const offers = await readOffers();
  if (offers.length === 0) return null;
  return offers.reduce(
    (latest, o) => (o.updatedAt > latest ? o.updatedAt : latest),
    offers[0].updatedAt
  );
}
