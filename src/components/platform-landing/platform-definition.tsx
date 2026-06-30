import { Section } from "@/components/ui/section";
import { PremiumCard } from "@/components/public/premium-card";
import { SectionEyebrow } from "@/components/public/section-eyebrow";
import { GradientTitle } from "@/components/public/gradient-title";

const principles = [
  {
    title: "Diseñada para tu operación real",
    body: "No adaptamos una plantilla. Analizamos cómo trabaja tu empresa y construimos el sistema que refleja ese proceso.",
  },
  {
    title: "Integrada con lo que ya tenés",
    body: "ERP, sistemas legacy, hardware de campo, APIs externas. La plataforma conecta con lo existente en lugar de reemplazarlo todo.",
  },
  {
    title: "Preparada para crecer",
    body: "Arquitectura limpia, documentación y control de accesos. Un sistema que evoluciona sin reescribirse desde cero.",
  },
];

export function PlatformDefinition() {
  return (
    <Section id="que-es" className="bg-slate-950">
      <div className="mb-12 max-w-3xl">
        <SectionEyebrow>Qué es una plataforma operativa</SectionEyebrow>

        <GradientTitle as="h2" className="mb-4 text-2xl font-semibold leading-snug md:text-3xl">
          Una plataforma operativa no es una pantalla aislada.
        </GradientTitle>

        <p className="text-base leading-relaxed text-slate-400">
          Es el lugar donde procesos, datos, equipos y decisiones empiezan a trabajar conectados.
          No es un CRM genérico ni un ERP ni un dashboard estático. Es el sistema operativo de
          tu empresa, construido desde tu proceso real.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {principles.map((p) => (
          <PremiumCard key={p.title}>
            <h3 className="mb-2 font-semibold text-slate-100">{p.title}</h3>
            <p className="text-sm leading-relaxed text-slate-400">{p.body}</p>
          </PremiumCard>
        ))}
      </div>
    </Section>
  );
}
