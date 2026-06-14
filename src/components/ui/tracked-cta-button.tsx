"use client";

import { Button } from "@/components/ui/button";
import {
  trackCtaDiagnosticClick,
  trackIntentPageCta,
  type DiagnosticCtaLocation,
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
