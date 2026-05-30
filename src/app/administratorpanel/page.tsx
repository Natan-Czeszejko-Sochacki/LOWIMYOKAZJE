import { AdminPanel } from "@/components/admin/AdminPanel";
import {
  countMultiStoreProducts,
  getAdminOverview,
  getMultiStoreProducts,
} from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ min?: string; max?: string }>;
};

function parseStoreRange(min?: string, max?: string) {
  const parsedMin = Math.min(20, Math.max(1, Number(min) || 2));
  const parsedMax = Math.min(20, Math.max(1, Number(max) || 20));
  return {
    minStores: Math.min(parsedMin, parsedMax),
    maxStores: Math.max(parsedMin, parsedMax),
  };
}

export default async function AdministratorPanelPage({ searchParams }: Props) {
  const params = await searchParams;
  const { minStores, maxStores } = parseStoreRange(params.min, params.max);

  const [overview, filteredCount, products] = await Promise.all([
    getAdminOverview(),
    countMultiStoreProducts(minStores, maxStores),
    getMultiStoreProducts(minStores, maxStores, 200),
  ]);

  return (
    <AdminPanel
      overview={overview}
      products={products}
      filteredCount={filteredCount}
      minStores={minStores}
      maxStores={maxStores}
    />
  );
}
