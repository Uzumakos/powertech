import { cacheLife, cacheTag } from "next/cache";
import { getPublicClient } from "@/lib/supabase/public";
import {
  seedCategories,
  seedPartners,
  seedProducts,
  seedProjects,
  seedServices,
  seedSettings,
} from "./seed";
import type {
  Category,
  Partner,
  Product,
  Project,
  Service,
  SiteSettings,
  SiteSettingsRecord,
} from "./types";

export type * from "./types";

// Every reader below is cached and tagged; the admin revalidates the matching
// tag after each edit. Without Supabase keys they return the seed content.

const empty = { fr: "", en: "" };

async function loadSettingsRecord(): Promise<SiteSettingsRecord> {
  const supabase = getPublicClient();
  if (!supabase) return seedSettings;

  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Loading settings failed: ${error.message}`);
  if (!data) return seedSettings;

  return {
    companyName: data.company_name ?? seedSettings.companyName,
    foundedYear: data.founded_year ?? seedSettings.foundedYear,
    phone: data.phone ?? seedSettings.phone,
    whatsapp: data.whatsapp ?? seedSettings.whatsapp,
    email: data.email ?? seedSettings.email,
    notificationEmail: data.notification_email ?? null,
    address: data.address ?? seedSettings.address,
    hours: data.hours ?? seedSettings.hours,
    logoUrl: data.logo_url,
    logoDarkUrl: data.logo_dark_url,
    heroImageUrl: data.hero_image_url ?? seedSettings.heroImageUrl,
    heroImageAlt: data.hero_image_alt ?? seedSettings.heroImageAlt,
    // Columns added by migration 0003; absent until it runs.
    legalForm: data.legal_form ?? seedSettings.legalForm,
    taxId: data.tax_id ?? null,
    publicationDirector: data.publication_director ?? null,
    legalAddress: data.legal_address?.fr || data.legal_address?.en ? data.legal_address : null,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");

  const record = await loadSettingsRecord();
  // Computed here, never stored: the company's age moves on by itself each year.
  const currentYear = new Date().getFullYear();
  return { ...record, currentYear, yearsActive: currentYear - record.foundedYear };
}

/** Text edited in the admin ("Textes du site") for one language, or null. */
export async function getTextOverrides(locale: string): Promise<unknown> {
  "use cache";
  cacheTag("texts");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("site_content").select("content").eq("locale", locale).maybeSingle();
  if (error) throw new Error(`Loading site texts failed: ${error.message}`);
  return data?.content ?? null;
}

export async function getPartners(): Promise<Partner[]> {
  "use cache";
  cacheTag("partners");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return seedPartners;

  const { data, error } = await supabase
    .from("partners")
    .select("id, name, logo_url, website_url, kind, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`Loading partners failed: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    kind: row.kind,
    sortOrder: row.sort_order,
  }));
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return seedCategories;

  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw new Error(`Loading categories failed: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    name: row.name,
    description: row.description ?? empty,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return seedProducts;

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(slug)")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`Loading products failed: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    categorySlug: row.category?.slug ?? null,
    name: row.name,
    summary: row.summary ?? empty,
    description: row.description ?? empty,
    specs: row.specs ?? [],
    imageUrls: row.image_urls ?? [],
    datasheetUrl: row.datasheet_url,
    stockStatus: row.stock_status,
    leadTime: row.lead_time?.fr || row.lead_time?.en ? row.lead_time : null,
    preorderEnabled: row.preorder_enabled,
    featured: row.featured,
    sortOrder: row.sort_order,
  }));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag("services");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return seedServices;

  const { data, error } = await supabase.from("services").select("*").eq("active", true).order("sort_order");
  if (error) throw new Error(`Loading services failed: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary ?? empty,
    description: row.description ?? empty,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("hours");

  const supabase = getPublicClient();
  if (!supabase) return seedProjects;

  const { data, error } = await supabase.from("projects").select("*").eq("active", true).order("sort_order");
  if (error) throw new Error(`Loading projects failed: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    client: row.client,
    title: row.title,
    summary: row.summary ?? empty,
    imageUrl: row.image_url,
    year: row.year,
    sortOrder: row.sort_order,
  }));
}
