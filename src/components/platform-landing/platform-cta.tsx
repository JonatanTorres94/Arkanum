import { Button } from "@/components/ui/button";

export function PlatformCta() {
  return (
    <section className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
          Siguiente paso
        </p>
        <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
          ¿Tu operación necesita esto?
        </h2>
        <p className="mb-10 text-slate-400">
          Analizamos tu proceso actual y evaluamos si Arkanum tiene sentido para tu empresa. Sin
          compromiso, sin presión comercial.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button href="/diagnostico" variant="primary" className="w-full px-10 py-3.5 text-sm sm:w-auto">
            Solicitar demo
          </Button>
          <Button href="/diagnostico" variant="secondary" className="w-full px-10 py-3.5 text-sm sm:w-auto">
            Contactar
          </Button>
        </div>
      </div>
    </section>
  );
}
