import type { Metadata } from "next";
import { getBilingualAlternates } from "@/lib/seo/canonical";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemsSection } from "@/components/landing/problems-section";
import { SolutionsSection } from "@/components/landing/solutions-section";
import { ServiceLinksSection } from "@/components/landing/service-links-section";
import { UseCasesSection } from "@/components/landing/use-cases-section";
import { ProcessSection } from "@/components/landing/process-section";
import { TrustSection } from "@/components/landing/trust-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export const metadata: Metadata = {
  title: {
    absolute: "Arkanum — Software a Medida y Automatización para Empresas",
  },
  description:
    "Desarrollamos sistemas web, apps móviles e integraciones a medida para reemplazar planillas, automatizar procesos y ordenar la operación de tu empresa.",
  alternates: {
    languages: getBilingualAlternates("/", "/pt-BR"),
  },
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProblemsSection />
        <SolutionsSection />
        <ServiceLinksSection />
        <UseCasesSection />
        <ProcessSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
