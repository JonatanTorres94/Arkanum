import { Section } from "@/components/ui/section";
import { PremiumCard } from "@/components/public/premium-card";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";

const pillars = [
  {
    name: "Arkanum Core",
    explanation:
      "Plataformas operativas para centralizar procesos, datos, equipos y decisiones.",
    value: "Ver y controlar la operación desde un solo lugar.",
    accent: "text-cyan-400",
    dot: "bg-cyan-400",
  },
  {
    name: "Arkanum Flow",
    explanation:
      "Automatización e integración entre áreas, sistemas, APIs y tareas repetitivas.",
    value: "Hacer que los sistemas trabajen entre sí.",
    accent: "text-indigo-400",
    dot: "bg-indigo-400",
  },
  {
    name: "Arkanum Agents",
    explanation:
      "Agentes IA conectados a datos, reglas y operaciones reales de tu negocio.",
    value: "Pedir acciones inteligentes a una IA que entiende tu operación.",
    accent: "text-violet-400",
    dot: "bg-violet-400",
  },
  {
    name: "Arkanum Hardware Layer",
    explanation:
      "Software conectado a sensores, dispositivos, terminales y procesos físicos.",
    value: "Conectar el mundo físico con el sistema.",
    accent: "text-emerald-400",
    dot: "bg-emerald-400",
  },
] as const;

export function PillarsSection() {
  return (
    <Section id="capacidades" className="bg-slate-900/40">
      <div className="mb-12">
        <SectionEyebrow>Capacidades combinables</SectionEyebrow>

        <GradientTitle
          as="h2"
          className="mb-4 text-2xl font-semibold leading-snug md:text-3xl"
        >
          Un módulo enfocado hoy. Una plataforma conectada mañana.
        </GradientTitle>

        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          Arkanum Studio combina estas capacidades según lo que tu operación necesita.
          No es un catálogo de planes: diseñamos la combinación correcta para cada empresa.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {pillars.map((pillar) => (
          <PremiumCard key={pillar.name} className="flex flex-col gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${pillar.dot}`} />
                <p className={`text-xs font-semibold uppercase tracking-widest ${pillar.accent}`}>
                  {pillar.name}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{pillar.explanation}</p>
            </div>

            <div className="mt-auto border-t border-slate-700/40 pt-4">
              <p className="text-xs leading-relaxed text-slate-500">
                <span className="font-medium text-slate-400">Para el cliente: </span>
                {pillar.value}
              </p>
            </div>
          </PremiumCard>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-600">
        Podés empezar con uno y agregar capacidades a medida que el sistema crece.
      </p>
    </Section>
  );
}
