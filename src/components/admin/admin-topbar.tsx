"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/config/admin-nav";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { signOutAction } from "@/server/actions/auth.action";

export function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-admin-border bg-admin-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/admin/leads" className="text-sm font-semibold text-admin-text">
          Arkanum
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir navegación"
          aria-expanded={open}
          className="rounded-lg border border-admin-border-strong px-3 py-1.5 text-sm text-admin-text-secondary"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open && (
        <div className="border-t border-admin-border bg-admin-surface px-4 py-3">
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    active ? "bg-admin-accent/10 text-admin-accent" : "text-admin-text-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-admin-border pt-3">
            <ThemeToggle />
            <form action={signOutAction}>
              <button type="submit" className="text-xs text-admin-text-muted">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
