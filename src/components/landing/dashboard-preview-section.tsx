import { Section } from "@/components/ui/section";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { MiniDashboardPreview } from "@/components/public/mini-dashboard-preview";

export function DashboardPreviewSection() {
  return (
    <Section id="plataforma-preview" className="bg-slate-950">
      <div className="mb-10 max-w-2xl reveal">
        <SectionEyebrow>El producto en acción</SectionEyebrow>

        <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
          Así se ve una plataforma operativa Arkanum.
        </GradientTitle>

        <p className="text-base leading-relaxed text-slate-400">
          Procesos con estados reales, métricas del negocio, alertas de atención y automatizaciones
          conectadas. No una plantilla genérica: una operación que refleja cómo trabaja tu empresa.
        </p>
      </div>

      <MiniDashboardPreview />

      <p className="mt-5 text-xs text-slate-600">
        Datos de ejemplo. Cada plataforma se construye desde el proceso real de cada cliente.
      </p>
    </Section>
  );
}
