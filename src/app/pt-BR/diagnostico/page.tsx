import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Diagnóstico inicial",
  description:
    "Conte o que você quer melhorar. Analisamos seu caso e indicamos se uma solução digital sob medida faz sentido.",
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/diagnostico"),
    languages: getBilingualAlternates("/diagnostico", "/pt-BR/diagnostico"),
  },
};

export default function PtBRDiagnosticoPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Diagnóstico inicial sem custo
            </p>
            <h1 className="mb-4 text-3xl font-semibold leading-snug text-slate-50">
              Conte seu processo. Nós dizemos se tem solução.
            </h1>
            <p className="text-base leading-relaxed text-slate-400">
              Analisamos sua operação atual e indicamos se uma solução digital sob medida pode
              ajudar a reduzir carga manual, organizar informações ou conectar sistemas. Se não
              fizer sentido, também te dizemos.
            </p>
          </div>

          {/* DiagnosticForm reused — form labels remain in Spanish for this pilot.
              Full pt-BR form translation is deferred to the next i18n release. */}
          <DiagnosticForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
