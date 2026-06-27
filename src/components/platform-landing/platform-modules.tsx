const modules = [
  {
    name: "Clientes / CRM",
    description:
      "Perfil completo por cliente: proyectos activos, historial de tickets, estado operativo y notas internas.",
  },
  {
    name: "Proyectos",
    description:
      "Ciclo de vida del proyecto desde planning hasta deployed. El estado se sincroniza automáticamente con el trabajo técnico.",
  },
  {
    name: "Work Items",
    description:
      "Unidades de trabajo técnico vinculadas al proyecto. Flujo desde backlog hasta done con estados intermedios controlados.",
  },
  {
    name: "Tickets de Soporte",
    description:
      "Registro de reportes, bugs e intervenciones de clientes. Pueden escalar a work items cuando requieren trabajo técnico.",
  },
  {
    name: "Attention Inbox",
    description:
      "Bandeja operativa derivada del estado real del sistema. Muestra qué necesita acción sin configuración manual.",
  },
  {
    name: "Lifecycle Reconciliation",
    description:
      "El estado del proyecto se reconcilia automáticamente cuando cambia el trabajo técnico o el soporte. Sin sincronización manual.",
  },
];

export function PlatformModules() {
  return (
    <section id="modulos" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            Módulos
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Todo el sistema en un lugar
          </h2>
          <p className="text-slate-400">
            Cada módulo resuelve un problema específico. Juntos cubren el ciclo completo de la operación.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.name}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <h3 className="mb-2 font-medium text-slate-100">{mod.name}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
