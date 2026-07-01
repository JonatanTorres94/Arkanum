"use client";

import { useState, useCallback } from "react";
import { trackDashboardModuleSwitch } from "@/lib/analytics/track";

type MetricCard = { value: string; label: string; sub: string };

type TableRow = {
  id: string;
  primary: string;
  dot: string;
  status: string;
  statusColor: string;
  col2: string;
  col3: string;
  col3Color: string;
};

type SideItem = {
  id: string;
  type: string;
  typeColor: string;
  dot: string;
  label: string;
  age: string;
};

type ModuleView = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  tableHeader: string;
  sideHeader: string;
  metrics: MetricCard[];
  rows: TableRow[];
  side: SideItem[];
};

const modules: ModuleView[] = [
  {
    id: "operacion",
    label: "Operación",
    title: "Vista general",
    subtitle: "Estado operativo · actualizado ahora",
    tableHeader: "Proyectos activos",
    sideHeader: "Bandeja de atención",
    metrics: [
      { value: "12", label: "Proyectos activos", sub: "+2 este mes" },
      { value: "7",  label: "Tickets abiertos",  sub: "3 requieren atención" },
      { value: "4",  label: "Seguimientos hoy",  sub: "1 vence esta tarde" },
      { value: "18", label: "Automatizaciones",  sub: "activas" },
    ],
    rows: [
      { id: "o1", primary: "Distribuidora Torres",  dot: "bg-cyan-400",   status: "En desarrollo",  statusColor: "text-cyan-400",   col2: "Dev",     col3: "Alta",  col3Color: "text-orange-400" },
      { id: "o2", primary: "Logística Andina",      dot: "bg-yellow-400", status: "En pruebas",     statusColor: "text-yellow-400", col2: "QA",      col3: "Media", col3Color: "text-slate-400" },
      { id: "o3", primary: "Industrias del Norte",  dot: "bg-orange-400", status: "Soporte activo", statusColor: "text-orange-400", col2: "Support", col3: "Alta",  col3Color: "text-orange-400" },
      { id: "o4", primary: "Servicios Roca",        dot: "bg-slate-600",  status: "Iniciado",       statusColor: "text-slate-400",  col2: "Core",    col3: "Media", col3Color: "text-slate-400" },
      { id: "o5", primary: "Grupo Mendel",          dot: "bg-emerald-400",status: "Completado",     statusColor: "text-emerald-400",col2: "Cerrado", col3: "—",     col3Color: "text-slate-600" },
    ],
    side: [
      { id: "oa1", type: "Escalación",   typeColor: "text-red-400",     dot: "bg-red-400",     label: "Ticket #42 derivado a desarrollo",  age: "15 min" },
      { id: "oa2", type: "Vencimiento",  typeColor: "text-orange-400",  dot: "bg-orange-400",  label: "Seguimiento con Andina vence hoy",  age: "2 h" },
      { id: "oa3", type: "Automatización", typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Reporte semanal generado",        age: "3 h" },
      { id: "oa4", type: "Lead",         typeColor: "text-cyan-400",    dot: "bg-cyan-400",    label: "Diagnóstico — Distribuidora Costa", age: "5 h" },
    ],
  },
  {
    id: "proyectos",
    label: "Proyectos",
    title: "Proyectos",
    subtitle: "12 proyectos en curso · 3 próximos a entregar",
    tableHeader: "Cronograma",
    sideHeader: "Alertas de entrega",
    metrics: [
      { value: "12", label: "En ejecución",      sub: "3 por entregar esta semana" },
      { value: "3",  label: "En revisión cliente",sub: "esperando feedback" },
      { value: "2",  label: "Con retrasos",       sub: "requieren acción" },
      { value: "5",  label: "Completados",        sub: "este mes" },
    ],
    rows: [
      { id: "p1", primary: "Torres — Core + Flow", dot: "bg-cyan-400",    status: "85%", statusColor: "text-cyan-400",    col2: "Entrega: 10 jul", col3: "Alta",  col3Color: "text-orange-400" },
      { id: "p2", primary: "Andina — Integración", dot: "bg-emerald-400", status: "92%", statusColor: "text-emerald-400", col2: "Entrega: 5 jul",  col3: "Alta",  col3Color: "text-orange-400" },
      { id: "p3", primary: "Norte — Soporte",      dot: "bg-yellow-400",  status: "40%", statusColor: "text-yellow-400",  col2: "Entrega: 30 jul", col3: "Media", col3Color: "text-slate-400" },
      { id: "p4", primary: "Roca — MVP",           dot: "bg-slate-600",   status: "12%", statusColor: "text-slate-400",   col2: "Entrega: 20 ago", col3: "Media", col3Color: "text-slate-400" },
      { id: "p5", primary: "Costa — Diagnóstico",  dot: "bg-slate-700",   status: "—",   statusColor: "text-slate-600",   col2: "Por iniciar",     col3: "—",     col3Color: "text-slate-600" },
    ],
    side: [
      { id: "pa1", type: "Entrega", typeColor: "text-orange-400",  dot: "bg-orange-400",  label: "Andina vence en 5 días",       age: "Hoy" },
      { id: "pa2", type: "Review",  typeColor: "text-yellow-400",  dot: "bg-yellow-400",  label: "Torres esperando feedback",    age: "2 días" },
      { id: "pa3", type: "Retraso", typeColor: "text-red-400",     dot: "bg-red-400",     label: "Norte — 3 días de desvío",     age: "Ayer" },
      { id: "pa4", type: "Hito",    typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Roca — sprint 1 completado",   age: "2 días" },
    ],
  },
  {
    id: "clientes",
    label: "Clientes",
    title: "Clientes",
    subtitle: "28 clientes activos · 3 contratos por renovar",
    tableHeader: "Directorio de clientes",
    sideHeader: "Actividad reciente",
    metrics: [
      { value: "28", label: "Clientes activos",  sub: "2 nuevos este mes" },
      { value: "3",  label: "Por renovar",       sub: "próximos 30 días" },
      { value: "5",  label: "Sin actividad",     sub: "más de 60 días" },
      { value: "1",  label: "En offboarding",    sub: "proceso iniciado" },
    ],
    rows: [
      { id: "c1", primary: "Distribuidora Torres", dot: "bg-emerald-400", status: "Activo",     statusColor: "text-emerald-400", col2: "Core + Flow",  col3: "Renueva jul",   col3Color: "text-orange-400" },
      { id: "c2", primary: "Logística Andina",     dot: "bg-emerald-400", status: "Activo",     statusColor: "text-emerald-400", col2: "Core",         col3: "Renueva sep",   col3Color: "text-slate-400" },
      { id: "c3", primary: "Industrias del Norte", dot: "bg-yellow-400",  status: "Soporte",    statusColor: "text-yellow-400",  col2: "Core + Agents",col3: "Renueva dic",   col3Color: "text-slate-400" },
      { id: "c4", primary: "Servicios Roca",       dot: "bg-cyan-400",    status: "Onboarding", statusColor: "text-cyan-400",    col2: "MVP",          col3: "Nuevo",         col3Color: "text-cyan-400" },
      { id: "c5", primary: "Grupo Mendel",         dot: "bg-slate-600",   status: "Inactivo",   statusColor: "text-slate-500",   col2: "Completado",   col3: "68 días",       col3Color: "text-slate-600" },
    ],
    side: [
      { id: "ca1", type: "Renovación", typeColor: "text-orange-400",  dot: "bg-orange-400",  label: "Torres vence el 15 de julio",   age: "15 días" },
      { id: "ca2", type: "Inactivo",   typeColor: "text-red-400",     dot: "bg-red-400",     label: "Mendel — sin actividad 68 días", age: "Hoy" },
      { id: "ca3", type: "Onboarding", typeColor: "text-cyan-400",    dot: "bg-cyan-400",    label: "Roca — primera sesión agendada", age: "Mañana" },
      { id: "ca4", type: "Nota",       typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Andina — feedback positivo",     age: "Ayer" },
    ],
  },
  {
    id: "soporte",
    label: "Soporte",
    title: "Soporte y tickets",
    subtitle: "7 tickets abiertos · 2 críticos",
    tableHeader: "Tickets activos",
    sideHeader: "Escalaciones",
    metrics: [
      { value: "7",   label: "Tickets abiertos", sub: "2 críticos" },
      { value: "4",   label: "En proceso",        sub: "asignados al equipo" },
      { value: "1",   label: "Resuelto hoy",      sub: "tiempo promedio: 3 h" },
      { value: "94%", label: "SLA cumplido",      sub: "últimos 30 días" },
    ],
    rows: [
      { id: "s1", primary: "#42 — Error en importación", dot: "bg-red-400",    status: "Crítico",  statusColor: "text-red-400",    col2: "Torres", col3: "Dev",     col3Color: "text-slate-400" },
      { id: "s2", primary: "#41 — Acceso denegado",      dot: "bg-orange-400", status: "Alto",     statusColor: "text-orange-400", col2: "Andina", col3: "Soporte", col3Color: "text-slate-400" },
      { id: "s3", primary: "#39 — Reporte incorrecto",   dot: "bg-yellow-400", status: "Medio",    statusColor: "text-yellow-400", col2: "Norte",  col3: "Dev",     col3Color: "text-slate-400" },
      { id: "s4", primary: "#38 — Consulta de usuario",  dot: "bg-slate-500",  status: "Bajo",     statusColor: "text-slate-400",  col2: "Roca",   col3: "Soporte", col3Color: "text-slate-400" },
      { id: "s5", primary: "#37 — Ajuste de permisos",   dot: "bg-emerald-400",status: "Resuelto", statusColor: "text-emerald-400",col2: "Mendel", col3: "—",       col3Color: "text-slate-600" },
    ],
    side: [
      { id: "sa1", type: "Crítico",  typeColor: "text-red-400",     dot: "bg-red-400",     label: "#42 escalado a desarrollo",    age: "15 min" },
      { id: "sa2", type: "SLA",      typeColor: "text-orange-400",  dot: "bg-orange-400",  label: "#41 SLA vence en 2 horas",     age: "Ahora" },
      { id: "sa3", type: "Asignado", typeColor: "text-yellow-400",  dot: "bg-yellow-400",  label: "#39 asignado a María G.",      age: "1 h" },
      { id: "sa4", type: "Resuelto", typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "#37 cerrado por cliente",       age: "3 h" },
    ],
  },
  {
    id: "agentes",
    label: "Agentes IA",
    title: "Agentes IA",
    subtitle: "Solo cuando el proceso lo justifica · 5 activos",
    tableHeader: "Agentes en ejecución",
    sideHeader: "Insights generados",
    metrics: [
      { value: "5",  label: "Agentes activos",    sub: "conectados al sistema" },
      { value: "42", label: "Tareas ejecutadas",  sub: "últimas 24 horas" },
      { value: "12", label: "Insights generados", sub: "esta semana" },
      { value: "3",  label: "En revisión",        sub: "esperando aprobación" },
    ],
    rows: [
      { id: "ai1", primary: "Agente de seguimiento",   dot: "bg-violet-400", status: "Activo",   statusColor: "text-violet-400", col2: "Operación", col3: "Autónomo",   col3Color: "text-slate-400" },
      { id: "ai2", primary: "Clasificador de tickets", dot: "bg-violet-400", status: "Activo",   statusColor: "text-violet-400", col2: "Soporte",   col3: "Autónomo",   col3Color: "text-slate-400" },
      { id: "ai3", primary: "Generador de reportes",   dot: "bg-yellow-400", status: "En pausa", statusColor: "text-yellow-400", col2: "Reportes",  col3: "Manual",     col3Color: "text-slate-400" },
      { id: "ai4", primary: "Analista de patrones",    dot: "bg-orange-400", status: "Revisión", statusColor: "text-orange-400", col2: "Dirección", col3: "Supervisado",col3Color: "text-slate-400" },
      { id: "ai5", primary: "Notificador automático",  dot: "bg-violet-400", status: "Activo",   statusColor: "text-violet-400", col2: "Todos",     col3: "Autónomo",   col3Color: "text-slate-400" },
    ],
    side: [
      { id: "aia1", type: "Insight",  typeColor: "text-violet-400",  dot: "bg-violet-400",  label: "Torres: patrón de errores lunes AM",  age: "1 h" },
      { id: "aia2", type: "Acción",   typeColor: "text-violet-400",  dot: "bg-violet-400",  label: "Ticket #42 clasificado como crítico",  age: "2 h" },
      { id: "aia3", type: "Revisión", typeColor: "text-orange-400",  dot: "bg-orange-400",  label: "Reporte de Andina pendiente OK",       age: "3 h" },
      { id: "aia4", type: "Info",     typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Ciclo semanal sin errores",             age: "Ayer" },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    title: "Reportes automáticos",
    subtitle: "8 reportes programados · 3 generados hoy",
    tableHeader: "Reportes del sistema",
    sideHeader: "Generados recientes",
    metrics: [
      { value: "8",  label: "Programados",    sub: "activos en el sistema" },
      { value: "3",  label: "Generados hoy",  sub: "enviados automáticamente" },
      { value: "15", label: "En cola",        sub: "próximas 24 horas" },
      { value: "2",  label: "Con error",      sub: "requieren revisión" },
    ],
    rows: [
      { id: "r1", primary: "Resumen ejecutivo semanal", dot: "bg-emerald-400", status: "Activo",   statusColor: "text-emerald-400", col2: "Lunes 08:00",   col3: "Dirección", col3Color: "text-slate-400" },
      { id: "r2", primary: "Tickets por área",          dot: "bg-emerald-400", status: "Activo",   statusColor: "text-emerald-400", col2: "Diario 09:00",  col3: "Soporte",   col3Color: "text-slate-400" },
      { id: "r3", primary: "Estado de proyectos",       dot: "bg-emerald-400", status: "Activo",   statusColor: "text-emerald-400", col2: "Viernes 17:00", col3: "Gerencia",  col3Color: "text-slate-400" },
      { id: "r4", primary: "SLA de soporte",            dot: "bg-red-400",     status: "Error",    statusColor: "text-red-400",     col2: "Diario 08:30",  col3: "Soporte",   col3Color: "text-slate-400" },
      { id: "r5", primary: "Pipeline comercial",        dot: "bg-yellow-400",  status: "En pausa", statusColor: "text-yellow-400",  col2: "Jueves 12:00",  col3: "Ventas",    col3Color: "text-slate-400" },
    ],
    side: [
      { id: "ra1", type: "Generado", typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Resumen ejecutivo enviado",         age: "08:00" },
      { id: "ra2", type: "Generado", typeColor: "text-emerald-400", dot: "bg-emerald-400", label: "Tickets por área enviado",          age: "09:00" },
      { id: "ra3", type: "Error",    typeColor: "text-red-400",     dot: "bg-red-400",     label: "SLA: fuente de datos no responde",  age: "09:30" },
      { id: "ra4", type: "En cola",  typeColor: "text-slate-500",   dot: "bg-slate-500",   label: "Estado de proyectos — viernes",    age: "Próximo" },
    ],
  },
];

export function MiniDashboardPreview() {
  const [activeId, setActiveId] = useState<string>("operacion");
  const active = modules.find((m) => m.id === activeId) ?? modules[0];

  const handleModuleSwitch = useCallback((id: string) => {
    setActiveId(id);
    trackDashboardModuleSwitch(id);
  }, []);

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
          <span className="text-xs text-slate-600">demo</span>
        </div>
      </div>

      {/* Mobile tab strip — replaces sidebar on small screens */}
      <div
        role="tablist"
        aria-label="Módulos del sistema"
        className="flex overflow-x-auto border-b border-slate-800 bg-slate-950 sm:hidden"
      >
        {modules.map((mod) => (
          <button
            key={mod.id}
            role="tab"
            aria-selected={mod.id === activeId}
            onClick={() => handleModuleSwitch(mod.id)}
            className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
              mod.id === activeId
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-600 hover:text-slate-400"
            }`}
          >
            {mod.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden w-36 shrink-0 border-r border-slate-800 bg-slate-950 p-3 sm:flex sm:flex-col">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-700">
            Módulos
          </p>
          <nav role="tablist" aria-label="Módulos del sistema">
            {modules.map((mod) => (
              <button
                key={mod.id}
                role="tab"
                aria-selected={mod.id === activeId}
                onClick={() => handleModuleSwitch(mod.id)}
                className={`mb-0.5 w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                  mod.id === activeId
                    ? "bg-cyan-400/10 font-medium text-cyan-400"
                    : "text-slate-600 hover:text-slate-300"
                }`}
              >
                {mod.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content — key triggers fade-in on module switch */}
        <div key={activeId} className="fade-in-quick min-w-0 flex-1 bg-slate-900 p-4">
          {/* Page header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">{active.title}</p>
              <p className="text-xs text-slate-500">{active.subtitle}</p>
            </div>
            <div className="cursor-default rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600">
              + Nuevo
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {active.metrics.map((m) => (
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

          {/* Content split: main table + side panel */}
          <div className="grid gap-3 lg:grid-cols-[1fr_176px]">
            {/* Main table */}
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="border-b border-slate-800 bg-slate-800/40 px-3 py-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  {active.tableHeader}
                </p>
              </div>
              <div className="divide-y divide-slate-800/60">
                {active.rows.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center gap-2 px-3 py-2 transition-colors hover:bg-slate-800/30"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${row.dot}`} />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                      {row.primary}
                    </span>
                    <span
                      className={`hidden w-28 shrink-0 text-xs sm:block ${row.statusColor}`}
                    >
                      {row.status}
                    </span>
                    <span className="hidden w-16 shrink-0 text-center text-xs text-slate-500 sm:block">
                      {row.col2}
                    </span>
                    <span
                      className={`w-12 shrink-0 text-right text-xs font-medium ${row.col3Color}`}
                    >
                      {row.col3}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Side panel */}
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <div className="border-b border-slate-800 bg-slate-800/40 px-3 py-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                  {active.sideHeader}
                </p>
              </div>
              <div className="divide-y divide-slate-800/60">
                {active.side.map((item) => (
                  <div key={item.id} className="px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`} />
                      <span className={`text-xs font-medium ${item.typeColor}`}>
                        {item.type}
                      </span>
                      <span className="ml-auto text-xs text-slate-700">{item.age}</span>
                    </div>
                    <p className="text-xs leading-snug text-slate-500">{item.label}</p>
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
