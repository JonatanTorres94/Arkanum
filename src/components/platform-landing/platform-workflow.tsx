const steps = [
  { step: "01", text: "Un cliente reporta un problema. Soporte lo registra como ticket." },
  { step: "02", text: "Si requiere trabajo técnico, se escala. Arkanum crea el work item vinculado." },
  { step: "03", text: "El proyecto vuelve a estado de desarrollo automáticamente." },
  { step: "04", text: "El equipo técnico trabaja el item. El estado avanza en el sistema." },
  { step: "05", text: "Cuando el trabajo termina, Soporte recibe una alerta para validar." },
  { step: "06", text: "Soporte valida, cierra el ticket. Attention se limpia sola." },
];

export function PlatformWorkflow() {
  return (
    <section id="como-funciona" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            Flujo real
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Cómo funciona en la práctica
          </h2>
          <p className="text-slate-400">
            Un caso concreto: desde que el cliente reporta un problema hasta que el sistema vuelve
            a estado normal, sin intervención manual.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(({ step, text }) => (
            <div
              key={step}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <span className="mb-4 block font-mono text-xs font-semibold text-cyan-400/60">
                {step}
              </span>
              <p className="text-sm leading-relaxed text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
