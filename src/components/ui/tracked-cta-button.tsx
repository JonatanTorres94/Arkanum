"use client";

import { Button } from "@/components/ui/button";
import {
  trackCtaDiagnosticClick,
  trackHeaderCtaClick,
  trackIntentPageCta,
  type DiagnosticCtaLocation,
  type Locale,
  type ServiceSlug,
} from "@/lib/analytics/track";
import type { ComponentProps } from "react";

type BaseProps = Omit<ComponentProps<typeof Button>, "href" | "onClick">;

export function HomeCtaButton({
  location,
  children,
  ...props
}: BaseProps & { location: DiagnosticCtaLocation }) {
  return (
    <Button href="/diagnostico" onClick={() => trackCtaDiagnosticClick(location)} {...props}>
      {children}
    </Button>
  );
}

export function HeaderCtaButton({
  locale,
  href,
  children,
  ...props
}: BaseProps & { locale: Locale; href: string }) {
  return (
    <Button href={href} onClick={() => trackHeaderCtaClick(locale)} {...props}>
      {children}
    </Button>
  );
}

export function PtBRCtaButton({
  location,
  children,
  ...props
}: BaseProps & { location: DiagnosticCtaLocation }) {
  return (
    <Button
      href="/pt-BR/diagnostico"
      onClick={() => trackCtaDiagnosticClick(location)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function ServicePageCtaButton({
  page,
  children,
  ...props
}: BaseProps & { page: ServiceSlug }) {
  return (
    <Button href="/diagnostico" onClick={() => trackIntentPageCta(page)} {...props}>
      {children}
    </Button>
  );
}
