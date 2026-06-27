import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PlatformHero } from "@/components/platform-landing/platform-hero";
import { PlatformProblem } from "@/components/platform-landing/platform-problem";
import { PlatformSolution } from "@/components/platform-landing/platform-solution";
import { PlatformModules } from "@/components/platform-landing/platform-modules";
import { PlatformWorkflow } from "@/components/platform-landing/platform-workflow";
import { PlatformCta } from "@/components/platform-landing/platform-cta";

export const metadata: Metadata = {
  title: "Arkanum — CRM, Delivery y Support para operaciones B2B",
  description:
    "Centralizá clientes, proyectos, trabajo técnico y soporte en una plataforma operativa diseñada para empresas de servicios B2B.",
  openGraph: {
    url: `${siteConfig.url}/plataforma`,
    title: "Arkanum — CRM, Delivery y Support para operaciones B2B",
    description:
      "Centralizá clientes, proyectos, trabajo técnico y soporte en una plataforma operativa diseñada para empresas de servicios B2B.",
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
        <PlatformModules />
        <PlatformWorkflow />
        <PlatformCta />
      </main>
      <SiteFooter />
    </>
  );
}
