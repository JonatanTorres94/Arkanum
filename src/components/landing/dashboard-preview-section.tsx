import Link from "next/link";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { MiniDashboardPreview } from "@/components/public/mini-dashboard-preview";

export function DashboardPreviewSection() {
  return (
    <section
      id="plataforma-preview"
      className="relative overflow-hidden bg-slate-950 px-6 py-20"
    >
      {/* Ambient glow behind the dashboard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl reveal">
          <SectionEyebrow>El producto en acción</SectionEyebrow>

          <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
            Así se ve una plataforma operativa Arkanum.
          </GradientTitle>

          <p className="text-base leading-relaxed text-slate-400">
            Procesos con estados reales, métricas del negocio, alertas de atención y automatizaciones
            conectadas. Seleccioná un módulo del sidebar para explorar cada área.
          </p>
        </div>

        <MiniDashboardPreview />

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-600">
            Datos de ejemplo. Cada plataforma se construye desde el proceso real de cada cliente.
          </p>
          <Link
            href="/plataforma"
            className="text-xs text-slate-500 transition-colors hover:text-cyan-400"
          >
            Ver qué es una plataforma operativa →
          </Link>
        </div>
      </div>
    </section>
  );
}
