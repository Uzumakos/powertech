/* eslint-disable @next/next/no-img-element -- admin logos can come from any host */

type LogoProps = {
  companyName: string;
  /** Logo URL set in the admin; the built-in wordmark is used when empty. */
  src: string | null;
  tone?: "light" | "dark";
  className?: string;
};

export function BoltMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid size-9 shrink-0 place-items-center rounded-[10px] bg-crimson ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-volt">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    </span>
  );
}

export function Logo({ companyName, src, tone = "light", className = "" }: LogoProps) {
  if (src) {
    return <img src={src} alt={companyName} className={`h-9 w-auto max-w-44 object-contain ${className}`} />;
  }

  const onDark = tone === "dark";
  // "Powertech Services S.A." → "Powertech" set large, the rest underneath.
  const [brand, ...rest] = companyName.trim().split(/\s+/);
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BoltMark />
      <span className="flex flex-col leading-none">
        <span className={`wide text-[1.0625rem] font-extrabold tracking-tight ${onDark ? "text-white" : "text-crimson"}`}>
          {/* Trailing space keeps the read-out name "Powertech Services S.A." */}
          {brand}{" "}
        </span>
        {rest.length > 0 && (
          <span className={`mt-0.5 text-[0.6875rem] font-medium tracking-wide ${onDark ? "text-white/60" : "text-muted"}`}>
            {rest.join(" ")}
          </span>
        )}
      </span>
    </span>
  );
}
