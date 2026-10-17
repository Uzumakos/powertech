"use client";

import { useEffect, useRef } from "react";

export type Milestone = { year: string; title: string; body: string };

/**
 * Vertical timeline. A volt rail fills as the reader scrolls through it and
 * each milestone rises in when it enters the viewport. The effect only marks
 * milestones as pending once it runs, so content is fully visible without
 * JavaScript and with reduced motion.
 */
export function Timeline({ items }: { items: Milestone[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Milestones already on screen (or scrolled past after a reload) stay visible.
    const pending = Array.from(list.querySelectorAll<HTMLElement>("[data-milestone]")).filter(
      (node) => node.getBoundingClientRect().top > window.innerHeight * 0.9,
    );
    pending.forEach((node) => node.setAttribute("data-pending", ""));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal milestones the reader jumped past (now above the viewport).
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue;
          entry.target.removeAttribute("data-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    pending.forEach((node) => observer.observe(node));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const rect = list.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - rect.top) / rect.height));
      list.style.setProperty("--timeline-progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      pending.forEach((node) => node.removeAttribute("data-pending"));
      list.style.removeProperty("--timeline-progress");
    };
  }, []);

  return (
    <ol ref={listRef} className="relative">
      {/* Rail: on the left on phones, centred from md. Full until the script measures it. */}
      <div aria-hidden className="absolute inset-y-2 left-5 w-0.5 -translate-x-1/2 rounded-full bg-night-line md:left-1/2">
        <div className="h-full w-full origin-top scale-y-[var(--timeline-progress,1)] rounded-full bg-volt" />
      </div>

      {items.map((item, index) => {
        const flip = index % 2 === 1;
        const longLabel = item.year.length > 6;
        return (
          <li
            key={item.title}
            data-milestone={index}
            className="group/milestone relative grid gap-3 pb-14 pl-14 last:pb-2 md:grid-cols-2 md:gap-x-20 md:pl-0"
          >
            <span
              aria-hidden
              className="absolute left-5 top-2 grid size-10 -translate-x-1/2 place-items-center rounded-full border-2 border-volt bg-night transition-colors duration-500 group-data-pending/milestone:border-night-line md:left-1/2"
            >
              <span className="size-3 rounded-full bg-volt transition-colors duration-500 group-data-pending/milestone:bg-night-line" />
            </span>

            <p
              className={`timeline-reveal wide font-extrabold leading-none tracking-[-0.03em] text-volt md:pt-1 ${
                longLabel ? "text-[clamp(1.5rem,3vw,2.5rem)]" : "text-[clamp(2.5rem,6vw,5rem)]"
              } ${flip ? "md:order-2" : "md:text-right"}`}
            >
              {item.year}
            </p>
            <div
              className={`timeline-reveal rounded-[var(--radius-card)] border border-night-line bg-night-2 p-6 [transition-delay:120ms] sm:p-7 ${
                flip ? "md:order-1" : ""
              }`}
            >
              <h3 className="wide text-xl font-bold leading-snug text-white sm:text-2xl">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-white/70">{item.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
