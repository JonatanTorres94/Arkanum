import Link from "next/link";
import { Section } from "@/components/ui/section";

const services = [
  {
    href:        "/software-a-medida",
    label:       "Software a medida",
    description: "Sistemas web, apps móviles e integraciones construidas para tu operación real.",
  },
  {
    href:        "/automatizacion-de-procesos",
    label:       "Automatización de procesos",
    description: "Reemplazamos planillas, tareas manuales y procesos repetitivos por herramientas que trabajan solas.",
  },
];

export function ServiceLinksSection() {
  return (
    <Section className="bg-slate-950">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-50">Nuestras áreas de trabajo.</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="group flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
          >
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
              {service.label}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">{service.description}</p>
            <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
              Ver más →
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
