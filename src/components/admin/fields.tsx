"use client";

/* eslint-disable @next/next/no-img-element -- previews of admin-pasted links from any host */
import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImageOff, Plus, Trash2 } from "lucide-react";

export type MediaOption = { url: string; label: string };

export const inputClass =
  "block w-full rounded-[var(--radius-field)] border border-line bg-white px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder:text-muted/60 focus:border-crimson focus:outline-none aria-[invalid=true]:border-crimson";

type Localized = { fr: string; en: string };
type SpecText = string | Localized;
export type SpecRow = { key: string; label: Localized; value: SpecText; unit?: SpecText };

export function FieldShell({
  label,
  htmlFor,
  help,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-crimson"> *</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {help && !error && <p className="mt-1.5 text-[0.8125rem] leading-snug text-muted">{help}</p>}
      {error && <p className="mt-1.5 text-[0.8125rem] font-medium text-crimson">{error}</p>}
    </div>
  );
}

const LangTag = ({ lang }: { lang: "fr" | "en" }) => (
  <span className="pointer-events-none absolute right-2 top-2 rounded bg-mist px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase text-muted">
    {lang}
  </span>
);

export function LocalizedInput({
  name,
  value,
  long,
  errors,
}: {
  name: string;
  value: Partial<Localized> | null | undefined;
  long?: boolean;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-2">
      {(["fr", "en"] as const).map((lang) => {
        const props = {
          name: `${name}.${lang}`,
          defaultValue: value?.[lang] ?? "",
          "aria-label": `${name} ${lang.toUpperCase()}`,
          "aria-invalid": errors?.[`${name}.${lang}`] ? true : undefined,
          lang,
        };
        return (
          <div key={lang} className="relative">
            {long ? (
              <textarea rows={4} {...props} className={`${inputClass} pr-12 leading-relaxed`} />
            ) : (
              <input type="text" {...props} className={`${inputClass} pr-12`} />
            )}
            <LangTag lang={lang} />
          </div>
        );
      })}
    </div>
  );
}

function Preview({ url, size = "md" }: { url: string; size?: "sm" | "md" }) {
  const [failed, setFailed] = useState<string | null>(null);
  const box = size === "sm" ? "size-14" : "h-24 w-36";
  if (!url) return <div className={`${box} shrink-0 rounded-lg border border-dashed border-line bg-mist`} />;
  return (
    <div className={`${box} shrink-0 overflow-hidden rounded-lg border border-line bg-[conic-gradient(#f1f5f9_25%,#fff_0_50%,#f1f5f9_0_75%,#fff_0)] bg-[length:16px_16px]`}>
      {failed === url ? (
        <div className="grid h-full place-items-center text-crimson" title="Image introuvable à ce lien">
          <ImageOff className="size-5" />
        </div>
      ) : (
        <img src={url} alt="" className="h-full w-full object-contain" onError={() => setFailed(url)} />
      )}
    </div>
  );
}

