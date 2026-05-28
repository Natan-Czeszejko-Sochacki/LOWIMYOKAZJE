import Link from "next/link";
import { categoryNavGroups, categoryNavStandalone } from "@/lib/category-nav";

export function CategoryNav() {
  return (
    <nav aria-label="Kategorie produktów" className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {categoryNavGroups.map((group) => (
          <div
            key={group.slug}
            className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-water-700 bg-water-900 px-3 py-1.5 text-sm shadow-sm"
          >
            <Link
              href={`/kategoria/${group.slug}`}
              className="font-semibold text-accent-500 hover:text-accent-400"
            >
              {group.label}
            </Link>
            {group.children && group.children.length > 0 && (
              <>
                <span className="text-water-600" aria-hidden>
                  |
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {group.children.map((child, i) => (
                    <span key={child.slug} className="inline-flex items-center gap-2">
                      {i > 0 && (
                        <span className="text-water-600" aria-hidden>
                          ·
                        </span>
                      )}
                      <Link
                        href={`/kategoria/${child.slug}`}
                        className="text-water-400 hover:text-accent-500"
                      >
                        {child.label}
                      </Link>
                    </span>
                  ))}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {categoryNavStandalone.map((item) => (
          <Link
            key={item.slug}
            href={`/kategoria/${item.slug}`}
            className="rounded-full border border-water-700 bg-white px-3 py-1.5 text-sm font-medium text-water-300 shadow-sm hover:border-accent-500/40 hover:text-accent-500"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
