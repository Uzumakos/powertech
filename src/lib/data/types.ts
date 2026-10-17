import type { Localized } from "@/i18n/config";

export type SiteSettingsRecord = {
  companyName: string;
  foundedYear: number;
  phone: string;
  whatsapp: string;
  email: string;
  /** Inbox that receives new quote requests and pre-orders. */
  notificationEmail: string | null;
  address: Localized;
  hours: Localized;
  /** Logo for light backgrounds (header). Falls back to the built-in wordmark. */
  logoUrl: string | null;
  /** Logo for dark backgrounds (footer). Falls back to the built-in wordmark. */
  logoDarkUrl: string | null;
  heroImageUrl: string;
  heroImageAlt: Localized;
  /** Legal notice details; empty values show as "to complete" on the page. */
  legalForm: string | null;
  taxId: string | null;
  publicationDirector: string | null;
  legalAddress: Localized | null;
};

export type SiteSettings = SiteSettingsRecord & {
  currentYear: number;
  yearsActive: number;
};

export type PartnerKind = "client" | "brand";

export type Partner = {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  kind: PartnerKind;
  sortOrder: number;
};

export type CategoryKind = "ups" | "solar" | "battery" | "generator" | "component";

export type Category = {
  id: string;
  slug: string;
  kind: CategoryKind;
  name: Localized;
  description: Localized;
  imageUrl: string | null;
  sortOrder: number;
};

/** A number stays a plain string ("120"); words are localized. */
export type SpecText = string | Localized;

export type Spec = {
  key: string;
  label: Localized;
  value: SpecText;
  unit?: SpecText;
};

export type StockStatus = "in_stock" | "on_order" | "preorder";

export type Product = {
  id: string;
  slug: string;
  categorySlug: string | null;
  name: Localized;
  summary: Localized;
  description: Localized;
  specs: Spec[];
  imageUrls: string[];
  datasheetUrl: string | null;
  stockStatus: StockStatus;
  leadTime: Localized | null;
  preorderEnabled: boolean;
  featured: boolean;
  sortOrder: number;
};

export type Service = {
  id: string;
  slug: string;
  name: Localized;
  summary: Localized;
  description: Localized;
  imageUrl: string | null;
  sortOrder: number;
};

export type Project = {
  id: string;
  slug: string;
  client: string;
  title: Localized;
  summary: Localized;
  imageUrl: string | null;
  year: number | null;
  sortOrder: number;
};
