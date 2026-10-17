"use server";

import { after } from "next/server";
import { format, hasLocale, pick, type Locale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/get-dictionary";
import { getProducts, getSettings } from "@/lib/data";
import { rowsToHtml, salesInbox, sendEmail, textToHtml } from "@/lib/email";
import { CONTACT_PREFS, isOneOf, isRateLimited, isValidEmail, isValidPhone, text, type ContactPref } from "@/lib/leads";
import { getServiceClient } from "@/lib/supabase/service";

const ORG_TYPES = ["institution", "business", "residential"] as const;
const SOLUTIONS = ["solar", "ups", "generator", "service"] as const;

export type QuoteField = "org" | "solutions" | "name" | "phone" | "email" | "company" | "city" | "message";
export type QuoteFieldError = "required" | "phone" | "email" | "emailForPref" | "org" | "solutions";

export type QuoteValues = {
  org: string;
  solutions: string[];
  name: string;
  phone: string;
  email: string;
  company: string;
  city: string;
  message: string;
  contactPref: string;
};

export type QuoteState =
  | { status: "idle" }
  | { status: "success"; name: string; contactPref: ContactPref }
  | {
      status: "error";
      values: QuoteValues;
      fieldErrors: Partial<Record<QuoteField, QuoteFieldError>>;
      formError?: "notConfigured" | "server" | "rateLimited";
    };

function parseItems(raw: string): { slug: string; qty: number }[] {
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((item) => typeof item?.slug === "string" && Number.isInteger(item?.qty))
      .slice(0, 50)
      .map((item) => ({ slug: item.slug.slice(0, 120), qty: Math.min(999, Math.max(1, item.qty)) }));
  } catch {
    return [];
  }
}

export async function submitQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  const values: QuoteValues = {
    org: text(formData, "org", 20),
    solutions: formData.getAll("solutions").map(String).filter((value) => isOneOf(SOLUTIONS, value)),
    name: text(formData, "name", 120),
    phone: text(formData, "phone", 30),
    email: text(formData, "email", 160),
    company: text(formData, "company", 160),
    city: text(formData, "city", 80),
    message: text(formData, "message", 2000),
    contactPref: text(formData, "contactPref", 10),
  };
  const contactPref: ContactPref = isOneOf(CONTACT_PREFS, values.contactPref) ? values.contactPref : "call";
  const rawLocale = text(formData, "locale", 2);
  const locale: Locale = hasLocale(rawLocale) ? rawLocale : "fr";
  const requestedItems = parseItems(String(formData.get("items") ?? "[]"));

  // Honeypot: real visitors never see or fill this field.
  if (text(formData, "website", 200)) return { status: "success", name: values.name, contactPref };

  const fieldErrors: Partial<Record<QuoteField, QuoteFieldError>> = {};
  if (!isOneOf(ORG_TYPES, values.org)) fieldErrors.org = "org";
  // Choosing products is as good as ticking a solution.
  if (values.solutions.length === 0 && requestedItems.length === 0) fieldErrors.solutions = "solutions";
  if (!values.name) fieldErrors.name = "required";
  if (!values.phone) fieldErrors.phone = "required";
  else if (!isValidPhone(values.phone)) fieldErrors.phone = "phone";
  if (values.email && !isValidEmail(values.email)) fieldErrors.email = "email";
  else if (!values.email && contactPref === "email") fieldErrors.email = "emailForPref";

  if (Object.keys(fieldErrors).length > 0) return { status: "error", values, fieldErrors };

  const supabase = getServiceClient();
  if (!supabase) return { status: "error", values, fieldErrors, formError: "notConfigured" };
  if (await isRateLimited(supabase, "quote_requests", values.phone)) {
    return { status: "error", values, fieldErrors, formError: "rateLimited" };
  }

  // Only products that exist in the catalog are recorded.
  const products = await getProducts();
  const items = requestedItems.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    return product ? [{ product, qty: item.qty }] : [];
  });

  const { data: request, error } = await supabase
    .from("quote_requests")
    .insert({
      org_type: values.org,
      solutions: values.solutions,
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      company: values.company || null,
      city: values.city || null,
      message: values.message || null,
      contact_pref: contactPref,
      locale,
    })
    .select("id")
    .single();
  if (error || !request) {
    console.error("quote_requests insert failed", error);
    return { status: "error", values, fieldErrors, formError: "server" };
  }

  if (items.length > 0) {
    const { error: itemsError } = await supabase.from("quote_items").insert(
      items.map(({ product, qty }) => ({
        request_id: request.id,
        // Seed products have no database id; keep the label either way.
        product_id: /^[0-9a-f-]{36}$/.test(product.id) ? product.id : null,
        label: pick(product.name, "fr"),
        quantity: qty,
      })),
    );
    if (itemsError) console.error("quote_items insert failed", itemsError);
  }

  // Emails go out after the response so the visitor isn't kept waiting.
  after(async () => {
    const [settings, dict, frDict] = await Promise.all([getSettings(), getDictionaryFor(locale), getDictionaryFor("fr")]);
    const itemLines = items.map(({ product, qty }) => `${qty} × ${pick(product.name, "fr")}`).join("\n");
    await sendEmail({
      to: salesInbox(settings.notificationEmail),
      replyTo: values.email || null,
      subject: `Nouvelle demande de devis : ${values.name}${values.company ? ` (${values.company})` : ""}`,
      html: rowsToHtml("Nouvelle demande de devis", [
        ["Nom", values.name],
        ["Entreprise", values.company],
        ["Téléphone", values.phone],
        ["E-mail", values.email],
        ["Ville", values.city],
        ["Organisation", frDict.quote.orgs[values.org as keyof typeof frDict.quote.orgs]],
        ["Solutions", values.solutions.map((key) => frDict.quote.solutions[key as keyof typeof frDict.quote.solutions]).join(", ")],
        ["Équipements", itemLines],
        ["Recontacter par", frDict.quote.prefs[contactPref]],
        ["Message", values.message],
      ]),
    });
    if (values.email) {
      await sendEmail({
        to: values.email,
        subject: dict.emails.quoteSubject,
        html: textToHtml(format(dict.emails.quoteBody, { name: values.name, phone: settings.phone })),
      });
    }
  });

  return { status: "success", name: values.name, contactPref };
}
