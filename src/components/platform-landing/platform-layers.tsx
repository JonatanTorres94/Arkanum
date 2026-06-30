import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

const layers = [
  {
    index: "01",
    name: "Entrada de datos",
    description:
      "Formularios, registros manuales, APIs, dispositivos, sensores e importaciones. El sistema captura la realidad operativa.",
    always: true,
  },
  {
    index: "02",
    name: "Procesos y estados",
    description:
      "Flujos de trabajo, ciclos de vida y transiciones de estado que reflejan cómo avanza la operación real de tu empresa.",
    always: true,
  },
  {
    index: "03",
    name: "Equipo y accesos",
    description:
      "Roles, permisos y vistas adaptadas a cada área. Cada persona ve y opera lo que corresponde a su función.",
    always: true,
  },
  {
    index: "04",
    name: "Automatizaciones",
    description:
      "Reglas que crean tareas, actualizan estados, envían alertas o sincronizan datos sin intervención manual.",
    always: true,
  },
  {
    index: "05",
    name: "Reportes y trazabilidad",
    description:
      "Historial completo, métricas por período y visibilidad del estado real del negocio para tomar decisiones con datos.",
    always: true,
  },
  {
    index: "06",
    name: "IA y agentes",
    description:
      "Cuando el proceso lo justifica: agentes conectados al contexto del sistema para razonar, sugerir o ejecutar acciones dentro de la plataforma.",
    always: false,
  },
  {
    index: "07",
    name: "Dispositivos y hardware",
    description:
      "Lectores, sensores, terminales, impresoras o kioscos integrados cuando el proceso no termina en una pantalla.",
    always: false,
  },
] as const;

export function PlatformLayers() {
  return (
    <section
      id="arquitectura"
      className="relative overflow-hidden bg-slate-900/40 px-6 py-20"
    >
      <BlueprintGridBackground />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12">
          <SectionEyebrow>Arquitectura de la plataforma</SectionEyebrow>

          <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
            Capas que trabajan conectadas, no en silos.
          </GradientTitle>

          <p className="max-w-2xl text-base leading-relaxed text-slate-400">
            Cada plataforma Arkanum se construye combinando estas capas. Las últimas dos
            se agregan solo cuando el proceso lo requiere.
          </p>
        </div>

        <ol className="mx-auto max-w-3xl">
          {layers.map((layer, index) => (
            <li key={layer.index} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    layer.always
                      ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-400"
                      : "border-slate-600/40 bg-slate-800/50 text-slate-500"
                  }`}
                >
                  {layer.index}
                </div>
                {index < layers.length - 1 && (
                  <div
                    className={`my-1 h-full w-px ${
                      layer.always ? "bg-cyan-400/20" : "bg-slate-700/30"
                    }`}
                  />
                )}
              </div>

              <div className="pb-8">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">{layer.name}</h3>
                  {!layer.always && (
                    <span className="rounded-full border border-slate-700/60 px-2 py-0.5 text-xs text-slate-500">
                      cuando aplica
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-400">{layer.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
