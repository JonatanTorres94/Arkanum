import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { siteConfig } from "@/config/site";

const navLinks = [
  { label: "Soluciones", href: "#soluciones" },
  { label: "Método", href: "#metodo" },
  { label: "Diagnóstico", href: "#diagnostico" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-slate-50 hover:text-cyan-400 transition-colors"
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Button href="/diagnostico" variant="primary" className="text-xs px-4 py-2">
            Diagnosticar mi proceso
          </Button>
        </div>
      </div>
    </header>
  );
}
