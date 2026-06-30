const businessAreas = [
  "Ventas",
  "Operaciones",
  "Stock",
  "Soporte",
  "Administración",
  "Dirección",
  "Clientes",
  "Reportes",
];

const systemCapabilities = [
  { label: "Automatizaciones", dot: "bg-indigo-400", conditional: false },
  { label: "Integraciones externas", dot: "bg-violet-400", conditional: false },
  { label: "Alertas y seguimiento", dot: "bg-amber-400", conditional: false },
  { label: "Trazabilidad y auditoría", dot: "bg-slate-500", conditional: false },
  { label: "Agentes IA", dot: "bg-violet-300", conditional: true },
  { label: "Hardware y sensores", dot: "bg-emerald-400", conditional: true },
];

const coreAttrs = [
  "Procesos y estados del negocio",
  "Equipos, roles y accesos",
  "Datos estructurados",
  "Decisiones con contexto",
  "Automatización de tareas",
];

export function ConnectedOperationsMap() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-6">
      {/* Left: business areas — below core on mobile (order-2) */}
      <div className="order-2 flex flex-col gap-1.5 lg:order-1 lg:flex-1 lg:justify-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Áreas del negocio
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {businessAreas.map((area) => (
            <div
              key={area}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5 transition-colors hover:border-slate-700"
            >
              <span className="text-xs text-slate-400">{area}</span>
              {/* Connector pointing toward center (right on desktop) */}
              <div className="flex shrink-0 items-center gap-1">
                <div className="h-px w-4 bg-gradient-to-r from-transparent to-slate-700" />
                <div className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Arkanum Core — shown first on mobile (order-1) */}
      <div className="order-1 lg:order-2 lg:w-64 lg:shrink-0">
        <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-cyan-400/25 bg-public-surface-raised p-6 text-center shadow-[0_0_48px_rgba(34,211,238,0.08)]">
          <div className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs font-medium tracking-wide text-cyan-400">
            Plataforma operativa
          </div>
          <h3 className="mb-3 text-xl font-bold tracking-tight text-slate-50">
            Arkanum Core
          </h3>
          <p className="mb-5 text-sm leading-relaxed text-slate-400">
            El sistema operativo de tu empresa. Centraliza procesos, equipos, datos y decisiones en un solo lugar conectado.
          </p>
          <ul className="w-full space-y-2 text-left">
            {coreAttrs.map((attr) => (
              <li key={attr} className="flex items-center gap-2">
                <div className="h-1 w-1 shrink-0 rounded-full bg-cyan-400/50" />
                <span className="text-xs text-slate-500">{attr}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: system capabilities — below core on mobile (order-3) */}
      <div className="order-3 flex flex-col gap-1.5 lg:flex-1 lg:justify-center">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Capacidades del sistema
        </p>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {systemCapabilities.map((cap) => (
            <div
              key={cap.label}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
                cap.conditional
                  ? "border-slate-800/50 bg-slate-900/40 hover:border-slate-700/50"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              {/* Connector pointing toward center (left on desktop) */}
              <div className="flex shrink-0 items-center gap-1">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${cap.dot} ${cap.conditional ? "opacity-40" : ""}`}
                />
                <div className="h-px w-4 bg-gradient-to-l from-transparent to-slate-700" />
              </div>
              <div className="min-w-0">
                <span
                  className={`text-xs ${cap.conditional ? "text-slate-500" : "text-slate-400"}`}
                >
                  {cap.label}
                </span>
                {cap.conditional && (
                  <span className="ml-1 text-xs text-slate-600">— cuando aplica</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
