// Pushes the placeholder content from src/lib/data/seed.ts into Supabase.
// Usage: npm run db:seed   (reads .env.local; needs SUPABASE_SERVICE_ROLE_KEY)
// Only fills empty tables, so it never overwrites edits made in the admin.
import { createClient } from "@supabase/supabase-js";
import {
  seedCategories,
  seedPartners,
  seedProducts,
  seedProjects,
  seedServices,
  seedSettings,
} from "../src/lib/data/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

async function isEmpty(table: string): Promise<boolean> {
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return count === 0;
}

async function seed(table: string, rows: Record<string, unknown>[]) {
  if (!(await isEmpty(table))) {
    console.log(`${table}: already filled, skipped`);
    return;
  }
  const { error } = await db.from(table).insert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: seeded ${rows.length}`);
}

async function main() {
  await seed("settings", [
    {
      id: 1,
      company_name: seedSettings.companyName,
      founded_year: seedSettings.foundedYear,
      phone: seedSettings.phone,
      whatsapp: seedSettings.whatsapp,
      email: seedSettings.email,
      address: seedSettings.address,
      hours: seedSettings.hours,
      logo_url: seedSettings.logoUrl,
      logo_dark_url: seedSettings.logoDarkUrl,
      hero_image_url: seedSettings.heroImageUrl,
      hero_image_alt: seedSettings.heroImageAlt,
      legal_form: seedSettings.legalForm,
    },
  ]);

  await seed(
    "partners",
    seedPartners.map((partner) => ({
      name: partner.name,
      logo_url: partner.logoUrl,
      website_url: partner.websiteUrl,
      kind: partner.kind,
      sort_order: partner.sortOrder,
    })),
  );

  await seed(
    "categories",
    seedCategories.map((category) => ({
      slug: category.slug,
      kind: category.kind,
      name: category.name,
      description: category.description,
      image_url: category.imageUrl,
      sort_order: category.sortOrder,
    })),
  );

  // Products reference categories by id, so look the ids up by slug.
  const { data: categories, error } = await db.from("categories").select("id, slug");
  if (error) throw new Error(`categories: ${error.message}`);
  const categoryId = new Map(categories.map((row) => [row.slug, row.id]));

  await seed(
    "products",
    seedProducts.map((product) => ({
      slug: product.slug,
      category_id: product.categorySlug ? categoryId.get(product.categorySlug) ?? null : null,
      name: product.name,
      summary: product.summary,
      description: product.description,
      specs: product.specs,
      image_urls: product.imageUrls,
      datasheet_url: product.datasheetUrl,
      stock_status: product.stockStatus,
      lead_time: product.leadTime ?? {},
      preorder_enabled: product.preorderEnabled,
      featured: product.featured,
      sort_order: product.sortOrder,
    })),
  );

  await seed(
    "services",
    seedServices.map((service) => ({
      slug: service.slug,
      name: service.name,
      summary: service.summary,
      description: service.description,
      image_url: service.imageUrl,
      sort_order: service.sortOrder,
    })),
  );

  await seed(
    "projects",
    seedProjects.map((project) => ({
      slug: project.slug,
      client: project.client,
      title: project.title,
      summary: project.summary,
      image_url: project.imageUrl,
      year: project.year,
      sort_order: project.sortOrder,
    })),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
