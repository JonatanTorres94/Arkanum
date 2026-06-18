import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServicePageCtaButton } from "@/components/ui/tracked-cta-button";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Software a Medida para Empresas",
  description:
    "Desarrollamos software a medida para empresas que crecieron más allá de las planillas y los sistemas genéricos. Sin templates, sin funciones que no usás.",
  openGraph: {
    title: "Software a Medida para Empresas | Arkanum",
    description:
      "Desarrollamos software a medida para empresas que crecieron más allá de las planillas y los sistemas genéricos. Sin templates, sin funciones que no usás.",
    url: `${siteConfig.url}/software-a-medida`,
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    languages: getBilingualAlternates("/software-a-medida", "/pt-BR/software-sob-medida"),
  },
};

const faqs = [
  {
    question: "¿Cuánto tarda desarrollar software a medida?",
    answer:
      "Depende de la complejidad. Un módulo funcional puede estar listo en 4 a 8 semanas. Proyectos más amplios se planifican en etapas para que empieces a operar antes de tener el sistema completo.",
  },
  {
    question: "¿Qué pasa si cambian mis necesidades durante el desarrollo?",
    answer:
      "Es parte del proceso. Trabajamos de forma iterativa y ajustamos el alcance según lo que va apareciendo en la operación real.",
  },
  {
    question: "¿Necesito saber programación para trabajar con Arkanum?",
    answer:
      "No. El proceso empieza por entender tu operación, no por asumir que ya sabés qué solución necesitás.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const softwareTypes = [
  {
    title: "Sistemas web administrativos",
    description:
      "Paneles para gestionar pedidos, clientes, stock, tareas y reportes desde un solo lugar.",
  },
  {
    title: "Apps móviles para empleados",
    description:
      "Herramientas para personal en campo, repartidores o técnicos que necesitan registrar actividad desde el celular.",
  },
  {
    title: "Dashboards de gestión",
    description:
      "Tableros para visualizar ventas, pagos, stock y métricas clave sin depender de reportes manuales.",
  },
  {
    title: "Integraciones entre sistemas",
    description:
      "Conectamos tus herramientas actuales para eliminar carga duplicada y centralizar información.",
  },
];

export default function SoftwareAMedidaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />
      <main>

        {/* Hero */}
        <section className="px-6 pb-20 pt-16 md:pt-24">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="mb-6 inline-block text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Inicio
            </Link>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Software a medida para tu empresa.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Las herramientas genéricas funcionan hasta cierto punto. Cuando tu operación crece,
              los parches empiezan a costar más que una solución construida para vos.
            </p>
            <ServicePageCtaButton page="software-a-medida" variant="primary" className="px-8 py-3.5 text-sm">
              Diagnosticar mi proceso sin cargo
            </ServicePageCtaButton>
          </div>
        </section>

        {/* Qué construimos */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-semibold text-slate-50">
              Qué tipo de software desarrollamos.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              No partimos de un template. Analizamos tu operación y construimos exactamente lo que
              necesitás — ni más ni menos.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {softwareTypes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <h3 className="mb-2 text-sm font-semibold text-slate-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-2xl font-semibold text-slate-50">Preguntas frecuentes.</h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="mb-2 text-sm font-semibold text-slate-100">{faq.question}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-slate-50">
              ¿Tiene sentido construir algo a medida para tu caso?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Primero entendemos tu operación. Si una solución a medida tiene sentido, te lo
              decimos. Si no, también.
            </p>
            <ServicePageCtaButton page="software-a-medida" variant="primary" className="px-8 py-3.5 text-sm">
              Solicitar diagnóstico sin cargo
            </ServicePageCtaButton>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
