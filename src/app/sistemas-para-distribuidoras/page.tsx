import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServicePageCtaButton } from "@/components/ui/tracked-cta-button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Sistemas para Distribuidoras y Mayoristas",
  description:
    "Desarrollamos sistemas de gestión a medida para distribuidoras y empresas mayoristas. Pedidos, stock, repartos y cuentas corrientes en un solo lugar.",
  openGraph: {
    title: "Sistemas para Distribuidoras y Mayoristas | Arkanum",
    description:
      "Desarrollamos sistemas de gestión a medida para distribuidoras y empresas mayoristas. Pedidos, stock, repartos y cuentas corrientes en un solo lugar.",
    url: `${siteConfig.url}/sistemas-para-distribuidoras`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "¿Cuánto tarda desarrollar el sistema?",
    answer:
      "Depende de la complejidad. Un módulo de pedidos y stock puede estar listo en 6 a 10 semanas. Proyectos con múltiples módulos se planifican en etapas para que empieces a operar antes de tener el sistema completo.",
  },
  {
    question: "¿Puede integrarse con facturación electrónica?",
    answer:
      "Puede evaluarse. La integración depende del sistema de facturación que uses, de si tiene API o mecanismos de exportación/importación, y de los requisitos fiscales aplicables. Lo definimos durante el diagnóstico inicial.",
  },
  {
    question: "¿Los repartidores pueden usarlo desde el celular?",
    answer:
      "Sí. La parte de repartos se desarrolla como una app móvil o web responsive que funciona desde cualquier teléfono sin necesidad de instalar nada.",
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
    title: "Gestión de pedidos de clientes",
    description: "Del ingreso del pedido a la preparación y el despacho, con trazabilidad de cada etapa.",
  },
  {
    title: "Control de stock",
    description: "Entradas, salidas, stock mínimo y alertas antes de quedarte sin mercadería.",
  },
  {
    title: "Seguimiento de repartos",
    description: "Estado de cada entrega en tiempo real, desde la carga hasta la confirmación del cliente.",
  },
  {
    title: "Historial de clientes",
    description: "Precios por cliente, condiciones de pago y registro de compras anteriores en un solo lugar.",
  },
  {
    title: "Conciliación de pagos",
    description: "Cuentas corrientes, pagos parciales y saldos sin depender de planillas compartidas.",
  },
  {
    title: "Reportes operativos",
    description: "Movimientos de stock, ventas por período y desempeño por zona o vendedor.",
  },
];

const relatedPages = [
  {
    href: "/sistemas-de-stock",
    label: "Sistemas de control de stock",
    description: "Entradas, salidas, alertas y múltiples depósitos sin Excel.",
  },
  {
    href: "/software-a-medida",
    label: "Software a medida",
    description: "Sistemas web, apps móviles e integraciones construidas para tu operación real.",
  },
];

export default function SistemasParaDistribuidorasPage() {
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
              Sistemas de gestión para distribuidoras y mayoristas.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Cuando el negocio crece, gestionar pedidos, stock y repartos por WhatsApp y planillas
              se vuelve insostenible. Desarrollamos sistemas a medida que ordenan la operación sin
              reemplazar lo que ya funciona.
            </p>
            <ServicePageCtaButton
              page="sistemas-para-distribuidoras"
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
              Qué desarrollamos para distribuidoras.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              No partimos de un template genérico. Analizamos cómo opera tu distribuidora y
              construimos lo que necesitás — ni más, ni menos.
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
              ¿Cómo trabaja tu distribuidora hoy?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Contanos el proceso. Revisamos si una solución a medida tiene sentido para tu
              operación y por dónde empezar.
            </p>
            <ServicePageCtaButton
              page="sistemas-para-distribuidoras"
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
