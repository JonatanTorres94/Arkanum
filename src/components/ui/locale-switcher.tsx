"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ALTERNATE: Record<string, { href: string; label: string }> = {
  "/":                                    { href: "/pt-BR",                            label: "PT" },
  "/software-a-medida":                   { href: "/pt-BR/software-sob-medida",        label: "PT" },
  "/diagnostico":                         { href: "/pt-BR/diagnostico",                label: "PT" },
  "/automatizacion-de-procesos":          { href: "/pt-BR/automacao-de-processos",     label: "PT" },
  "/sistemas-para-distribuidoras":        { href: "/pt-BR/sistemas-para-distribuidoras", label: "PT" },
  "/software-para-logistica":             { href: "/pt-BR/software-para-logistica",    label: "PT" },
  "/sistemas-de-stock":                   { href: "/pt-BR/sistemas-de-estoque",        label: "PT" },
  "/automatizacion-con-whatsapp":         { href: "/pt-BR/automacao-com-whatsapp",     label: "PT" },
  "/pt-BR":                               { href: "/",                                 label: "ES" },
  "/pt-BR/software-sob-medida":           { href: "/software-a-medida",                label: "ES" },
  "/pt-BR/diagnostico":                   { href: "/diagnostico",                      label: "ES" },
  "/pt-BR/obrigado":                      { href: "/gracias",                          label: "ES" },
  "/pt-BR/automacao-de-processos":        { href: "/automatizacion-de-procesos",       label: "ES" },
  "/pt-BR/sistemas-para-distribuidoras":  { href: "/sistemas-para-distribuidoras",     label: "ES" },
  "/pt-BR/software-para-logistica":       { href: "/software-para-logistica",          label: "ES" },
  "/pt-BR/sistemas-de-estoque":           { href: "/sistemas-de-stock",                label: "ES" },
  "/pt-BR/automacao-com-whatsapp":        { href: "/automatizacion-con-whatsapp",      label: "ES" },
};

export function LocaleSwitcher() {
  const pathname = usePathname();
  const alt = ALTERNATE[pathname];
  if (!alt) return null;

  return (
    <Link
      href={alt.href}
      className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
      aria-label={`Cambiar idioma / Trocar idioma — ${alt.label}`}
    >
      {alt.label}
    </Link>
  );
}
