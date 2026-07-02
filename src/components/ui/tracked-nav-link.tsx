"use client";

import Link from "next/link";
import { trackNavClick, type Locale } from "@/lib/analytics/track";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link> & {
  trackLabel: string;
  locale: Locale;
};

export function TrackedNavLink({ trackLabel, locale, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackNavClick(trackLabel, locale);
        onClick?.(e);
      }}
    />
  );
}
