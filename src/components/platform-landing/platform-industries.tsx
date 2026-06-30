const industries = [
  {
    sector: "Software / Servicios",
    modules: "Clientes, oportunidades, proyectos, work items, soporte, Attention.",
    detail:
      "El modelo CRM + Delivery + Support centraliza el ciclo completo: desde la oportunidad comercial hasta la resolución del ticket técnico.",
  },
  {
    sector: "Logística",
    modules: "Camiones, viajes, cargas, entregas, rutas, documentación.",
    detail:
      "Trazabilidad de cada viaje en tiempo real, asignación de cargas, confirmación de entregas desde el campo y reportes por conductor o zona.",
  },
  {
    sector: "Distribución",
    modules: "Stock, pedidos, zonas, rutas, cobranza, clientes.",
    detail:
      "Control de inventario por depósito, gestión de pedidos por zona, seguimiento de cobranza y panel operativo para el equipo de ventas.",
  },
  {
    sector: "Industria",
    modules: "Producción, sensores, mantenimiento, reportes, alertas.",
    detail:
      "Integración con equipos de planta, registro de variables de producción, alertas automáticas por umbral y trazabilidad del proceso fabril.",
  },
];

import { Card } from "@/components/ui/card";

export function PlatformIndustries() {
  return (
    <section id="operaciones" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            Cada operación es distinta
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            El sistema se adapta a tu proceso, no al revés
          </h2>
          <p className="text-slate-400">
            Arkanum no vende un dashboard rígido. Diseña el sistema operativo que cada empresa
            necesita, con los módulos y flujos que corresponden a su proceso real.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {industries.map((ind) => (
            <Card key={ind.sector}>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-cyan-400/70">
                {ind.sector}
              </p>
              <p className="mb-3 text-sm font-medium text-slate-200">{ind.modules}</p>
              <p className="text-sm leading-relaxed text-slate-400">{ind.detail}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
