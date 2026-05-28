"use client";

import Link from "next/link";
import { useState } from "react";
import {
  homeCategoryMenu,
  type HomeCategorySubLink,
} from "@/lib/home-category-bar";

function splitInHalf<T>(items: T[]): [T[], T[]] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function CategoryDropdownLinks({ items }: { items: HomeCategorySubLink[] }) {
  return (
    <>
      {items.map((child) => (
        <li key={child.href}>
          <Link
            href={child.href}
            className="block px-4 py-1.5 text-sm text-water-400 transition-colors hover:text-accent-500"
          >
            {child.label}
          </Link>
        </li>
      ))}
    </>
  );
}

function CategoryDropdownPanel({
  href,
  title,
  items,
  twoColumns,
}: {
  href: string;
  title: string;
  items: HomeCategorySubLink[];
  twoColumns?: boolean;
}) {
  const [left, right] = twoColumns ? splitInHalf(items) : [[], items];

  return (
    <div
      className={`absolute left-0 top-full z-[100] pt-1 ${
        twoColumns ? "min-w-[34rem]" : "min-w-[14rem]"
      }`}
    >
      <div className="rounded-lg border border-water-700 bg-white py-1.5 shadow-lg">
        <Link
          href={href}
          className="block px-4 py-2 text-sm font-medium text-accent-500 transition-colors hover:text-accent-400"
        >
          {title}
        </Link>
        <div className="my-1 border-t border-water-700" aria-hidden />
        {twoColumns ? (
          <div className="grid grid-cols-2 gap-x-2 px-0.5 pb-1">
            <ul role="list">
              <CategoryDropdownLinks items={left} />
            </ul>
            <ul role="list">
              <CategoryDropdownLinks items={right} />
            </ul>
          </div>
        ) : (
          <ul role="list">
            <CategoryDropdownLinks items={items} />
          </ul>
        )}
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 opacity-70"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function HomeCategoryBar() {
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  return (
    <nav
      aria-label="Nawigacja kategorii strony głównej"
      className="relative border-b border-water-700 bg-white"
    >
      <div className="mx-auto max-w-7xl overflow-visible px-2 sm:px-4">
        <ul className="flex flex-wrap items-stretch gap-0 overflow-visible">
          {homeCategoryMenu.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openLabel === item.label;

            if (!hasChildren) {
              return (
                <li key={item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className="block px-3 py-3 text-sm font-semibold text-water-400 transition-colors hover:text-accent-500 sm:px-4"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={item.label}
                className="relative shrink-0"
                onMouseEnter={() => setOpenLabel(item.label)}
                onMouseLeave={() => setOpenLabel(null)}
              >
                <span
                  className={`flex cursor-default select-none items-center gap-1 px-3 py-3 text-sm font-semibold transition-colors sm:px-4 ${
                    isOpen ? "text-accent-500" : "text-water-400"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  {item.label}
                  <ChevronDown />
                </span>

                {isOpen && (
                  <CategoryDropdownPanel
                    href={item.href}
                    title={
                      item.href === "/kategorie"
                        ? item.label
                        : `Wszystkie: ${item.label}`
                    }
                    twoColumns={item.href === "/kategorie"}
                    items={item.children!}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
