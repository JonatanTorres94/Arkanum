const problems = [
  {
    heading: "Ventas desconectadas de la entrega",
    body: "El equipo comercial cierra proyectos que el equipo técnico no puede rastrear. Nadie sabe qué está comprometido ni en qué estado real está cada cliente.",
  },
  {
    heading: "Soporte sin trazabilidad",
    body: "Los reportes de clientes llegan por WhatsApp o email. Se pierden, se duplican o se responden sin historial. El trabajo de soporte no queda registrado.",
  },
  {
    heading: "Proyectos que vuelven a desarrollo sin control",
    body: "Un ticket de soporte puede reabrir trabajo técnico ya cerrado. Sin un sistema que lo gestione, los equipos operan con información desactualizada.",
  },
  {
    heading: "Trabajo perdido entre herramientas sueltas",
    body: "Tareas en WhatsApp, avances en Excel, clientes en la memoria. Cada herramienta tiene parte de la historia. Nadie tiene el cuadro completo.",
  },
];

export function PlatformProblem() {
  return (
    <section id="problema" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            El problema
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Operar sin sistema propio tiene un costo real
          </h2>
          <p className="text-slate-400">
            Las empresas de servicios B2B acumulan fricción cuando ventas, entrega y soporte no comparten
            un registro común.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {problems.map((p) => (
            <div
              key={p.heading}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h3 className="mb-2 font-medium text-slate-100">{p.heading}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
