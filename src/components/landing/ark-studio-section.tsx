import { Section } from "@/components/ui/section";
import { PremiumCard } from "@/components/public/premium-card";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";

export function ArkStudioSection() {
  return (
    <Section id="como-trabajamos" className="relative overflow-hidden bg-slate-950">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-64 -top-32 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl">
        <SectionEyebrow>Cómo trabajamos</SectionEyebrow>

        <GradientTitle
          as="h2"
          className="mb-6 text-2xl font-semibold leading-snug reveal md:text-3xl"
        >
          Un sistema diseñado para tu operación. No una plantilla adaptada.
        </GradientTitle>

        <div className="space-y-4 text-base leading-relaxed text-slate-400 reveal reveal-1">
          <p>
            En{" "}
            <span className="font-medium text-slate-200">Arkanum Studio</span>{" "}
            diseñamos soluciones a medida combinando software, automatización, IA e integración
            física según el problema real de tu empresa.
          </p>
          <p>
            No toda solución requiere inteligencia artificial. Algunos sistemas deben sentirse
            inteligentes porque la arquitectura, la automatización y el diseño operativo están
            bien resueltos. La IA entra solo cuando agrega valor real: contexto, velocidad,
            razonamiento o ejecución dentro del proceso.
          </p>
          <p>
            Podés empezar con un módulo enfocado y evolucionar hacia una plataforma conectada,
            automatizada e inteligente.
          </p>
        </div>

        <PremiumCard className="mt-8 reveal reveal-2">
          <p className="text-sm italic leading-relaxed text-slate-300">
            &ldquo;Primero arquitectura. Luego automatización. Luego IA, cuando realmente incrementa
            el valor operativo.&rdquo;
          </p>
        </PremiumCard>
      </div>
    </Section>
  );
}
