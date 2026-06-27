const pillars = [
  {
    label: "Diseñado para tu operación",
    description:
      "No adaptamos una plantilla. Analizamos tu proceso real y construimos el sistema que refleja cómo trabaja tu empresa.",
  },
  {
    label: "Módulos que se necesitan, no los que sobran",
    description:
      "Una empresa de logística no necesita CRM de ventas. Una distribuidora no necesita un panel de soporte técnico. El sistema se construye alrededor del negocio.",
  },
  {
    label: "Integrado con lo que ya tenés",
    description:
      "ERP, sistemas legacy, hardware de campo, APIs externas, dispositivos IoT. La plataforma conecta con lo que ya existe en lugar de reemplazarlo todo.",
  },
  {
    label: "Preparado para crecer",
    description:
      "Arquitectura limpia, documentación, control de accesos y base de datos robusta. Un sistema que puede evolucionar sin reescribirse desde cero.",
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
            Una plataforma operativa diseñada alrededor de tu negocio
          </h2>
          <p className="text-slate-400">
            Arkanum diseña y construye el sistema operativo que cada cliente necesita. No existe
            un producto único: existe una plataforma diseñada a medida para cada operación.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.label}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h3 className="mb-2 font-semibold text-slate-50">{pillar.label}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
