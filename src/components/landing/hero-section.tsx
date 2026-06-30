import { Button } from "@/components/ui/button";
import { HomeCtaButton } from "@/components/ui/tracked-cta-button";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { BlueprintGridBackground } from "@/components/public/blueprint-grid-background";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 md:pt-32">
      <BlueprintGridBackground />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-cyan-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl">
        <SectionEyebrow>Automatización operativa y software a medida</SectionEyebrow>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          Automatizamos y modernizamos procesos de tu empresa.
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
          Creamos sistemas web, apps móviles e integraciones a medida para reemplazar planillas,
          tareas repetitivas, sistemas desconectados y procesos lentos.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <HomeCtaButton location="hero" variant="primary" className="px-8 py-3.5 text-sm">
            Diagnosticar mi proceso sin cargo
          </HomeCtaButton>
          <Button href="#soluciones" variant="secondary" className="px-8 py-3.5 text-sm">
            Ver soluciones
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Primero entendemos tu operación. Después definimos si una solución a medida tiene sentido.
        </p>
      </div>
    </section>
  );
}
