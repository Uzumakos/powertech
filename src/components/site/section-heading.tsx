type Props = {
  id: string;
  title: string;
  intro?: string;
  /** Small line under the title, e.g. the sector a list belongs to. */
  kicker?: string;
  tone?: "light" | "dark";
  className?: string;
};

/** Section title on the left, intro on the right from lg — the page's one heading pattern. */
export function SectionHeading({ id, title, intro, kicker, tone = "light", className = "" }: Props) {
  const dark = tone === "dark";
  return (
    <div className={`grid gap-4 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)] lg:items-end lg:gap-12 ${className}`}>
      <div>
        <h2
          id={id}
          className={`wide text-[clamp(1.625rem,3vw,2.625rem)] font-bold leading-[1.08] tracking-[-0.02em] ${dark ? "text-white" : ""}`}
        >
          {title}
        </h2>
        {kicker && <p className={`mt-2 text-base font-medium ${dark ? "text-volt" : "text-crimson"}`}>{kicker}</p>}
      </div>
      {intro && (
        <p className={`max-w-[34rem] text-base leading-relaxed sm:text-lg lg:justify-self-end ${dark ? "text-white/65" : ""}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
