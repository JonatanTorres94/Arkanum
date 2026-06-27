import { Button } from "@/components/ui/button";

export function PlatformHero() {
  return (
    <section className="px-6 pb-24 pt-20 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
          Plataforma operativa B2B
        </p>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          CRM vende.{" "}
          <span className="text-slate-400">Delivery construye.</span>{" "}
          Support sostiene.
        </h1>

        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
          Arkanum centraliza clientes, proyectos y soporte para que tu
          operación no dependa de chats, planillas y memoria humana.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
            Solicitar demo
          </Button>
          <Button href="/admin" variant="secondary" className="px-8 py-3.5 text-sm">
            Ver panel administrativo
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Una plataforma diseñada para empresas de servicios B2B que necesitan orden y trazabilidad.
        </p>
      </div>
    </section>
  );
}
