import type { Metadata } from "next";
import { getBilingualAlternates } from "@/lib/seo/canonical";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { PremiumCard } from "@/components/public/premium-card";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

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

const nextSteps = [
  "Revisamos tu operación y el problema principal.",
  "Identificamos si conviene software, automatización, IA o integración.",
  "Te proponemos un primer alcance posible, sin vender una plantilla cerrada.",
];

const trustPoints = [
  "No se fuerza IA si no aporta valor real al proceso.",
  "Podés empezar con un módulo pequeño y crecer con el tiempo.",
  "Primero entendemos tu operación. Después diseñamos.",
  "La solución se define según proceso, equipo y restricciones reales.",
];

export default function DiagnosticoPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen overflow-hidden px-6 py-16">
        <BlueprintGridBackground />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-10 max-w-2xl">
            <SectionEyebrow>Diagnóstico inicial sin cargo</SectionEyebrow>

            <GradientTitle as="h1" className="mb-4 text-3xl font-semibold leading-snug">
              Contanos qué proceso querés ordenar, automatizar o conectar.
            </GradientTitle>

            <p className="mb-6 text-base leading-relaxed text-slate-400">
              Revisamos si conviene resolverlo con software a medida, una plataforma operativa,
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

          <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
            <div>
              <DiagnosticForm />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              <PremiumCard>
                <h2 className="mb-4 text-sm font-semibold text-slate-100">
                  Qué pasa después
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
                  Cómo trabajamos
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
      <SiteFooter />
    </>
  );
}
