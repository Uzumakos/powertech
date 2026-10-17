"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Boxes,
  ClipboardList,
  ExternalLink,
  FolderTree,
  Handshake,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Trophy,
  Type,
  Wrench,
  X,
} from "lucide-react";
import { BoltMark } from "@/components/site/logo";

const groups = [
  {
    title: "Demandes",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/admin/devis", label: "Demandes de devis", icon: ClipboardList },
      { href: "/admin/precommandes", label: "Précommandes", icon: PackageCheck },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { href: "/admin/produits", label: "Produits", icon: Boxes },
      { href: "/admin/categories", label: "Catégories", icon: FolderTree },
      { href: "/admin/services", label: "Services", icon: Wrench },
    ],
  },
  {
    title: "Contenu du site",
    items: [
      { href: "/admin/textes", label: "Textes du site", icon: Type },
      { href: "/admin/realisations", label: "Réalisations", icon: Trophy },
      { href: "/admin/partenaires", label: "Partenaires", icon: Handshake },
      { href: "/admin/medias", label: "Médiathèque", icon: Images },
      { href: "/admin/parametres", label: "Paramètres", icon: Settings },
    ],
  },
];

type NavProps = { signOut: () => Promise<void> };

/** Navigation with the current page highlighted (reads the URL). */
export function AdminNav(props: NavProps) {
  return <AdminNavView {...props} pathname={usePathname()} />;
}

/**
 * Same navigation without a highlighted page: the Suspense fallback while
 * the URL is not known yet (dynamic admin routes).
 */
export function AdminNavView({ signOut, pathname }: NavProps & { pathname: string | null }) {
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath !== null && menuPath === (pathname ?? "");

  const isActive = (href: string) => (pathname === null ? false : href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Administration" className="grid gap-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 text-xs font-semibold text-white/40">{group.title}</p>
          <ul className="mt-2 grid gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={() => setMenuPath(null)}
                  className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] text-white/75 transition-colors hover:bg-white/5 hover:text-white aria-[current=page]:bg-white/10 aria-[current=page]:font-semibold aria-[current=page]:text-white"
                >
                  <Icon aria-hidden className="size-[1.125rem] shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="grid gap-0.5 border-t border-night-line pt-4">
        <a
          href="/fr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-[0.9375rem] text-white/75 hover:bg-white/5 hover:text-white"
        >
          <ExternalLink aria-hidden className="size-[1.125rem]" />
          Voir le site
        </a>
        <form action={signOut}>
          <button
            type="submit"
            className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[0.9375rem] text-white/75 hover:bg-white/5 hover:text-white"
          >
            <LogOut aria-hidden className="size-[1.125rem]" />
            Se déconnecter
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-night px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5 font-bold text-white">
          <BoltMark />
          Admin
        </Link>
        <button
          type="button"
          onClick={() => setMenuPath(open ? null : pathname ?? "")}
          aria-expanded={open}
          aria-controls="admin-menu"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="grid size-11 place-items-center rounded-lg text-white"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      {open && (
        <div id="admin-menu" className="on-dark fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto bg-night p-4 lg:hidden">
          {nav}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="on-dark sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto bg-night p-4 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2 pt-2 text-white">
          <BoltMark />
          <span className="flex flex-col leading-none">
            <span className="wide font-extrabold">Powertech</span>
            <span className="mt-1 text-xs text-white/50">Administration</span>
          </span>
        </Link>
        {nav}
      </aside>
    </>
  );
}
