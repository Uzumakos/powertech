import { Suspense } from "react";
import { signOut } from "@/lib/admin/actions";
import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";

function PageSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse">
      <div className="h-9 w-64 rounded-lg bg-line" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-line" />
      <div className="mt-8 h-72 rounded-[var(--radius-card)] bg-line" />
    </div>
  );
}

/**
 * Static shell (navigation) around every admin page. Pages read the session,
 * so they render inside this Suspense boundary at request time.
 */
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:flex">
      <Suspense fallback={<AdminNavView signOut={signOut} pathname={null} />}>
        <AdminNav signOut={signOut} />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
