const steps = [
  { step: "01", text: "Un cliente reporta un problema. Soporte lo registra como ticket en el sistema." },
  { step: "02", text: "Si requiere trabajo técnico, se escala. El sistema crea el work item vinculado automáticamente." },
  { step: "03", text: "El proyecto vuelve a estado de desarrollo. El equipo técnico ve el cambio sin intervención manual." },
  { step: "04", text: "El equipo técnico trabaja el item. El estado avanza en el sistema a medida que progresa." },
  { step: "05", text: "Cuando el trabajo termina, Soporte recibe la alerta para validar. Sin seguimiento manual." },
  { step: "06", text: "Soporte valida, cierra el ticket. La bandeja de atención se limpia automáticamente." },
];

import { Card } from "@/components/ui/card";

export function PlatformWorkflow() {
  return (
    <section id="como-funciona" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            Flujo real
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Cómo funciona en la práctica
          </h2>
        </div>

        <p className="mb-12 max-w-xl text-sm text-slate-500">
          Ejemplo aplicado a una empresa de servicios/software con ciclo CRM + Delivery + Support.
          Cada operación tiene su propio flujo; este es uno de los modelos posibles.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ step, text }) => (
            <Card key={step}>
              <span className="mb-4 block font-mono text-xs font-semibold text-cyan-400/60">
                {step}
              </span>
              <p className="text-sm leading-relaxed text-slate-300">{text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
