const loop = [
  {
    label: "CRM",
    description: "Gestioná clientes y oportunidades comerciales con contexto completo.",
  },
  {
    label: "Delivery",
    description: "Organizá proyectos y work items desde el primer commit hasta el cierre.",
  },
  {
    label: "Support",
    description: "Registrá y resolvé tickets de soporte vinculados al trabajo técnico.",
  },
  {
    label: "Attention",
    description: "Una bandeja operativa que muestra qué necesita acción en este momento.",
  },
];

export function PlatformSolution() {
  return (
    <section id="solucion" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            La solución
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Un ciclo operativo completo
          </h2>
          <p className="text-slate-400">
            Arkanum conecta los cuatro ejes de la operación en un único sistema. Cada módulo alimenta
            al siguiente.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loop.map((step, i) => (
            <div
              key={step.label}
              className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-xs font-semibold text-cyan-400">
                {i + 1}
              </span>
              <h3 className="mb-2 font-semibold text-slate-50">{step.label}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          CRM → Delivery → Support → Attention → CRM
        </p>
      </div>
    </section>
  );
}
