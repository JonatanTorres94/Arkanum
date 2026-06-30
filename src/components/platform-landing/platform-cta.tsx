import { Button } from "@/components/ui/button";
import { SectionEyebrow } from "@/components/public/section-eyebrow";

export function PlatformCta() {
  return (
    <section className="border-t border-slate-800/60 px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Siguiente paso</SectionEyebrow>

        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          ¿Tu operación necesita un sistema propio?
        </h2>

        <p className="mb-10 text-base leading-relaxed text-slate-400">
          Analizamos tu proceso actual y evaluamos si una plataforma operativa a medida
          tiene sentido para tu empresa. Sin compromiso, sin presión comercial.
        </p>

        <Button href="/diagnostico" variant="primary" className="px-10 py-3.5 text-sm">
          Diagnosticar mi proceso sin cargo
        </Button>

        <p className="mt-4 text-xs text-slate-500">
          Si no tiene sentido construir una plataforma para tu caso, también te lo vamos a decir.
        </p>
      </div>
    </section>
  );
}
