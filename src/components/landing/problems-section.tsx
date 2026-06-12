import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

const problems = [
  {
    title: "Excel descontrolado",
    description:
      "Planillas difíciles de mantener, datos duplicados y fórmulas que nadie quiere tocar.",
  },
  {
    title: "Pedidos por WhatsApp",
    description:
      "Información dispersa, mensajes perdidos y poca trazabilidad sobre lo que realmente pasó.",
  },
  {
    title: "Stock sin control",
    description:
      "Diferencias entre lo vendido, lo disponible y lo registrado en el sistema.",
  },
  {
    title: "Reportes manuales",
    description:
      "Horas perdidas armando informes que deberían generarse automáticamente.",
  },
  {
    title: "Sistemas desconectados",
    description:
      "Herramientas que no se hablan entre sí y obligan a cargar la misma información más de una vez.",
  },
  {
    title: "Empleados sin app operativa",
    description:
      "Personal en calle, depósito o reparto sin una herramienta móvil clara para registrar actividad.",
  },
];

export function ProblemsSection() {
  return (
    <Section id="problemas" className="bg-slate-950">
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          Cuando la operación crece, las herramientas improvisadas empiezan a fallar.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          Excel, WhatsApp y los sistemas viejos pueden funcionar al principio. Pero cuando aumentan
          los pedidos, el stock, los empleados o la administración, empiezan los errores, la carga
          duplicada y la falta de control.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.title}>
            <h3 className="mb-2 text-sm font-semibold text-slate-100">{problem.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{problem.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
