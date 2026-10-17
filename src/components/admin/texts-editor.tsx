"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, RotateCcw, Save, Trash2 } from "lucide-react";
import { saveTexts, type FormState } from "@/lib/admin/actions";
import type { Dictionary } from "@/i18n/dictionaries/fr";
import { AddButton, IconButton, inputClass } from "./fields";

type Path = (string | number)[];
type Tree = unknown;

const SECTION_LABELS: Record<string, string> = {
  meta: "Référencement (Google)",
  nav: "Menu",
  header: "En-tête",
  hero: "Accueil · bannière",
  partners: "Accueil · partenaires",
  why: "Accueil · Pourquoi Powertech",
  solutions: "Accueil · solutions",
  wave: "Accueil · simulateur de coupure",
  projects: "Accueil · réalisations",
  quote: "Formulaire de devis",
  basket: "Panier de devis",
  preorder: "Précommande",
  pwa: "Application et hors ligne",
  emails: "E-mails de confirmation",
  legal: "Mentions légales et confidentialité",
  cta: "Bandeau « cotation »",
  catalog: "Catalogue",
  product: "Fiche produit",
  sav: "Page SAV continu",
  about: "Page À propos",
  contact: "Page Contact",
  devis: "Page Demande de devis",
  footer: "Pied de page",
  common: "Textes communs",
  notFound: "Page introuvable",
};

const KEY_LABELS: Record<string, string> = {
  title: "Titre",
  subtitle: "Sous-titre",
  intro: "Introduction",
  body: "Texte",
  description: "Description",
  items: "Éléments",
  features: "Points forts",
  short: "Titre court",
  year: "Année ou étiquette",
  label: "Libellé",
  button: "Bouton",
  word: "Grand mot de fond",
  badge: "Pastille",
  primaryCta: "Bouton principal",
  secondaryCta: "Bouton secondaire",
  stats: "Chiffres clés",
  story: "Histoire (paragraphes)",
  timeline: "Frise chronologique",
  timelineTitle: "Titre de la frise",
  timelineIntro: "Introduction de la frise",
  mission: "Mission",
  steps: "Étapes",
  contractItems: "Contenu du contrat",
  errors: "Messages d'erreur",
  fields: "Champs",
  status: "Disponibilités",
  copyright: "Mention de copyright",
  tagline: "Slogan",
};

const humanize = (key: string | number) =>
  typeof key === "number"
    ? `N° ${key + 1}`
    : KEY_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function getIn(tree: Tree, path: Path): unknown {
  return path.reduce<unknown>((node, key) => (node as Record<string | number, unknown> | undefined)?.[key], tree);
}

function setIn(tree: Tree, path: Path, value: unknown): Tree {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  const node = (Array.isArray(tree) ? [...tree] : { ...(tree as object) }) as Record<string | number, unknown>;
  node[key] = setIn(node[key], rest, value);
  return node;
}

/** Same shape as `template`, with every string emptied (for a new list item). */
function blankLike(template: unknown): unknown {
  if (typeof template === "string") return "";
  if (Array.isArray(template)) return [];
  if (isObject(template)) return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, blankLike(value)]));
  return template;
}

type Texts = { fr: Tree; en: Tree };

