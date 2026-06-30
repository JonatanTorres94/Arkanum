import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";
import { ConnectedOperationsMap } from "@/components/public/connected-operations-map";

export function PlatformMapSection() {
  return (
    <section id="mapa-operativo" className="relative overflow-hidden bg-slate-950 px-6 py-20">
      <BlueprintGridBackground />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <SectionEyebrow>Mapa operativo conectado</SectionEyebrow>

          <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
            Un sistema no gana valor por tener pantallas. Lo gana cuando conecta áreas, datos y decisiones que antes vivían separadas.
          </GradientTitle>

          <p className="text-base leading-relaxed text-slate-400">
            Arkanum Core actúa como el sistema operativo de tu empresa: centraliza la información
            de cada área, conecta los procesos y habilita automatizaciones, integraciones e
            inteligencia solo cuando el proceso los justifica.
          </p>
        </div>

        <ConnectedOperationsMap />
      </div>
    </section>
  );
}
