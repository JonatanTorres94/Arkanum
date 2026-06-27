import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

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

export default function PtBRDiagnosticoPage() {
  return (
    <>
      <SiteHeader locale="pt-BR" />
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Diagnóstico inicial sem custo
            </p>
            <h1 className="mb-4 text-3xl font-semibold leading-snug text-slate-50">
              Conte qual processo você quer organizar, automatizar ou integrar.
            </h1>
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

          <DiagnosticForm locale="pt-BR" redirectTo="/pt-BR/obrigado" />
        </div>
      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
