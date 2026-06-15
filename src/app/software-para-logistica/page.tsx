import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServicePageCtaButton } from "@/components/ui/tracked-cta-button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Software para Logística y Repartos",
  description:
    "Desarrollamos software a medida para empresas de logística, repartos y distribución. Seguimiento de entregas, apps para choferes y gestión de órdenes sin planillas.",
  openGraph: {
    title: "Software para Logística y Repartos | Arkanum",
    description:
      "Desarrollamos software a medida para empresas de logística, repartos y distribución. Seguimiento de entregas, apps para choferes y gestión de órdenes sin planillas.",
    url: `${siteConfig.url}/software-para-logistica`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "¿La app para choferes funciona sin conexión a internet?",
    answer:
      "Depende del caso. Para zonas con conectividad limitada desarrollamos versiones con modo offline que sincronizan cuando recuperan señal. Lo evaluamos en el diagnóstico inicial según dónde opera tu equipo.",
  },
  {
    question: "¿Puede adaptarse a distintos tipos de reparto?",
    answer:
      "Sí. Diseñamos el sistema según cómo funciona tu operación: reparto programado, urgente, por temperatura o con requisitos especiales de documentación o confirmación.",
  },
  {
    question: "¿Qué pasa si el cliente no está al momento de la entrega?",
    answer:
      "El sistema puede registrar el intento, generar una novedad automática y facilitar la reprogramación según tu proceso actual. Cada caso tiene lógica propia que definimos juntos.",
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

const capabilities = [
  {
    title: "Gestión de órdenes de entrega",
    description: "Alta de pedidos, asignación a choferes y seguimiento del estado de cada entrega desde un panel central.",
  },
  {
    title: "App para personal en campo",
    description: "Herramienta móvil para que choferes y operadores registren actividad, confirmaciones y novedades desde el celular.",
  },
  {
    title: "Confirmación de entrega",
    description: "Firma digital, foto o código para registrar la entrega y generar el comprobante automáticamente.",
  },
  {
    title: "Seguimiento en tiempo real",
    description: "El equipo de oficina ve el estado de cada reparto sin necesidad de llamadas ni mensajes de WhatsApp.",
  },
  {
    title: "Reportes de desempeño",
    description: "Entregas por chofer, por zona, por período y análisis de demoras o incidentes.",
  },
  {
    title: "Integración con pedidos",
    description: "El módulo de repartos puede conectarse con el de gestión de pedidos para evitar reingreso de datos.",
  },
];

const relatedPages = [
  {
    href: "/automatizacion-de-procesos",
    label: "Automatización de procesos",
    description: "Reemplazamos tareas manuales y procesos repetitivos por herramientas que trabajan solas.",
  },
  {
    href: "/sistemas-para-distribuidoras",
    label: "Sistemas para distribuidoras",
    description: "Pedidos, stock, repartos y cuentas corrientes en un solo lugar.",
  },
];

export default function SoftwareParaLogisticaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader />
      <main>

        {/* Hero */}
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              ← Inicio
            </Link>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Software para operaciones de logística y repartos.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Gestionar rutas, confirmar entregas y coordinar choferes por WhatsApp genera errores
              y pérdida de información. Construimos herramientas que se adaptan a tu operación,
              no al revés.
            </p>
            <ServicePageCtaButton
              page="software-para-logistica"
              variant="primary"
              className="px-8 py-3.5 text-sm"
            >
              Diagnosticar mi proceso sin cargo
            </ServicePageCtaButton>
          </div>
        </section>

        {/* Capacidades */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-semibold text-slate-50">
              Qué desarrollamos para logística.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Analizamos tu operación actual antes de proponer una solución. El objetivo es
              reemplazar lo que genera fricciones, no todo el proceso.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((item) => (
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

        {/* Páginas relacionadas */}
        <section className="border-t border-slate-800 px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-lg font-semibold text-slate-50">También puede interesarte.</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
                >
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-100 transition-colors group-hover:text-cyan-400">
                    {page.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-slate-50">
              ¿Cómo coordinás tus repartos hoy?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Contanos cómo funciona tu operación. Revisamos si tiene sentido construir una
              herramienta a medida y por dónde empezar.
            </p>
            <ServicePageCtaButton
              page="software-para-logistica"
              variant="primary"
              className="px-8 py-3.5 text-sm"
            >
              Solicitar diagnóstico sin cargo
            </ServicePageCtaButton>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
