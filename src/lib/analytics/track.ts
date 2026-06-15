import { sendGAEvent } from "@next/third-parties/google";

export type DiagnosticCtaLocation = "hero" | "final_cta";
export type ServiceSlug =
  | "software-a-medida"
  | "automatizacion-de-procesos"
  | "sistemas-para-distribuidoras"
  | "software-para-logistica"
  | "sistemas-de-stock"
  | "automatizacion-con-whatsapp";

export function trackCtaDiagnosticClick(location: DiagnosticCtaLocation): void {
  sendGAEvent("event", "cta_diagnostic_click", { location });
}

export function trackDiagnosticSubmitSuccess(): void {
  sendGAEvent("event", "diagnostic_submit_success", {});
}

export function trackDiagnosticSubmitError(): void {
  sendGAEvent("event", "diagnostic_submit_error", {});
}

export function trackServiceLinkClick(service: ServiceSlug): void {
  sendGAEvent("event", "home_service_link_click", { service });
}

export function trackIntentPageCta(page: ServiceSlug): void {
  sendGAEvent("event", "intent_page_cta_click", { page });
}
