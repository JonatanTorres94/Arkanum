import { Section } from "@/components/ui/section";

const steps = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Relevamos cómo funciona hoy el proceso, qué herramientas usan y dónde se pierden tiempo, datos o control.",
  },
  {
    number: "02",
    title: "Diseño de solución",
    description:
      "Definimos qué conviene automatizar, qué debe integrarse y cuál es el alcance mínimo para generar valor.",
  },
  {
    number: "03",
    title: "MVP funcional",
    description:
      "Construimos una primera versión usable, enfocada en resolver el problema principal sin sobredimensionar el proyecto.",
  },
  {
    number: "04",
    title: "Implementación",
    description:
      "Acompañamos la puesta en marcha, ajustes iniciales y adopción por parte del equipo.",
  },
  {
    number: "05",
    title: "Mejora continua",
    description:
      "Evolucionamos la solución según uso real, nuevas necesidades y crecimiento de la empresa.",
  },
];

export function ProcessSection() {
  return (
    <Section id="metodo" className="bg-slate-900/40">
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
          Primero entendemos el proceso. Después construimos la solución.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400 reveal reveal-1">
          El software a medida solo tiene sentido cuando responde a un problema real. Por eso
          empezamos con diagnóstico, definimos alcance y avanzamos por etapas.
        </p>
      </div>

      <ol className="relative flex flex-col gap-0">
        {steps.map((step, index) => (
          <li key={step.number} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs font-semibold text-cyan-400">
                {step.number}
              </div>
              {index < steps.length - 1 && (
                <div className="my-1 h-full w-px bg-slate-800" />
              )}
            </div>
            <div className="pb-10">
              <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{step.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
