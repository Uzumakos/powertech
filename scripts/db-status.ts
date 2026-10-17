// Quick health check of the Supabase project: row counts per table, settings
// and number of admin accounts. Prints counts only, never data or keys.
// Usage: npm run db:status
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });
const tables = [
  "settings",
  "site_content",
  "partners",
  "categories",
  "products",
  "services",
  "projects",
  "media",
  "quote_requests",
  "quote_items",
  "preorders",
  "admins",
];

let problems = 0;
for (const table of tables) {
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
  if (error) problems++;
  console.log(`${table.padEnd(16)} ${error ? `ERROR ${error.message}` : count}`);
}

const { data: settings } = await db.from("settings").select("company_name, founded_year").maybeSingle();
console.log(`\nsettings         ${settings ? `${settings.company_name}, founded ${settings.founded_year}` : "no row (run npm run db:seed)"}`);

// Each migration adds columns; probing one per migration shows what has been run.
const migrations: [string, string, string][] = [
  ["0002_admin_content.sql", "settings", "notification_email"],
  ["0003_legal.sql", "settings", "tax_id"],
];
for (const [file, table, column] of migrations) {
  const { error } = await db.from(table).select(column).limit(1);
  if (error) problems++;
  console.log(`${file.padEnd(24)} ${error ? "NOT RUN — run it in the Supabase SQL editor" : "ok"}`);
}

const { data: users, error: usersError } = await db.auth.admin.listUsers();
console.log(`auth users       ${usersError ? `ERROR ${usersError.message}` : users.users.length}`);

process.exit(problems ? 1 : 0);
