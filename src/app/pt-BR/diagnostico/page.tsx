import type { Metadata } from "next";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { PremiumCard } from "@/components/public/premium-card";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

export const metadata: Metadata = {
  title: "Diagnóstico de processos e software sob medida | Arkanum",
  description:
    "Conte qual processo você quer organizar, automatizar ou integrar. Avaliamos se uma solução digital sob medida faz sentido para a sua empresa.",
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/diagnostico"),
    languages: getBilingualAlternates("/diagnostico", "/pt-BR/diagnostico"),
  },
};

const examples = [
  "Dashboard de gestão",
  "Sistema web interno",
  "App móvel para equipes em campo",
  "Integração entre sistemas",
  "Automação de processos",
  "Software + hardware / sensores",
  "Plataforma operacional B2B",
];

const nextSteps = [
  "Revisamos sua operação e o problema principal.",
  "Identificamos se convém software, automação, IA ou integração.",
  "Propomos um primeiro escopo possível, sem vender um template fechado.",
];

const trustPoints = [
  "Não forçamos IA se ela não agrega valor real ao processo.",
  "Você pode começar com um módulo pequeno e crescer com o tempo.",
  "Primeiro entendemos sua operação. Depois projetamos.",
  "A solução é definida conforme processo, equipe e restrições reais.",
];

export default function PtBRDiagnosticoPage() {
  return (
    <>
      <SiteHeader locale="pt-BR" />
      <main className="relative min-h-screen overflow-hidden px-6 py-16">
        <BlueprintGridBackground />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <SectionEyebrow>Diagnóstico inicial sem custo</SectionEyebrow>

            <GradientTitle as="h1" className="mb-4 text-3xl font-semibold leading-snug">
              Conte qual processo você quer organizar, automatizar ou conectar.
            </GradientTitle>

            <p className="mb-6 text-base leading-relaxed text-slate-400">
              Avaliamos se convém resolver com software sob medida, uma plataforma operacional,
              uma integração ou uma automação. Se não fizer sentido construir algo, também
              te dizemos.
            </p>

            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <span
                  key={ex}
                  className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            <div>
              <DiagnosticForm locale="pt-BR" redirectTo="/pt-BR/obrigado" />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <PremiumCard>
                <h2 className="mb-4 text-sm font-semibold text-slate-100">
                  O que acontece depois
                </h2>
                <ol className="space-y-4">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs font-semibold text-cyan-400">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-400">{step}</p>
                    </li>
                  ))}
                </ol>
              </PremiumCard>

              <PremiumCard>
                <h2 className="mb-4 text-sm font-semibold text-slate-100">
                  Como trabalhamos
                </h2>
                <ul className="space-y-3">
                  {trustPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      <p className="text-sm leading-relaxed text-slate-400">{point}</p>
                    </li>
                  ))}
                </ul>
              </PremiumCard>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
