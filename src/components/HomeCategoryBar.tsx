"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
            className="block px-4 py-2 text-sm text-water-400 transition-colors hover:text-accent-500 active:bg-water-900"
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
  onNavigate,
}: {
  href: string;
  title: string;
  items: HomeCategorySubLink[];
  twoColumns?: boolean;
  onNavigate?: () => void;
}) {
  const [left, right] = twoColumns ? splitInHalf(items) : [[], items];

  return (
    <div
      className={`z-[100] w-full pt-1 md:absolute md:left-0 md:top-full md:w-auto ${
        twoColumns ? "md:min-w-[34rem]" : "md:min-w-[14rem]"
      }`}
    >
      <div className="rounded-lg border border-water-700 bg-white py-1.5 shadow-lg">
        <Link
          href={href}
          onClick={onNavigate}
          className="block px-4 py-2 text-sm font-medium text-accent-500 transition-colors hover:text-accent-400 active:bg-water-900"
        >
          {title}
        </Link>
        <div className="my-1 border-t border-water-700" aria-hidden />
        {twoColumns ? (
          <div className="grid grid-cols-1 gap-x-2 px-0.5 pb-1 sm:grid-cols-2">
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

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
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
  const navRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpenLabel(null), []);

  useEffect(() => {
    if (!openLabel) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) close();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [openLabel, close]);

  const toggle = (label: string) => {
    setOpenLabel((prev) => (prev === label ? null : label));
  };

  return (
    <nav
      ref={navRef}
      aria-label="Nawigacja kategorii strony głównej"
      className="relative border-b border-water-700 bg-white"
    >
      <div className="mx-auto max-w-7xl overflow-visible px-1 sm:px-4">
        <ul className="flex flex-wrap items-stretch gap-x-0 gap-y-0">
          {homeCategoryMenu.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openLabel === item.label;

            if (!hasChildren) {
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-sm font-semibold text-water-400 transition-colors hover:text-accent-500 active:text-accent-500 sm:px-4 sm:py-3"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={item.label}
                className={`relative ${isOpen ? "w-full sm:w-auto" : ""}`}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    setOpenLabel(item.label);
                  }
                }}
                onMouseLeave={() => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    setOpenLabel(null);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.label)}
                  className={`flex items-center gap-1 px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 sm:py-3 ${
                    isOpen ? "text-accent-500" : "text-water-400"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={isOpen}
                >
                  {item.label}
                  <ChevronDown open={isOpen} />
                </button>

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
                    onNavigate={close}
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
