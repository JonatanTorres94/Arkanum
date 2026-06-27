import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinksByLocale = {
  es: [
    { label: "Soluciones",                   href: "/#soluciones" },
    { label: "Plataformas",                  href: "/plataforma" },
    { label: "Método",                        href: "/#metodo" },
    { label: "Diagnóstico",                  href: "/diagnostico" },
    { label: "Software a medida",            href: "/software-a-medida" },
    { label: "Automatización de procesos",   href: "/automatizacion-de-procesos" },
  ],
  "pt-BR": [
    { label: "Soluções",                     href: "/pt-BR#solucoes" },
    { label: "Diagnóstico",                  href: "/pt-BR/diagnostico" },
    { label: "Software sob medida",          href: "/pt-BR/software-sob-medida" },
  ],
} as const;

const taglineByLocale = {
  es: "Desarrollamos sistemas web, apps móviles e integraciones a medida para automatizar y modernizar procesos empresariales.",
  "pt-BR": "Desenvolvemos sistemas web, apps mobile e integrações sob medida para automatizar e modernizar processos empresariais.",
} as const;

const copyrightByLocale = {
  es: "Soluciones digitales a medida.",
  "pt-BR": "Soluções digitais sob medida.",
} as const;

interface SiteFooterProps {
  locale?: "es" | "pt-BR";
}

export function SiteFooter({ locale = "es" }: SiteFooterProps) {
  const footerLinks = footerLinksByLocale[locale];

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <p className="mb-2 text-sm font-semibold text-slate-50">{siteConfig.name}</p>
            <p className="text-sm leading-relaxed text-slate-400">
              {taglineByLocale[locale]}
            </p>
          </div>

          <nav className="flex flex-wrap gap-6">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name}. {copyrightByLocale[locale]}
          </p>
        </div>
      </div>
    </footer>
  );
}
