import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServicePageCtaButton } from "@/components/ui/tracked-cta-button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sistemas de Control de Stock para Empresas",
  description:
    "Desarrollamos sistemas de control de stock a medida. Entradas, salidas, stock mínimo, múltiples depósitos y reportes sin depender de planillas de Excel.",
  openGraph: {
    title: "Sistemas de Control de Stock para Empresas | Arkanum",
    description:
      "Desarrollamos sistemas de control de stock a medida. Entradas, salidas, stock mínimo, múltiples depósitos y reportes sin depender de planillas de Excel.",
    url: `${siteConfig.url}/sistemas-de-stock`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "¿El sistema puede manejar múltiples depósitos?",
    answer:
      "Sí. El sistema puede mostrar el stock por depósito o sucursal y permitir transferencias entre ellos con registro de cada movimiento.",
  },
  {
    question: "¿Cómo se actualiza el stock cuando se hace una venta?",
    answer:
      "El sistema se conecta con el módulo de ventas o pedidos. Cuando se confirma una operación, el stock se actualiza automáticamente sin intervención manual.",
  },
  {
    question: "¿Podemos importar el inventario actual desde Excel?",
    answer:
      "Sí. Hacemos la carga inicial desde tu planilla existente para que no tengas que ingresar todo de nuevo. El proceso de migración lo coordinamos durante la implementación.",
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
    title: "Registro de entradas y salidas",
    description: "Cada movimiento queda registrado con fecha, responsable y motivo. Sin fórmulas manuales ni riesgo de sobreescritura.",
  },
  {
    title: "Alertas de stock mínimo",
    description: "El sistema avisa cuando un producto cae por debajo del umbral definido, antes de que afecte la operación.",
  },
  {
    title: "Control por depósito o sucursal",
    description: "Para empresas con más de un punto de stock: visibilidad consolidada y detalle por ubicación.",
  },
  {
    title: "Trazabilidad por lote o serie",
    description: "Para productos con vencimientos, garantías o identificación individual que requieren seguimiento específico.",
  },
  {
    title: "Integración con pedidos y ventas",
    description: "Cuando se confirma un pedido o venta, el stock se descuenta automáticamente sin pasos manuales.",
  },
  {
    title: "Reportes de movimientos",
    description: "Historial completo, valorización de inventario y análisis de rotación por período.",
  },
];

const relatedPages = [
  {
    href: "/sistemas-para-distribuidoras",
    label: "Sistemas para distribuidoras",
    description: "Pedidos, repartos y cuentas corrientes integrados con el control de stock.",
  },
  {
    href: "/software-a-medida",
    label: "Software a medida",
    description: "Sistemas web, apps móviles e integraciones construidas para tu operación real.",
  },
];

export default function SistemasDeStockPage() {
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
              Sistemas de control de stock para empresas que ya superaron Excel.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Cuando el inventario se maneja en planillas compartidas, los errores, los descuadres
              y la falta de visibilidad en tiempo real son inevitables. Construimos sistemas que se
              adaptan a tu operación específica.
            </p>
            <ServicePageCtaButton
              page="sistemas-de-stock"
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
              Qué desarrollamos para control de stock.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Antes de proponer una solución, analizamos cómo funciona tu inventario hoy y dónde
              se generan los problemas reales.
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
              ¿Cómo controlás el stock hoy?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Contanos qué herramientas usás y qué problemas genera. Revisamos si un sistema a
              medida tiene sentido para tu caso.
            </p>
            <ServicePageCtaButton
              page="sistemas-de-stock"
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
