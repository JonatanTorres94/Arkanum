import { HomeCtaButton } from "@/components/ui/tracked-cta-button";

export function FinalCtaSection() {
  return (
    <section
      id="diagnostico"
      className="relative overflow-hidden border-t border-slate-800 bg-slate-900/40 px-6 py-24"
    >
      {/* Ambient glow — energizes the conversion moment */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 reveal md:text-3xl">
          Solicitá un diagnóstico inicial sin cargo.
        </h2>
        <p className="mb-8 text-base leading-relaxed text-slate-400 reveal reveal-1">
          Contanos qué proceso querés mejorar. Revisamos tu caso y te indicamos si una solución
          digital a medida puede ayudarte a reducir carga manual, ordenar información o conectar
          sistemas.
        </p>
        <div className="reveal reveal-2">
          <HomeCtaButton location="final_cta" variant="primary" className="px-10 py-3.5 text-sm">
            Diagnosticar mi proceso sin cargo
          </HomeCtaButton>
          <p className="mt-4 text-xs text-slate-500">
            Sin compromiso. Si no tiene sentido construir software a medida para tu caso, también te
            lo vamos a decir.
          </p>
        </div>
      </div>
    </section>
  );
}
