import type { StockStatus } from "@/lib/data";

const dot: Record<StockStatus, string> = {
  in_stock: "bg-[#16a34a]",
  on_order: "bg-volt-deep",
  preorder: "bg-crimson",
};

export function StockBadge({ status, label, className = "" }: { status: StockStatus; label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[0.8125rem] font-medium text-ink ${className}`}
    >
      <span aria-hidden className={`size-2 rounded-full ${dot[status]}`} />
      {label}
    </span>
  );
}
