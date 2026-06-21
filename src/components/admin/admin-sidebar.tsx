"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS, ADMIN_NAV_DOMAIN_LABELS, ADMIN_NAV_DOMAIN_ORDER } from "@/config/admin-nav";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { signOutAction } from "@/server/actions/auth.action";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface md:flex">
      <div className="px-5 py-5">
        <Link href="/admin/leads" className="text-base font-semibold text-admin-text">
          Arkanum
        </Link>
        <p className="mt-0.5 text-xs text-admin-text-muted">Panel interno</p>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {ADMIN_NAV_DOMAIN_ORDER.map((domain) => {
          const items = ADMIN_NAV_ITEMS.filter((item) => item.domain === domain);
          if (items.length === 0) return null;

          return (
            <div key={domain}>
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-widest text-admin-text-faint">
                {ADMIN_NAV_DOMAIN_LABELS[domain]}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-admin-accent/10 text-admin-accent"
                          : "text-admin-text-secondary hover:bg-admin-surface-hover hover:text-admin-text"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-admin-border px-5 py-4">
        <ThemeToggle />
        <form action={signOutAction}>
          <button
            type="submit"
            className="block text-xs text-admin-text-muted transition-colors hover:text-admin-text"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
