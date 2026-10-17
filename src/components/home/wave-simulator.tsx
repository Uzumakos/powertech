"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries/fr";

type Row = "grid" | "backup" | "ups";
type Phase = "idle" | "running" | "done";
type Outage = { start: number; end: number };

const ROWS: Row[] = ["grid", "backup", "ups"];

// Simulation units are seconds of a slowed-down 50 Hz wave.
const WINDOW = 2.4; // visible time span
const FREQ = 2.2; // cycles per second on screen
const OUTAGE = 1.1; // how long the grid stays off
const GAP = 0.34; // basic backup switchover gap (stands for 10–20 ms)
const LEAD = 0.7; // normal wave shown before the cut
const SPEED = 0.6; // simulated seconds per real second
const SAMPLES = 180;
const VB_W = 600;
const VB_H = 64;
const AMP = 22;

function amplitude(row: Row, t: number, outage: Outage | null): number {
  if (!outage || row === "ups") return 1;
  if (row === "grid") return t >= outage.start && t < outage.end ? 0 : 1;
  return t >= outage.start && t < outage.start + GAP ? 0 : 1;
}

function wavePath(row: Row, now: number, outage: Outage | null): string {
  let d = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const t = now - WINDOW + (i / SAMPLES) * WINDOW;
    const x = (i / SAMPLES) * VB_W;
    const y = VB_H / 2 - amplitude(row, t, outage) * AMP * Math.sin(2 * Math.PI * FREQ * t);
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/** Shaded span (in viewBox x units) where this row has no power. */
function cutSpan(row: Row, now: number, outage: Outage | null): [number, number] | null {
  if (!outage || row === "ups") return null;
  const end = row === "grid" ? outage.end : outage.start + GAP;
  const toX = (t: number) => ((t - (now - WINDOW)) / WINDOW) * VB_W;
  const x1 = Math.max(0, toX(outage.start));
  const x2 = Math.min(VB_W, toX(end));
  return x2 > x1 ? [x1, x2] : null;
}

const STATIC_NOW = WINDOW;

/**
 * Three stacked oscilloscope traces: the EDH grid, a basic backup and an online
 * UPS. Pressing the button cuts the grid; the trace scrolls until the outage
 * sits in the middle, then freezes so the three can be compared.
 */
export function WaveSimulator({ dict }: { dict: Dictionary["wave"] }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [cut, setCut] = useState(false);
  const paths = useRef<Record<Row, SVGPathElement | null>>({ grid: null, backup: null, ups: null });
  const shades = useRef<Record<Row, SVGRectElement | null>>({ grid: null, backup: null, ups: null });
  const frame = useRef<number | null>(null);

  useEffect(() => () => {
    if (frame.current) cancelAnimationFrame(frame.current);
  }, []);

  function draw(now: number, outage: Outage | null) {
    for (const row of ROWS) {
      paths.current[row]?.setAttribute("d", wavePath(row, now, outage));
      const rect = shades.current[row];
      const span = cutSpan(row, now, outage);
      if (rect) {
        rect.setAttribute("x", String(span ? span[0] : 0));
        rect.setAttribute("width", String(span ? span[1] - span[0] : 0));
      }
    }
  }

  function play() {
    if (frame.current) cancelAnimationFrame(frame.current);
    const startNow = STATIC_NOW;
    const outage = { start: startNow + LEAD, end: startNow + LEAD + OUTAGE };
    // Freeze with the outage centred in the window.
    const stopAt = outage.start + OUTAGE / 2 + WINDOW / 2;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(stopAt, outage);
      setCut(true);
      setPhase("done");
      return;
    }

    setPhase("running");
    setCut(false);
    const t0 = performance.now();
    const tick = (time: number) => {
      const now = Math.min(stopAt, startNow + ((time - t0) / 1000) * SPEED);
      draw(now, outage);
      if (now >= outage.start) setCut(true);
      if (now < stopAt) {
        frame.current = requestAnimationFrame(tick);
      } else {
        frame.current = null;
        setPhase("done");
      }
    };
    frame.current = requestAnimationFrame(tick);
  }

  const action =
    phase === "running"
      ? { label: dict.playing, Icon: Play }
      : phase === "done"
        ? { label: dict.replay, Icon: RotateCcw }
        : { label: dict.play, Icon: Play };

  return (
    <div className="rounded-[var(--radius-card)] border border-white/15 bg-night/70 p-4 backdrop-blur-md sm:p-6">
      <h4 className="wide text-lg font-bold text-white sm:text-xl">{dict.title}</h4>
      <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-white/70 sm:text-[0.9375rem]">{dict.body}</p>

      <ul className="mt-5 space-y-3">
        {ROWS.map((row) => {
          const labels = dict[row];
          const isUps = row === "ups";
          return (
            <li key={row} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 pb-1 pt-2.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <span className={`text-[0.8125rem] font-semibold ${isUps ? "text-volt" : "text-white"}`}>{labels.label}</span>
                <span
                  aria-live="polite"
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    cut && !isUps ? "text-[#ff8a8a]" : "text-white/60"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${cut && !isUps ? "bg-[#ff6b6b]" : isUps ? "bg-volt" : "bg-[#4ade80]"}`}
                  />
                  {cut ? labels.cut : labels.normal}
                </span>
              </div>
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" aria-hidden className="mt-1 block h-12 w-full sm:h-14">
                <line x1="0" x2={VB_W} y1={VB_H / 2} y2={VB_H / 2} className="stroke-white/10" strokeWidth="1" />
                <rect
                  ref={(el) => {
                    shades.current[row] = el;
                  }}
                  x="0"
                  y="0"
                  width="0"
                  height={VB_H}
                  className="fill-[#ff6b6b]/20"
                />
                <path
                  ref={(el) => {
                    paths.current[row] = el;
                  }}
                  d={wavePath(row, STATIC_NOW, null)}
                  fill="none"
                  strokeWidth="2.25"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  className={isUps ? "stroke-volt" : "stroke-white/70"}
                />
              </svg>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={play} disabled={phase === "running"} className="btn btn-volt disabled:opacity-80">
          <action.Icon aria-hidden className="size-4" />
          {action.label}
        </button>
        <span className="text-xs text-white/45">{dict.slowed}</span>
      </div>
    </div>
  );
}
