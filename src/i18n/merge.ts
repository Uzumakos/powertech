// Merging admin text overrides into the built-in dictionaries. Shared by the
// public site (get-dictionary) and the admin text editor.

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Overlays `override` on `base`, keeping base's shape: a value is only taken
 * when it has the same type as the default, empty strings fall back to the
 * default, and arrays are replaced as a whole (so the admin can add or remove
 * list items) with each item still completed from the default at its index.
 */
export function mergeDeep<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;

  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    const template = base[0];
    return override.map((item, index) => mergeDeep(base[index] ?? template, item)) as T;
  }
  if (isObject(base)) {
    if (!isObject(override)) return base;
    const result: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) result[key] = mergeDeep(base[key], override[key]);
    return result as T;
  }
  if (typeof base === "string") {
    return (typeof override === "string" && override.trim() !== "" ? override : base) as T;
  }
  return (typeof override === typeof base ? override : base) as T;
}

/** Replaces `{name}` placeholders in every string of a nested structure. */
export function formatDeep<T>(value: T, vars: Record<string, string | number>): T {
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match)) as T;
  }
  if (Array.isArray(value)) return value.map((item) => formatDeep(item, vars)) as T;
  if (isObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, formatDeep(item, vars)])) as T;
  }
  return value;
}

/**
 * What changed in `edited` compared with `base`, so only real edits are
 * stored and later improvements to the default wording still show up.
 * Arrays are compared as a whole and stored whole when they differ.
 */
export function diffDeep(base: unknown, edited: unknown): unknown {
  if (Array.isArray(base) || Array.isArray(edited)) {
    return JSON.stringify(base) === JSON.stringify(edited) ? undefined : edited;
  }
  if (isObject(base) && isObject(edited)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(base)) {
      const change = diffDeep(base[key], edited[key]);
      if (change !== undefined) result[key] = change;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  if (typeof edited === "string" && edited.trim() === "") return undefined;
  return edited === base ? undefined : edited;
}

export type { Json };
