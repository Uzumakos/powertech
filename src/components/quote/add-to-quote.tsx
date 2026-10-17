"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { basket, useBasket } from "@/lib/basket";

type Props = {
  slug: string;
  labels: { add: string; added: string; view: string };
  quoteHref: string;
  /** Compact button for product cards. */
  compact?: boolean;
};

/** Adds a product to the quote basket; once added, links to the request. */
export function AddToQuote({ slug, labels, quoteHref, compact = false }: Props) {
  const items = useBasket();
  const inBasket = items.some((item) => item.slug === slug);

  if (compact) {
    return inBasket ? (
      <Link href={quoteHref} className="relative z-10 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-ink px-3.5 text-sm font-semibold text-white">
        <Check aria-hidden className="size-4" />
        {labels.added}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => basket.add(slug)}
        className="relative z-10 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:border-crimson hover:text-crimson"
      >
        <Plus aria-hidden className="size-4" />
        {labels.add}
      </button>
    );
  }

  return inBasket ? (
    <div className="grid gap-2">
      <p role="status" className="flex items-center justify-center gap-2 rounded-full bg-[#16a34a]/10 py-2.5 text-sm font-semibold text-[#166534]">
        <Check aria-hidden className="size-4" />
        {labels.added}
      </p>
      <Link href={quoteHref} className="btn btn-lg btn-volt">
        {labels.view}
      </Link>
    </div>
  ) : (
    <button type="button" onClick={() => basket.add(slug)} className="btn btn-lg btn-volt">
      <Plus aria-hidden className="size-4" />
      {labels.add}
    </button>
  );
}
