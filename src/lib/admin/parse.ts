import type { FieldDef } from "./entities";

export type FormErrors = Record<string, string>;
type Localized = { fr: string; en: string };
type SpecText = string | Localized;

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const isUrl = (value: string) => value.startsWith("/") || /^https?:\/\/\S+$/i.test(value);

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function specText(value: unknown): SpecText | null {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const { fr = "", en = "" } = value as Partial<Localized>;
    const frText = String(fr).trim();
    const enText = String(en).trim();
    // Same text in both languages (numbers, model names) is stored once.
    if (!enText || enText === frText) return frText;
    return { fr: frText, en: enText };
  }
  return null;
}

/** Reads and validates a form generated from field definitions. */
export function parseFields(fields: FieldDef[], formData: FormData) {
  const values: Record<string, unknown> = {};
  const errors: FormErrors = {};
  const required = "Ce champ est obligatoire.";

  for (const field of fields) {
    const { name } = field;
    switch (field.type) {
      case "localized":
      case "localizedLong": {
        const fr = str(formData, `${name}.fr`);
        const en = str(formData, `${name}.en`);
        if (field.required && !fr) errors[`${name}.fr`] = required;
        values[name] = { fr, en };
        break;
      }
      case "boolean":
        values[name] = formData.get(name) === "on";
        break;
      case "number": {
        const raw = str(formData, name);
        if (!raw) {
          if (field.required) errors[name] = required;
          values[name] = name === "sort_order" ? 0 : null;
        } else if (!/^-?\d+$/.test(raw)) {
          errors[name] = "Entrez un nombre entier.";
        } else {
          values[name] = Number(raw);
        }
        break;
      }
      case "images": {
        const list = parseJson(str(formData, name));
        const urls = Array.isArray(list) ? list.map((item) => String(item).trim()).filter(Boolean) : [];
        const invalid = urls.find((url) => !isUrl(url));
        if (invalid) errors[name] = `Lien invalide : ${invalid}`;
        if (field.required && urls.length === 0) errors[name] = required;
        values[name] = urls;
        break;
      }
      case "specs": {
        const list = parseJson(str(formData, name));
        const rows = Array.isArray(list) ? list : [];
        const specs = [];
        for (const row of rows as Record<string, unknown>[]) {
          const label = row.label as Partial<Localized> | undefined;
          const labelFr = String(label?.fr ?? "").trim();
          const value = specText(row.value);
          if (!labelFr && !value) continue;
          if (!labelFr || !value) {
            errors[name] = "Chaque caractéristique doit avoir un nom (FR) et une valeur.";
            continue;
          }
          const unit = specText(row.unit);
          specs.push({
            key: slugify(String(row.key || labelFr)) || `spec-${specs.length + 1}`,
            label: { fr: labelFr, en: String(label?.en ?? "").trim() || labelFr },
            value,
            ...(unit ? { unit } : {}),
          });
        }
        values[name] = specs;
        break;
      }
      default: {
        const raw = str(formData, name);
        if (!raw) {
          if (field.required && field.type !== "slug") errors[name] = required;
          values[name] = null;
          break;
        }
        if ((field.type === "url" || field.type === "image") && !isUrl(raw)) {
          errors[name] = "Entrez un lien complet commençant par https://";
        } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
          errors[name] = "Entrez une adresse e-mail valide.";
        } else if (field.type === "slug" && slugify(raw) !== raw) {
          values[name] = slugify(raw);
          break;
        }
        values[name] = raw;
      }
    }
  }

  // Empty slugs are generated from their source field.
  for (const field of fields.filter((item) => item.type === "slug")) {
    if (values[field.name]) continue;
    const source = field.from ? values[field.from] : null;
    const text = typeof source === "string" ? source : (source as Localized | null)?.fr ?? "";
    const slug = slugify(text);
    if (slug) values[field.name] = slug;
    else errors[field.name] = "Indiquez une adresse ou remplissez le nom.";
  }

  // An empty lead time means "show nothing".
  if (values.lead_time && !(values.lead_time as Localized).fr && !(values.lead_time as Localized).en) {
    values.lead_time = {};
  }

  return { values, errors };
}
