import { Button } from "@/components/ui/button";

export function PlatformHero() {
  return (
    <section className="px-6 pb-24 pt-20 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
          Software operativo a medida para empresas B2B
        </p>

        <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          Plataformas operativas a medida para empresas B2B
        </h1>

        <p className="mb-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          Diseñamos y construimos el sistema que tu operación necesita: dashboards, flujos de trabajo,
          integraciones entre sistemas, automatizaciones, apps web y móviles, y conexiones con
          hardware o datos externos.
        </p>

        <p className="mb-10 max-w-2xl text-sm leading-relaxed text-slate-500">
          Para empresas de servicios puede ser{" "}
          <span className="text-slate-400">CRM + Delivery + Support + Attention</span>. Para
          logística, rutas y vehículos. Para distribución, stock y pedidos. Para industria,
          producción y sensores. Cada operación define el sistema.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
            Solicitar demo
          </Button>
          <Button href="/#soluciones" variant="secondary" className="px-8 py-3.5 text-sm">
            Ver soluciones
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Primero entendemos tu operación. Después diseñamos el sistema que tiene sentido para tu empresa.
        </p>
      </div>
    </section>
  );
}
