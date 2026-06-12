import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="px-6 pb-24 pt-20 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
          Automatización operativa y software a medida
        </p>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          Automatizamos y modernizamos procesos de tu empresa.
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
          Creamos sistemas web, apps móviles e integraciones a medida para reemplazar planillas,
          tareas repetitivas, sistemas desconectados y procesos lentos.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
            Diagnosticar mi proceso sin cargo
          </Button>
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
