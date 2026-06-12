import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section
      id="diagnostico"
      className="border-t border-slate-800 bg-slate-900/40 px-6 py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          Solicitá un diagnóstico inicial sin cargo.
        </h2>
        <p className="mb-8 text-base leading-relaxed text-slate-400">
          Contanos qué proceso querés mejorar. Revisamos tu caso y te indicamos si una solución
          digital a medida puede ayudarte a reducir carga manual, ordenar información o conectar
          sistemas.
        </p>
        <Button href="/diagnostico" variant="primary" className="px-10 py-3.5 text-sm">
          Diagnosticar mi proceso sin cargo
        </Button>
        <p className="mt-4 text-xs text-slate-500">
          Sin compromiso. Si no tiene sentido construir software a medida para tu caso, también te
          lo vamos a decir.
        </p>
      </div>
    </section>
  );
}
