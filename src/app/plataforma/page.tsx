import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PlatformHero } from "@/components/platform-landing/platform-hero";
import { PlatformProblem } from "@/components/platform-landing/platform-problem";
import { PlatformSolution } from "@/components/platform-landing/platform-solution";
import { PlatformModules } from "@/components/platform-landing/platform-modules";
import { PlatformIndustries } from "@/components/platform-landing/platform-industries";
import { PlatformWorkflow } from "@/components/platform-landing/platform-workflow";
import { PlatformCta } from "@/components/platform-landing/platform-cta";

export const metadata: Metadata = {
  title: "Plataformas operativas a medida para empresas B2B | Arkanum",
  description:
    "Diseñamos dashboards, sistemas web, apps, integraciones y automatizaciones para empresas que necesitan ordenar y escalar su operación.",
  openGraph: {
    url: `${siteConfig.url}/plataforma`,
    title: "Plataformas operativas a medida para empresas B2B | Arkanum",
    description:
      "Diseñamos dashboards, sistemas web, apps, integraciones y automatizaciones para empresas que necesitan ordenar y escalar su operación.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PlataformaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PlatformHero />
        <PlatformProblem />
        <PlatformSolution />
        <PlatformIndustries />
        <PlatformModules />
        <PlatformWorkflow />
        <PlatformCta />
      </main>
      <SiteFooter />
    </>
  );
}
