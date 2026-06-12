import { Section } from "@/components/ui/section";

const cases = [
  "Control de stock y pedidos",
  "Seguimiento de repartos",
  "Registro de visitas o tareas en campo",
  "Panel de administración interno",
  "Conciliación de ventas y pagos",
  "Reportes automáticos para dirección",
  "Modernización de sistemas antiguos",
  "Centralización de información dispersa",
];

export function UseCasesSection() {
  return (
    <Section id="casos" className="bg-slate-950">
      <div className="mb-10">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          Casos donde Arkanum puede ayudarte.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          Si un proceso se repite, depende de carga manual o genera errores frecuentes,
          probablemente pueda automatizarse o mejorarse.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            <span className="text-sm leading-relaxed text-slate-300">{item}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
