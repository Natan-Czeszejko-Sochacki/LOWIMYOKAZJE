"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/search-constants";

type Props = {
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  defaultQuery?: string;
  showIcon?: boolean;
};

export function GlobalSearchForm({
  className = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "np. Shimano, kołowrotek, wobbler…",
  defaultQuery = "",
  showIcon = true,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    if (q.length < MIN_SEARCH_QUERY_LENGTH) return;
    startTransition(() => {
      router.push(`/szukaj?q=${encodeURIComponent(q)}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="relative">
        <input
          type="search"
          name="q"
          defaultValue={defaultQuery}
          minLength={MIN_SEARCH_QUERY_LENGTH}
          placeholder={placeholder}
          disabled={pending}
          className={inputClassName}
        />
        {showIcon && (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-water-500"
            aria-hidden
          >
            🔍
          </span>
        )}
        <button
          type="submit"
          disabled={pending}
          className={buttonClassName}
        >
          {pending ? "…" : "Szukaj"}
        </button>
      </div>
    </form>
  );
}
