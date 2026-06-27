import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { siteConfig } from "@/config/site";

const navLinksByLocale = {
  es: [
    { label: "Soluciones",   href: "/#soluciones" },
    { label: "Plataformas",  href: "/plataforma" },
    { label: "Método",       href: "/#metodo" },
    { label: "Diagnóstico",  href: "/diagnostico" },
  ],
  "pt-BR": [
    { label: "Soluções", href: "/pt-BR#solucoes" },
    { label: "Diagnóstico", href: "/pt-BR/diagnostico" },
  ],
} as const;

const ctaByLocale = {
  es: { href: "/diagnostico", label: "Diagnosticar mi proceso" },
  "pt-BR": { href: "/pt-BR/diagnostico", label: "Diagnosticar meu processo" },
} as const;

const homeHrefByLocale = {
  es: "/",
  "pt-BR": "/pt-BR",
} as const;

interface SiteHeaderProps {
  locale?: "es" | "pt-BR";
}

export function SiteHeader({ locale = "es" }: SiteHeaderProps) {
  const navLinks = navLinksByLocale[locale];
  const cta = ctaByLocale[locale];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={homeHrefByLocale[locale]}
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
          <Button href={cta.href} variant="primary" className="text-xs px-4 py-2">
            {cta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
