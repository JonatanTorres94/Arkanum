const modules = [
  {
    name: "Dashboard operativo",
    description:
      "Vista unificada del estado real del negocio: proyectos, tareas, clientes, alertas y métricas clave. Configurable según los datos que importan en cada operación.",
  },
  {
    name: "Gestión de clientes y procesos",
    description:
      "Módulo central para registrar clientes, oportunidades y procesos asociados. En empresas de servicios puede operar como CRM; en otros contextos, como gestión de cuentas o contratos.",
  },
  {
    name: "Flujos de trabajo",
    description:
      "Secuencias de estados y tareas adaptadas al proceso real. Para una empresa de software/servicios: proyectos, work items y soporte. Para logística: viajes, cargas y entregas.",
  },
  {
    name: "Integraciones entre sistemas",
    description:
      "Conexiones con ERP, facturación, e-commerce, hardware, APIs externas o sistemas legacy. La plataforma actúa como hub operativo sin reemplazar lo que ya funciona.",
  },
  {
    name: "Automatización",
    description:
      "Reglas automáticas que actualizan estados, envían alertas, crean tareas o sincronizan datos sin intervención manual. El sistema trabaja mientras el equipo se enfoca en lo importante.",
  },
  {
    name: "Reportes y trazabilidad",
    description:
      "Historial completo de cada entidad del sistema. Quién hizo qué, cuándo y por qué. Reportes por período, cliente, área o proceso para tomar decisiones con datos reales.",
  },
];

export function PlatformModules() {
  return (
    <section id="modulos" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            Capacidades
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Los bloques que se combinan para cubrir tu operación
          </h2>
          <p className="text-slate-400">
            Cada plataforma se construye seleccionando y adaptando las capacidades que la operación
            requiere. No todos los módulos aplican a todos los clientes.
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
