"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Cpu, Fuel, Headset, SunMedium, type LucideIcon } from "lucide-react";
import { MediaImage } from "@/components/media-image";
import { format } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { WaveSimulator } from "./wave-simulator";

export type SolutionKey = "solar" | "ups" | "generator" | "service";

export type SolutionPanel = {
  key: SolutionKey;
  short: string;
  title: string;
  body: string;
  features: string[];
  imageUrl: string | null;
  href: string;
  linkLabel: string;
};

const icons: Record<SolutionKey, LucideIcon> = {
  solar: SunMedium,
  ups: Cpu,
  generator: Fuel,
  service: Headset,
};

type Props = {
  panels: SolutionPanel[];
  expandLabel: string;
  wave: Dictionary["wave"];
};

/**
 * Horizontal expanding panels from xl (one open, the others shrink to a
 * vertical label), a vertical accordion below. The UPS panel opens first: it
 * carries the outage simulator.
 */
export function SolutionPanels({ panels, expandLabel, wave }: Props) {
  const [active, setActive] = useState<SolutionKey>("ups");

  return (
    <div className="flex flex-col gap-3 xl:h-[42rem] xl:flex-row">
      {panels.map((panel) => {
        const open = panel.key === active;
        const Icon = icons[panel.key];
        const contentId = `solution-${panel.key}`;

        return (
          <div
            key={panel.key}
            className={`relative isolate overflow-hidden rounded-[var(--radius-card)] border border-night-line bg-night-2 transition-[flex] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:transition-none  xl:min-w-0 ${
              open ? "xl:flex-[1_1_0%]" : "xl:flex-[0_0_5.5rem]"
            }`}
          >
            {panel.imageUrl && (
              <MediaImage
                src={panel.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1280px) 70vw, 100vw"
                className={`-z-20 object-cover transition-opacity duration-500 ${open ? "opacity-35 xl:opacity-30" : "opacity-25"}`}
              />
            )}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night-2 via-night-2/85 to-night-2/40" />

            {/* Toggle: a full row on mobile, the whole collapsed column on desktop. */}
            <button
              type="button"
              onClick={() => setActive(panel.key)}
              aria-expanded={open}
              aria-controls={contentId}
              title={open ? undefined : format(expandLabel, { title: panel.title })}
              className={`flex w-full items-center gap-3 p-4 text-left text-white sm:p-5 ${
                open ? "xl:hidden" : "xl:h-full xl:flex-col xl:items-center xl:justify-between xl:px-0 xl:py-6"
              }`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-volt">
                <Icon aria-hidden className="size-5" />
              </span>
              <span className="wide flex-1 text-base font-bold xl:flex-none xl:rotate-180 xl:text-lg xl:[writing-mode:vertical-rl]">
                {panel.short}
              </span>
              <ChevronDown
                aria-hidden
                className={`size-5 text-white/60 transition-transform xl:hidden ${open ? "rotate-180" : ""}`}
              />
            </button>

            <div
              id={contentId}
              hidden={!open}
              className={`px-4 pb-5 sm:px-6 sm:pb-6 xl:h-full xl:overflow-y-auto xl:p-8 ${
                panel.key === "ups" ? "xl:grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-end xl:gap-8" : "xl:flex xl:flex-col xl:justify-end"
              }`}
            >
              <div className="xl:min-w-[22rem]">
                <span aria-hidden className="hidden size-12 place-items-center rounded-xl bg-white/10 text-volt xl:grid">
                  <Icon className="size-6" />
                </span>
                <h3 className="wide mt-1 text-2xl font-bold leading-tight tracking-[-0.01em] text-white xl:mt-6 xl:text-[1.875rem]">
                  {panel.title}
                </h3>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-white/70">{panel.body}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {panel.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[0.9375rem] text-white/85">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-volt" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={panel.href}
                  className="btn mt-6 border border-white/25 text-white transition-colors hover:border-white/60 hover:bg-white/5"
                >
                  {panel.linkLabel}
                </Link>
              </div>
              {panel.key === "ups" && (
                <div className="mt-6 xl:mt-0">
                  <WaveSimulator dict={wave} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
