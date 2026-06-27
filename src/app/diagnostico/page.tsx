import type { Metadata } from "next";
import { getBilingualAlternates } from "@/lib/seo/canonical";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";

export const metadata: Metadata = {
  title: "Diagnóstico de procesos y software a medida | Arkanum",
  description:
    "Contanos qué proceso querés ordenar, automatizar o integrar. Evaluamos si una solución digital a medida tiene sentido para tu empresa.",
  alternates: {
    languages: getBilingualAlternates("/diagnostico", "/pt-BR/diagnostico"),
  },
};

const examples = [
  "Dashboard de gestión",
  "Sistema web interno",
  "App móvil para equipos en campo",
  "Integración entre sistemas",
  "Automatización de procesos",
  "Software + hardware / sensores",
  "Plataforma operativa B2B",
];

export default function DiagnosticoPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Diagnóstico inicial sin cargo
            </p>
            <h1 className="mb-4 text-3xl font-semibold leading-snug text-slate-50">
              Contanos qué proceso querés ordenar, automatizar o integrar.
            </h1>
            <p className="mb-6 text-base leading-relaxed text-slate-400">
              Evaluamos si conviene resolverlo con software a medida, una plataforma operativa,
              una integración o una automatización. Si no tiene sentido construir algo, también
              te lo vamos a decir.
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

          <DiagnosticForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
