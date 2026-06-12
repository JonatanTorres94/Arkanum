import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

const points = [
  {
    title: "Arquitectura limpia y modular",
    description: "Código organizado, separado por responsabilidades y fácil de mantener o ampliar.",
  },
  {
    title: "Bases de datos diseñadas con criterio",
    description: "Estructura pensada para la operación real, no para el ejemplo del tutorial.",
  },
  {
    title: "Control de accesos y seguridad desde el inicio",
    description: "Roles, permisos y validaciones aplicados desde el primer día, no como un parche posterior.",
  },
  {
    title: "Integraciones encapsuladas",
    description: "Cada servicio externo está aislado. Cambiar un proveedor no obliga a reescribir el sistema.",
  },
  {
    title: "Documentación técnica y funcional",
    description: "El sistema queda documentado para que cualquier desarrollador pueda retomarlo.",
  },
  {
    title: "Preparado para evolución futura",
    description: "La solución puede crecer junto con tu empresa sin necesitar reconstruirse desde cero.",
  },
];

export function TrustSection() {
  return (
    <Section className="bg-slate-950">
      <div className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
          Software pensado para crecer, no para romperse a los dos meses.
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-400">
          Trabajamos con arquitectura clara, validaciones, control de accesos, bases de datos
          robustas y documentación. La solución debe ser útil hoy y mantenible mañana.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <Card key={point.title}>
            <h3 className="mb-2 text-sm font-semibold text-slate-100">{point.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{point.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}
