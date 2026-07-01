import { sendGAEvent } from "@next/third-parties/google";

export type DiagnosticCtaLocation =
  | "hero"
  | "final_cta"
  | "header"
  | "pt_br_hero"
  | "pt_br_final_cta";

export type ServiceSlug =
  | "software-a-medida"
  | "automatizacion-de-procesos"
  | "sistemas-para-distribuidoras"
  | "software-para-logistica"
  | "sistemas-de-stock"
  | "automatizacion-con-whatsapp";

export type Locale = "es" | "pt-BR";

// ─── CTA clicks ───────────────────────────────────────────────────────────

export function trackCtaDiagnosticClick(location: DiagnosticCtaLocation): void {
  sendGAEvent("event", "cta_diagnostic_click", { location });
}

export function trackServiceLinkClick(service: ServiceSlug): void {
  sendGAEvent("event", "home_service_link_click", { service });
}

export function trackIntentPageCta(page: ServiceSlug): void {
  sendGAEvent("event", "intent_page_cta_click", { page });
}

// ─── Navigation ───────────────────────────────────────────────────────────

export function trackNavClick(label: string, locale: Locale): void {
  sendGAEvent("event", "nav_click", { label, locale });
}

export function trackHeaderCtaClick(locale: Locale): void {
  sendGAEvent("event", "header_cta_click", { locale });
}

// ─── Dashboard demo ───────────────────────────────────────────────────────

export function trackDashboardModuleSwitch(moduleId: string): void {
  sendGAEvent("event", "dashboard_module_switch", { module_id: moduleId });
}

// ─── Diagnostic form ──────────────────────────────────────────────────────

export function trackDiagnosticSubmitSuccess(locale: Locale = "es"): void {
  sendGAEvent("event", "diagnostic_submit_success", { locale });
}

export function trackDiagnosticSubmitError(locale: Locale = "es"): void {
  sendGAEvent("event", "diagnostic_submit_error", { locale });
}

// ─── Bot / noise ──────────────────────────────────────────────────────────

export function trackBotHoneypotFilled(): void {
  sendGAEvent("event", "bot_honeypot_filled", {});
}
