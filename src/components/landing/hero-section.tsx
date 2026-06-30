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
        <SectionEyebrow className="reveal">
          Arkanum Studio — sistemas a medida para tu operación
        </SectionEyebrow>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 reveal reveal-1 md:text-6xl">
          Tu empresa creció.
          <br className="hidden md:block" /> Tus sistemas, no.
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400 reveal reveal-2">
          Arkanum diseña y construye sistemas operativos a medida para ordenar procesos,
          conectar áreas y hacer evolucionar tu operación.
        </p>

        <div className="flex flex-col gap-4 reveal reveal-3 sm:flex-row">
          <HomeCtaButton location="hero" variant="primary" className="px-8 py-3.5 text-sm">
            Diagnosticar mi proceso sin cargo
          </HomeCtaButton>
          <Button href="#capacidades" variant="secondary" className="px-8 py-3.5 text-sm">
            Ver capacidades
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500 reveal reveal-4">
          Primero entendemos tu operación. Después definimos si una solución a medida tiene sentido.
        </p>
      </div>
    </section>
  );
}
