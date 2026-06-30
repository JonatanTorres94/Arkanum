import { Section } from "@/components/ui/section";
import { PremiumCard } from "@/components/public/premium-card";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";

const evolution = [
  {
    pillar: "Arkanum Core",
    label: "La base",
    tagline: "Centralizar la operación",
    description:
      "Plataforma operativa para registrar procesos, gestionar datos, organizar equipos y tomar decisiones desde un solo lugar.",
    value: "Ver y controlar la operación sin depender de planillas o memoria humana.",
    accent: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    pillar: "Arkanum Flow",
    label: "+ Automatización",
    tagline: "Conectar y automatizar",
    description:
      "Automatización e integración entre áreas, sistemas, APIs y tareas repetitivas. El sistema trabaja mientras el equipo se enfoca en lo que importa.",
    value: "Hacer que los sistemas trabajen entre sí sin carga manual.",
    accent: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  {
    pillar: "Arkanum Agents",
    label: "+ Inteligencia operativa",
    tagline: "IA conectada al contexto real",
    description:
      "Agentes IA conectados a los datos, reglas y procesos reales del sistema. No un chatbot: un agente que conoce la operación y puede actuar dentro de ella.",
    value: "Pedir acciones inteligentes a una IA que entiende tu negocio.",
    accent: "text-violet-400",
    dot: "bg-violet-400",
  },
  {
    pillar: "Arkanum Hardware Layer",
    label: "+ El mundo físico",
    tagline: "Cuando el proceso no termina en pantalla",
    description:
      "Software conectado a sensores, dispositivos, terminales y procesos físicos. La plataforma alcanza el mundo real cuando el proceso lo requiere.",
    value: "Conectar el mundo físico con el sistema operativo de la empresa.",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
  },
] as const;

export function PlatformEvolution() {
  return (
    <Section id="evolucion" className="bg-slate-950">
      <div className="mb-12">
        <SectionEyebrow>Evolución de la plataforma</SectionEyebrow>

        <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
          Empezá con lo que necesitás. Evolucioná cuando el proceso lo pida.
        </GradientTitle>

        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          No es un catálogo de tiers. Arkanum Studio diseña la combinación correcta para cada
          empresa. Estas son las capacidades que pueden sumarse a medida que el sistema crece.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {evolution.map((step) => (
          <PremiumCard key={step.pillar} className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-xs text-slate-600">{step.label}</p>
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${step.dot}`} />
                <p
                  className={`text-xs font-semibold uppercase tracking-widest ${step.accent}`}
                >
                  {step.pillar}
                </p>
              </div>
              <p className="mb-1 text-sm font-medium text-slate-200">{step.tagline}</p>
              <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>

            <div className="mt-auto border-t border-slate-700/40 pt-4">
              <p className="text-xs leading-relaxed text-slate-500">
                <span className="font-medium text-slate-400">Para el cliente: </span>
                {step.value}
              </p>
            </div>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