export function TextsEditor({ fr, en, defaults }: { fr: Dictionary; en: Dictionary; defaults: { fr: Dictionary; en: Dictionary } }) {
  const [texts, setTexts] = useState<Texts>({ fr, en });
  const [section, setSection] = useState<string>("hero");
  const [result, setResult] = useState<FormState | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const sections = useMemo(() => Object.keys(fr), [fr]);

  const update = (lang: "fr" | "en", path: Path, value: unknown) => {
    setTexts((current) => ({ ...current, [lang]: setIn(current[lang], path, value) }));
    setDirty(true);
    setResult(null);
  };
  // List edits apply to both languages so items stay paired.
  const updateBoth = (path: Path, change: (list: unknown[], lang: "fr" | "en") => unknown[]) => {
    setTexts((current) => ({
      fr: setIn(current.fr, path, change([...((getIn(current.fr, path) as unknown[]) ?? [])], "fr")),
      en: setIn(current.en, path, change([...((getIn(current.en, path) as unknown[]) ?? [])], "en")),
    }));
    setDirty(true);
    setResult(null);
  };

  const save = () =>
    startTransition(async () => {
      const response = await saveTexts(texts);
      setResult(response);
      if (response.saved) setDirty(false);
    });

  const resetSection = () => {
    setTexts((current) => ({
      fr: setIn(current.fr, [section], (defaults.fr as Record<string, unknown>)[section]),
      en: setIn(current.en, [section], (defaults.en as Record<string, unknown>)[section]),
    }));
    setDirty(true);
    setResult(null);
  };

  function renderNode(path: Path): React.ReactNode {
    const frValue = getIn(texts.fr, path);
    const enValue = getIn(texts.en, path);
    const key = path[path.length - 1];

    if (typeof frValue === "string") {
      const long = frValue.length > 70 || String(enValue ?? "").length > 70;
      return (
        <div key={path.join(".")} className="grid gap-1.5">
          <p className="text-sm font-semibold text-ink">{humanize(key)}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {(["fr", "en"] as const).map((lang) => {
              const value = String(getIn(texts[lang], path) ?? "");
              const props = {
                value,
                lang,
                "aria-label": `${path.join(" › ")} (${lang.toUpperCase()})`,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(lang, path, event.target.value),
              };
              return (
                <div key={lang} className="relative">
                  {long ? (
                    <textarea rows={Math.min(8, Math.ceil(value.length / 60) + 1)} {...props} className={`${inputClass} pr-12 leading-relaxed`} />
                  ) : (
                    <input type="text" {...props} className={`${inputClass} pr-12`} />
                  )}
                  <span className="pointer-events-none absolute right-2 top-2 rounded bg-mist px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase text-muted">
                    {lang}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (Array.isArray(frValue)) {
      const template = getIn(defaults.fr, path) as unknown[] | undefined;
      const itemTemplate = template?.[0] ?? frValue[0] ?? "";
      return (
        <fieldset key={path.join(".")} className="grid gap-3 rounded-[var(--radius-card)] border border-line bg-mist p-4">
          <legend className="px-1 text-sm font-bold text-ink">{humanize(key)}</legend>
          {frValue.map((_, index) => (
            <div key={index} className="grid gap-3 rounded-[var(--radius-field)] border border-line bg-white p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted">Élément {index + 1}</span>
                <div className="flex gap-1">
                  <IconButton label="Monter" disabled={index === 0} onClick={() => updateBoth(path, (list) => (list.splice(index - 1, 0, ...list.splice(index, 1)), list))}>
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton
                    label="Descendre"
                    disabled={index === frValue.length - 1}
                    onClick={() => updateBoth(path, (list) => (list.splice(index + 1, 0, ...list.splice(index, 1)), list))}
                  >
                    <ArrowDown className="size-4" />
                  </IconButton>
                  <IconButton label="Supprimer" onClick={() => updateBoth(path, (list) => list.filter((__, i) => i !== index))}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
              {renderNode([...path, index])}
            </div>
          ))}
          <AddButton onClick={() => updateBoth(path, (list) => [...list, blankLike(itemTemplate)])}>Ajouter un élément</AddButton>
        </fieldset>
      );
    }

    if (isObject(frValue)) {
      const children = Object.keys(frValue).map((child) => renderNode([...path, child]));
      // List items and the section root render their fields directly.
      if (path.length <= 1 || typeof key === "number") return <div key={path.join(".")} className="grid gap-5">{children}</div>;
      return (
        <fieldset key={path.join(".")} className="grid gap-5 border-l-2 border-line pl-4">
          <legend className="mb-1 text-sm font-bold text-ink">{humanize(key)}</legend>
          {children}
        </fieldset>
      );
    }
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <label htmlFor="texts-section" className="sr-only">
          Section
        </label>
        <select id="texts-section" value={section} onChange={(event) => setSection(event.target.value)} className={`${inputClass} lg:hidden`}>
          {sections.map((key) => (
            <option key={key} value={key}>
              {SECTION_LABELS[key] ?? humanize(key)}
            </option>
          ))}
        </select>
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="grid gap-0.5">
            {sections.map((key) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setSection(key)}
                  aria-current={section === key ? "true" : undefined}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white hover:text-ink aria-[current=true]:bg-white aria-[current=true]:font-semibold aria-[current=true]:text-ink aria-[current=true]:shadow-sm"
                >
                  {SECTION_LABELS[key] ?? humanize(key)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="wide text-xl font-bold">{SECTION_LABELS[section] ?? humanize(section)}</h2>
            <button type="button" onClick={resetSection} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-crimson">
              <RotateCcw className="size-4" />
              Rétablir les textes d&apos;origine de cette section
            </button>
          </div>
          {renderNode([section])}
        </div>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-mist/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-[var(--radius-card)] sm:border sm:bg-white/95 sm:px-5">
          <button type="button" onClick={save} disabled={pending || !dirty} className="btn btn-volt disabled:opacity-60">
            <Save className="size-4" />
            {pending ? "Enregistrement…" : "Enregistrer tous les textes"}
          </button>
          {dirty && !pending && <span className="text-sm text-muted">Modifications non enregistrées</span>}
          {result?.message && (
            <span role={result.saved ? "status" : "alert"} className={`inline-flex items-center gap-1.5 text-sm font-medium ${result.saved ? "text-[#166534]" : "text-crimson"}`}>
              {result.saved ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
              {result.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
