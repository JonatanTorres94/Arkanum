const sidebarModules = [
  { label: "Operación", active: true },
  { label: "Proyectos", active: false },
  { label: "Clientes", active: false },
  { label: "Soporte", active: false },
  { label: "Agentes IA", active: false },
  { label: "Reportes", active: false },
];

const metrics = [
  { value: "12", label: "Proyectos activos", sub: "+2 este mes" },
  { value: "7", label: "Tickets abiertos", sub: "3 requieren atención" },
  { value: "4", label: "Seguimientos hoy", sub: "1 vence esta tarde" },
  { value: "18", label: "Automatizaciones", sub: "activas" },
];

const projects = [
  {
    client: "Distribuidora Torres",
    status: "En desarrollo",
    statusColor: "text-cyan-400",
    dot: "bg-cyan-400",
    phase: "Dev",
    priority: "Alta",
    priorityColor: "text-orange-400",
  },
  {
    client: "Logística Andina",
    status: "En pruebas",
    statusColor: "text-yellow-400",
    dot: "bg-yellow-400",
    phase: "QA",
    priority: "Media",
    priorityColor: "text-slate-400",
  },
  {
    client: "Industrias del Norte",
    status: "Soporte activo",
    statusColor: "text-orange-400",
    dot: "bg-orange-400",
    phase: "Support",
    priority: "Alta",
    priorityColor: "text-orange-400",
  },
  {
    client: "Servicios Roca",
    status: "Iniciado",
    statusColor: "text-slate-400",
    dot: "bg-slate-600",
    phase: "Core",
    priority: "Media",
    priorityColor: "text-slate-400",
  },
  {
    client: "Grupo Mendel",
    status: "Completado",
    statusColor: "text-emerald-400",
    dot: "bg-emerald-400",
    phase: "Cerrado",
    priority: "—",
    priorityColor: "text-slate-600",
  },
];

const alerts = [
  {
    type: "Escalación",
    label: "Ticket #42 derivado a desarrollo",
    age: "15 min",
    dot: "bg-red-400",
    typeColor: "text-red-400",
  },
  {
    type: "Vencimiento",
    label: "Seguimiento con Andina vence hoy",
    age: "2 h",
    dot: "bg-orange-400",
    typeColor: "text-orange-400",
  },
  {
    type: "Automatización",
    label: "Reporte semanal generado",
    age: "3 h",
    dot: "bg-emerald-400",
    typeColor: "text-emerald-400",
  },
  {
    type: "Lead",
    label: "Diagnóstico — Distribuidora Costa",
    age: "5 h",
    dot: "bg-cyan-400",
    typeColor: "text-cyan-400",
  },
];

export function MiniDashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl shadow-black/60">
      {/* Chrome bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="text-xs font-medium text-slate-400">
            Arkanum Core <span className="text-slate-600">— Sistema operativo</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-slate-600">en vivo</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden w-36 shrink-0 border-r border-slate-800 bg-slate-950 p-3 sm:flex sm:flex-col">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-700">
            Módulos
          </p>
          <nav className="space-y-0.5">
            {sidebarModules.map((mod) => (
              <div
                key={mod.label}
                className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                  mod.active
                    ? "bg-cyan-400/10 font-medium text-cyan-400"
                    : "text-slate-600 hover:text-slate-400"
                }`}
              >
                {mod.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 bg-slate-900 p-4">
          {/* Page header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Proyectos activos</p>
              <p className="text-xs text-slate-500">12 proyectos en curso · actualizado ahora</p>
            </div>
            <div className="cursor-default rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600">
              + Nuevo
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-slate-800 bg-slate-800/60 px-3 py-2.5"
              >
                <p className="text-base font-semibold leading-none text-slate-100">{m.value}</p>
                <p className="mt-1 text-xs text-slate-500">{m.label}</p>
                <p className="mt-0.5 text-xs text-slate-700">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Content split */}
          <div className="grid gap-3 lg:grid-cols-[1fr_176px]">
            {/* Projects list */}
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-800/40 px-3 py-1.5">
                <span className="flex-1 text-xs font-medium uppercase tracking-wider text-slate-600">
                  Cliente
                </span>
                <span className="hidden w-28 shrink-0 text-xs font-medium uppercase tracking-wider text-slate-600 sm:block">
                  Estado
                </span>
                <span className="hidden w-12 shrink-0 text-center text-xs font-medium uppercase tracking-wider text-slate-600 sm:block">
                  Fase
                </span>
                <span className="w-12 shrink-0 text-right text-xs font-medium uppercase tracking-wider text-slate-600">
                  Prioridad
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {projects.map((p) => (
                  <div
                    key={p.client}
                    className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-800/30"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.dot}`} />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                      {p.client}
                    </span>
                    <span
                      className={`hidden w-28 shrink-0 text-xs ${p.statusColor} sm:block`}
                    >
                      {p.status}
                    </span>
                    <span className="hidden w-12 shrink-0 text-center text-xs text-slate-500 sm:block">
                      {p.phase}
                    </span>
                    <span
                      className={`w-12 shrink-0 text-right text-xs font-medium ${p.priorityColor}`}
                    >
                      {p.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts panel */}
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="border-b border-slate-800 bg-slate-800/40 px-3 py-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  Bandeja de atención
                </p>
              </div>
              <div className="divide-y divide-slate-800/60">
                {alerts.map((a) => (
                  <div key={a.label} className="px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.dot}`} />
                      <span className={`text-xs font-medium ${a.typeColor}`}>{a.type}</span>
                      <span className="ml-auto text-xs text-slate-700">{a.age}</span>
                    </div>
                    <p className="text-xs leading-snug text-slate-500">{a.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
