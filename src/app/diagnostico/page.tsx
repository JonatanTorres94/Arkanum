import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DiagnosticForm } from "@/features/leads/presentation/diagnostic-form";

export const metadata: Metadata = {
  title: "Diagnóstico inicial",
  description:
    "Contanos qué proceso querés mejorar. Analizamos tu caso y te indicamos si una solución digital a medida tiene sentido.",
};

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
              Contanos tu proceso. Nosotros te decimos si tiene solución.
            </h1>
            <p className="text-base leading-relaxed text-slate-400">
              Analizamos tu operación actual y te indicamos si una solución digital a medida puede
              ayudarte a reducir carga manual, ordenar información o conectar sistemas. Si no tiene
              sentido, también te lo vamos a decir.
            </p>
          </div>

          <DiagnosticForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
