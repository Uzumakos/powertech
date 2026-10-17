"use server";

import { after } from "next/server";
import { format, hasLocale, pick, type Locale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/get-dictionary";
import { getProduct, getSettings } from "@/lib/data";
import { rowsToHtml, salesInbox, sendEmail, textToHtml } from "@/lib/email";
import { CONTACT_PREFS, isOneOf, isRateLimited, isValidEmail, isValidPhone, text, type ContactPref } from "@/lib/leads";
import { getServiceClient } from "@/lib/supabase/service";

export type PreorderField = "quantity" | "desiredDate" | "name" | "phone" | "email";
export type PreorderFieldError = "required" | "phone" | "email" | "emailForPref" | "quantity" | "date";

export type PreorderValues = {
  quantity: string;
  desiredDate: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  message: string;
  contactPref: string;
};

export type PreorderState =
  | { status: "idle" }
  | { status: "success"; name: string; contactPref: ContactPref }
  | {
      status: "error";
      values: PreorderValues;
      fieldErrors: Partial<Record<PreorderField, PreorderFieldError>>;
      formError?: "notConfigured" | "server" | "rateLimited";
    };

export async function submitPreorder(slug: string, _previous: PreorderState, formData: FormData): Promise<PreorderState> {
  const values: PreorderValues = {
    quantity: text(formData, "quantity", 4),
    desiredDate: text(formData, "desiredDate", 10),
    name: text(formData, "name", 120),
    phone: text(formData, "phone", 30),
    email: text(formData, "email", 160),
    company: text(formData, "company", 160),
    message: text(formData, "message", 2000),
    contactPref: text(formData, "contactPref", 10),
  };
  const contactPref: ContactPref = isOneOf(CONTACT_PREFS, values.contactPref) ? values.contactPref : "call";
  const rawLocale = text(formData, "locale", 2);
  const locale: Locale = hasLocale(rawLocale) ? rawLocale : "fr";

  if (text(formData, "website", 200)) return { status: "success", name: values.name, contactPref };

  const product = await getProduct(slug);
  if (!product || !product.preorderEnabled) return { status: "error", values, fieldErrors: {}, formError: "server" };

  const fieldErrors: Partial<Record<PreorderField, PreorderFieldError>> = {};
  const quantity = Number(values.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) fieldErrors.quantity = "quantity";
  if (values.desiredDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.desiredDate) || values.desiredDate < today) fieldErrors.desiredDate = "date";
  }
  if (!values.name) fieldErrors.name = "required";
  if (!values.phone) fieldErrors.phone = "required";
  else if (!isValidPhone(values.phone)) fieldErrors.phone = "phone";
  if (values.email && !isValidEmail(values.email)) fieldErrors.email = "email";
  else if (!values.email && contactPref === "email") fieldErrors.email = "emailForPref";

  if (Object.keys(fieldErrors).length > 0) return { status: "error", values, fieldErrors };

  const supabase = getServiceClient();
  if (!supabase) return { status: "error", values, fieldErrors, formError: "notConfigured" };
  if (await isRateLimited(supabase, "preorders", values.phone)) return { status: "error", values, fieldErrors, formError: "rateLimited" };

  const productLabel = pick(product.name, "fr");
  const { error } = await supabase.from("preorders").insert({
    product_id: /^[0-9a-f-]{36}$/.test(product.id) ? product.id : null,
    product_label: productLabel,
    quantity,
    desired_date: values.desiredDate || null,
    name: values.name,
    company: values.company || null,
    email: values.email || null,
    phone: values.phone,
    contact_pref: contactPref,
    message: values.message || null,
    locale,
  });
  if (error) {
    console.error("preorders insert failed", error);
    return { status: "error", values, fieldErrors, formError: "server" };
  }

  after(async () => {
    const [settings, dict, frDict] = await Promise.all([getSettings(), getDictionaryFor(locale), getDictionaryFor("fr")]);
    await sendEmail({
      to: salesInbox(settings.notificationEmail),
      replyTo: values.email || null,
      subject: `Nouvelle précommande : ${quantity} × ${productLabel}`,
      html: rowsToHtml("Nouvelle précommande", [
        ["Produit", `${quantity} × ${productLabel}`],
        ["Date souhaitée", values.desiredDate],
        ["Nom", values.name],
        ["Entreprise", values.company],
        ["Téléphone", values.phone],
        ["E-mail", values.email],
        ["Recontacter par", frDict.quote.prefs[contactPref]],
        ["Message", values.message],
      ]),
    });
    if (values.email) {
      await sendEmail({
        to: values.email,
        subject: dict.emails.preorderSubject,
        html: textToHtml(
          format(dict.emails.preorderBody, { name: values.name, quantity, product: pick(product.name, locale), phone: settings.phone }),
        ),
      });
    }
  });

  return { status: "success", name: values.name, contactPref };
}
