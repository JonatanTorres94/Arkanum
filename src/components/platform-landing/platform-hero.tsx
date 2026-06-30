import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

export function PlatformHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
      <BlueprintGridBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl">
        <SectionEyebrow>Arkanum Core — plataformas operativas a medida</SectionEyebrow>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          Una plataforma diseñada alrededor de tu proceso. No una plantilla adaptada.
        </h1>

        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Arkanum construye el sistema operativo que tu empresa necesita para ordenar procesos,
          conectar áreas y escalar sin depender de planillas, WhatsApp o herramientas improvisadas.
        </p>

        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-slate-500">
          Para servicios: clientes, proyectos, soporte y atención. Para logística: rutas,
          cargas y entregas. Para distribución: stock y pedidos. Para industria: producción
          y sensores. Cada operación define el sistema.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
            Diagnosticar mi proceso sin cargo
          </Button>
          <Button href="#que-es" variant="secondary" className="px-8 py-3.5 text-sm">
            Qué es una plataforma operativa
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Primero entendemos tu proceso. Después diseñamos el sistema que tiene sentido para tu empresa.
        </p>
      </div>
    </section>
  );
}
