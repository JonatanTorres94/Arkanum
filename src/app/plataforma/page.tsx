import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PlatformHero } from "@/components/platform-landing/platform-hero";
import { PlatformProblem } from "@/components/platform-landing/platform-problem";
import { PlatformDefinition } from "@/components/platform-landing/platform-definition";
import { PlatformLayers } from "@/components/platform-landing/platform-layers";
import { PlatformEvolution } from "@/components/platform-landing/platform-evolution";
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
        <PlatformDefinition />
        <PlatformLayers />
        <PlatformEvolution />
        <PlatformIndustries />
        <PlatformWorkflow />
        <PlatformCta />
      </main>
      <SiteFooter />
    </>
  );
}
