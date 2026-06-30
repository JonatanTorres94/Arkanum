const problems = [
  {
    heading: "Procesos dispersos en herramientas que no se conectan",
    body: "WhatsApp, Excel, correos, sistemas legacy y apps separadas. La información existe pero está fragmentada: nadie tiene el cuadro completo de la operación en tiempo real.",
  },
  {
    heading: "Sin trazabilidad entre áreas comerciales, operativas y de soporte",
    body: "Lo que se vende, lo que se entrega y lo que se resuelve vive en mundos distintos. Los errores y demoras se detectan tarde porque no hay un sistema compartido.",
  },
  {
    heading: "Trabajo manual que podría estar automatizado",
    body: "Carga duplicada, reportes que se arman a mano, actualizaciones de estado por teléfono. Tareas que podrían ejecutarse solas consumen tiempo de personas.",
  },
  {
    heading: "Sin visibilidad del estado real del negocio",
    body: "No hay un dashboard único que muestre el estado operativo actual: proyectos en curso, tickets abiertos, entregas pendientes, alertas activas. Las decisiones se toman a ciegas.",
  },
  {
    heading: "Sistemas que no se hablan entre sí",
    body: "El sistema de facturación no conecta con el de stock. El ERP no exporta al CRM. El app del campo no sincroniza con la oficina. Cada integración es un proyecto manual.",
  },
  {
    heading: "Hardware o datos de campo sin integración de software",
    body: "Sensores, lectores de código, terminales móviles, GPS, balanzas. Equipos que generan datos valiosos que no llegan al sistema porque no hay software que los integre.",
  },
];

import { Card } from "@/components/ui/card";

export function PlatformProblem() {
  return (
    <section id="problema" className="px-6 py-24 border-t border-slate-800/60">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-cyan-400">
            El problema
          </p>
          <h2 className="mb-4 text-3xl font-semibold leading-tight text-slate-50 md:text-4xl">
            Las empresas que escalan sin sistema propio acumulan fricción
          </h2>
          <p className="text-slate-400">
            No es un problema de personas. Es un problema de infraestructura operativa: no existe
            un sistema diseñado alrededor del proceso real del negocio.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((p) => (
            <Card key={p.heading}>
              <h3 className="mb-2 font-medium text-slate-100">{p.heading}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{p.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
