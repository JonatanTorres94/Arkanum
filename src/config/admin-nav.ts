// Central nav registry for the admin shell. `futureRoles` is metadata only —
// no RBAC is enforced yet (v0.37.0/v0.38.0). It exists so role-aware
// filtering can be added later without touching every component that
// renders navigation.
export type AdminNavDomain = "crm" | "clients" | "delivery" | "support" | "operations" | "system";
export type AdminRole = "admin" | "sales" | "delivery" | "support";

export type AdminNavItem = {
  label: string;
  href: string;
  domain: AdminNavDomain;
  futureRoles?: AdminRole[];
};

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: "Atención",  href: "/admin/attention", domain: "operations", futureRoles: ["admin", "support", "delivery"] },
  { label: "Leads",     href: "/admin/leads",     domain: "crm",        futureRoles: ["admin", "sales"] },
  { label: "Clientes",  href: "/admin/clients",   domain: "clients",    futureRoles: ["admin", "sales", "delivery"] },
  { label: "Proyectos", href: "/admin/projects",  domain: "delivery",   futureRoles: ["admin", "delivery"] },
  { label: "Soporte",   href: "/admin/support",   domain: "support",    futureRoles: ["admin", "support", "delivery"] },
] as const;

export const ADMIN_NAV_DOMAIN_LABELS: Record<AdminNavDomain, string> = {
  crm:        "CRM",
  clients:    "Clientes",
  delivery:   "Delivery",
  support:    "Soporte",
  operations: "Operaciones",
  system:     "Sistema",
};

export const ADMIN_NAV_DOMAIN_ORDER: readonly AdminNavDomain[] = ["operations", "crm", "clients", "delivery", "support"];
