import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryGrid({ items }: { items: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((cat) => (
        <Link
          key={cat.id}
          href={`/kategoria/${cat.slug}`}
          className="flex flex-col items-center rounded-xl border border-water-700 bg-white p-4 text-center shadow-sm transition hover:border-accent-500/50 hover:shadow-md"
        >
          <span className="text-3xl">{cat.icon}</span>
          <span className="mt-2 text-sm font-medium text-foreground">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