/** One image link: paste a URL or pick one from the media library, with a live preview. */
export function ImageInput({
  name,
  defaultValue,
  media,
  invalid,
}: {
  name: string;
  defaultValue?: string | null;
  media: MediaOption[];
  invalid?: boolean;
}) {
  const id = useId();
  const [url, setUrl] = useState(defaultValue ?? "");
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <Preview url={url} />
      <div className="grid flex-1 gap-2">
        <input
          id={id}
          type="url"
          name={name}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
          aria-invalid={invalid || undefined}
          className={inputClass}
        />
        {media.length > 0 && (
          <select
            aria-label="Choisir dans la médiathèque"
            value=""
            onChange={(event) => event.target.value && setUrl(event.target.value)}
            className={`${inputClass} text-muted`}
          >
            <option value="">Choisir dans la médiathèque…</option>
            {media.map((item) => (
              <option key={item.url} value={item.url}>
                {item.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

/** Ordered list of image links, serialized to JSON in a hidden input. */
export function ImagesInput({ name, defaultValue, media }: { name: string; defaultValue?: string[] | null; media: MediaOption[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue?.length ? defaultValue : [""]);
  const update = (index: number, value: string) => setUrls((list) => list.map((item, i) => (i === index ? value : item)));
  const move = (index: number, offset: number) =>
    setUrls((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={JSON.stringify(urls.filter((url) => url.trim()))} />
      {urls.map((url, index) => (
        <div key={index} className="flex items-center gap-2">
          <Preview url={url} size="sm" />
          <input
            type="url"
            value={url}
            onChange={(event) => update(index, event.target.value)}
            placeholder="https://…"
            aria-label={`Photo ${index + 1}`}
            className={inputClass}
          />
          {media.length > 0 && (
            <select
              aria-label={`Photo ${index + 1} : choisir dans la médiathèque`}
              value=""
              onChange={(event) => event.target.value && update(index, event.target.value)}
              className={`${inputClass} hidden w-44 text-muted lg:block`}
            >
              <option value="">Médiathèque…</option>
              {media.map((item) => (
                <option key={item.url} value={item.url}>
                  {item.label}
                </option>
              ))}
            </select>
          )}
          <IconButton label="Monter" disabled={index === 0} onClick={() => move(index, -1)}>
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton label="Descendre" disabled={index === urls.length - 1} onClick={() => move(index, 1)}>
            <ArrowDown className="size-4" />
          </IconButton>
          <IconButton label="Retirer" onClick={() => setUrls((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : [""]))}>
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <AddButton onClick={() => setUrls((list) => [...list, ""])}>Ajouter une photo</AddButton>
    </div>
  );
}

const asLocalized = (text: SpecText | undefined): Localized =>
  typeof text === "string" ? { fr: text, en: "" } : { fr: text?.fr ?? "", en: text?.en ?? "" };

/** Technical specification rows: name, value and unit, each in FR/EN. */
export function SpecsInput({ name, defaultValue }: { name: string; defaultValue?: SpecRow[] | null }) {
  type Row = { key: string; label: Localized; value: Localized; unit: Localized };
  const blank = (): Row => ({ key: "", label: { fr: "", en: "" }, value: { fr: "", en: "" }, unit: { fr: "", en: "" } });
  const [rows, setRows] = useState<Row[]>(() =>
    defaultValue?.length
      ? defaultValue.map((spec) => ({ key: spec.key, label: asLocalized(spec.label), value: asLocalized(spec.value), unit: asLocalized(spec.unit) }))
      : [blank()],
  );
  const set = (index: number, part: "label" | "value" | "unit", lang: "fr" | "en", text: string) =>
    setRows((list) => list.map((row, i) => (i === index ? { ...row, [part]: { ...row[part], [lang]: text } } : row)));
  const move = (index: number, offset: number) =>
    setRows((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });

  const cell = (index: number, row: Row, part: "label" | "value" | "unit", lang: "fr" | "en", placeholder: string) => (
    <input
      type="text"
      value={row[part][lang]}
      onChange={(event) => set(index, part, lang, event.target.value)}
      placeholder={placeholder}
      aria-label={`${placeholder} ligne ${index + 1}`}
      className={`${inputClass} py-2`}
    />
  );

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <p className="text-[0.8125rem] text-muted">
        Laissez la colonne EN vide quand la valeur est identique (chiffres, références).
      </p>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 rounded-[var(--radius-field)] border border-line bg-mist p-3 lg:grid-cols-[1.4fr_1fr_0.6fr_auto] lg:items-start">
          <div className="grid gap-1.5">
            {cell(index, row, "label", "fr", "Nom FR (ex. Puissance)")}
            {cell(index, row, "label", "en", "Nom EN (ex. Power)")}
          </div>
          <div className="grid gap-1.5">
            {cell(index, row, "value", "fr", "Valeur FR (ex. 120)")}
            {cell(index, row, "value", "en", "Valeur EN (si différente)")}
          </div>
          <div className="grid gap-1.5">
            {cell(index, row, "unit", "fr", "Unité (ex. kVA)")}
            {cell(index, row, "unit", "en", "Unité EN")}
          </div>
          <div className="flex gap-1 lg:flex-col">
            <IconButton label="Monter" disabled={index === 0} onClick={() => move(index, -1)}>
              <ArrowUp className="size-4" />
            </IconButton>
            <IconButton label="Descendre" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
              <ArrowDown className="size-4" />
            </IconButton>
            <IconButton label="Supprimer la ligne" onClick={() => setRows((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : [blank()]))}>
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        </div>
      ))}
      <AddButton onClick={() => setRows((list) => [...list, blank()])}>Ajouter une caractéristique</AddButton>
    </div>
  );
}

export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 self-start rounded-full border border-dashed border-ink/25 px-4 text-sm font-medium text-ink hover:border-crimson hover:text-crimson"
    >
      <Plus className="size-4" />
      {children}
    </button>
  );
}
