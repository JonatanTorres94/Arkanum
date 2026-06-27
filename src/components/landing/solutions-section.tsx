import Link from "next/link";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

const solutions = [
  {
    title: "Sistemas web administrativos",
    description:
      "Paneles internos para gestionar pedidos, clientes, stock, tareas, operaciones y reportes desde un solo lugar.",
    cases: ["Gestión de pedidos", "Control de stock", "Administración de clientes", "Reportes internos", "Paneles operativos"],
  },
  {
    title: "Apps móviles para empleados",
    description:
      "Aplicaciones para técnicos, repartidores, preventistas o personal en campo que necesita cargar datos, confirmar tareas o reportar actividad desde el celular.",
    cases: ["Registro de visitas", "Confirmación de entregas", "Carga de stock", "Control de tareas", "Actividad en campo"],
  },
  {
    title: "Dashboards de gestión",
    description:
      "Tableros claros para visualizar ventas, stock, pagos, tareas y métricas clave sin depender de reportes manuales.",
    cases: ["Indicadores de operación", "Reportes automáticos", "Seguimiento de ventas", "Control de pagos", "Métricas por período"],
  },
  {
    title: "Integraciones entre sistemas",
    description:
      "Conectamos tus herramientas actuales para evitar carga duplicada, centralizar información y reducir errores operativos.",
    cases: ["APIs externas", "Mercado Pago", "Bancos", "E-commerce", "Sistemas legacy", "Planillas existentes"],
  },
];

export function SolutionsSection() {
  return (
    <Section id="soluciones" className="bg-slate-900/40">
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          Soluciones digitales diseñadas para tu operación real.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          No partimos de una plantilla genérica. Analizamos cómo trabaja tu empresa y construimos
          herramientas adaptadas a tus procesos, tus equipos y tus objetivos.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {solutions.map((solution) => (
          <Card key={solution.title} className="flex flex-col gap-4">
            <div>
              <h3 className="mb-2 text-base font-semibold text-slate-100">{solution.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{solution.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {solution.cases.map((c) => (
                <span
                  key={c}
                  className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-400"
                >
                  {c}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10 border-t border-slate-800/60 pt-8">
        <p className="mb-3 text-sm text-slate-400">
          ¿Necesitás una plataforma operativa completa que combine dashboards, flujos de trabajo,
          soporte e integraciones en un solo sistema?
        </p>
        <Link
          href="/plataforma"
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Ver plataformas operativas a medida →
        </Link>
      </div>
    </Section>
  );
}
