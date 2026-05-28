import { CategoryNav } from "@/components/CategoryNav";
import { categories } from "@/lib/categories";

export const metadata = {
  title: "Kategorie sprzętu wędkarskiego",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Kategorie</h1>
      <p className="mt-2 text-water-400">
        Pełny asortyment dla wędkarza — {categories.length} kategorii
      </p>

      <div className="mt-10">
        <CategoryNav />
      </div>
    </div>
  );
}
