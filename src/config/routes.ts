// Central registry of public, indexable routes.
// Used by sitemap.ts and any future breadcrumb or link validation tooling.
// Admin routes, /gracias, and noindex pages are intentionally excluded.

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export type PublicRoute = {
  readonly path: string;
  readonly priority: number;
  readonly changeFrequency: ChangeFrequency;
};

export const publicRoutes: readonly PublicRoute[] = [
  { path: "/",                              priority: 1.0, changeFrequency: "monthly" },
  { path: "/plataforma",                    priority: 0.9, changeFrequency: "monthly" },
  { path: "/software-a-medida",             priority: 0.9, changeFrequency: "monthly" },
  { path: "/automatizacion-de-procesos",    priority: 0.9, changeFrequency: "monthly" },
  { path: "/sistemas-para-distribuidoras",  priority: 0.8, changeFrequency: "monthly" },
  { path: "/software-para-logistica",       priority: 0.8, changeFrequency: "monthly" },
  { path: "/sistemas-de-stock",             priority: 0.8, changeFrequency: "monthly" },
  { path: "/automatizacion-con-whatsapp",   priority: 0.8, changeFrequency: "monthly" },
  { path: "/diagnostico",                   priority: 0.8, changeFrequency: "monthly" },
  { path: "/pt-BR",                         priority: 0.9, changeFrequency: "monthly" },
  { path: "/pt-BR/software-sob-medida",     priority: 0.9, changeFrequency: "monthly" },
  { path: "/pt-BR/automacao-de-processos",  priority: 0.9, changeFrequency: "monthly" },
  { path: "/pt-BR/sistemas-para-distribuidoras", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pt-BR/software-para-logistica", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pt-BR/sistemas-de-estoque",     priority: 0.8, changeFrequency: "monthly" },
  { path: "/pt-BR/automacao-com-whatsapp",  priority: 0.8, changeFrequency: "monthly" },
  { path: "/pt-BR/diagnostico",             priority: 0.7, changeFrequency: "monthly" },
];
