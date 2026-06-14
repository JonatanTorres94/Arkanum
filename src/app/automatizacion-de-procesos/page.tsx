import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Automatización de Procesos para Empresas",
  description:
    "Automatizamos procesos manuales, repetitivos o propensos a error. Reemplazamos planillas, mensajes de WhatsApp y tareas que se pueden sistematizar.",
  openGraph: {
    title: "Automatización de Procesos para Empresas | Arkanum",
    description:
      "Automatizamos procesos manuales, repetitivos o propensos a error. Reemplazamos planillas, mensajes de WhatsApp y tareas que se pueden sistematizar.",
    url: `${siteConfig.url}/automatizacion-de-procesos`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "¿Qué procesos se pueden automatizar?",
    answer:
      "En general, cualquier proceso repetitivo basado en reglas claras: gestión de pedidos, actualización de stock, generación de reportes, notificaciones internas, registros de actividad en campo y conciliación de pagos son los más comunes.",
  },
  {
    question: "¿Necesito cambiar todos mis sistemas para automatizar?",
    answer:
      "No necesariamente. En muchos casos conectamos lo que ya usás con herramientas nuevas para eliminar doble carga y reducir errores, sin reemplazar todo de una vez.",
  },
  {
    question: "¿Cuánto tarda implementar una automatización?",
    answer:
      "Depende del proceso y los sistemas involucrados. Una integración puntual puede estar lista en dos a cuatro semanas. Proyectos más amplios se planifican en etapas.",
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

const useCases = [
  { label: "Gestión de pedidos",             description: "Del WhatsApp o el papel a un sistema con trazabilidad." },
  { label: "Control de stock",               description: "Diferencias cero entre lo vendido, lo disponible y lo registrado." },
  { label: "Generación de reportes",         description: "Informes automáticos sin horas de trabajo manual." },
  { label: "Seguimiento de repartos",        description: "Estado en tiempo real de cada entrega desde el celular." },
  { label: "Registro de actividad en campo", description: "Visitas, tareas y confirmaciones desde la app del empleado." },
  { label: "Conciliación de pagos",          description: "Ventas, cobros y saldos sincronizados sin Excel de por medio." },
];

export default function AutomatizacionDeProcesosPage() {
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
              Automatización de procesos para empresas en crecimiento.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Si un proceso se repite, tarda más de lo que debería o genera errores con frecuencia,
              probablemente pueda automatizarse.
            </p>
            <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
              Diagnosticar mi proceso sin cargo
            </Button>
          </div>
        </section>

        {/* Casos de uso */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-semibold text-slate-50">
              Procesos que automatizamos habitualmente.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              No toda automatización es igual. Antes de proponer una solución, analizamos qué parte
              del proceso genera más fricción y dónde tiene sentido intervenir.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{item.label}</h3>
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
              ¿Qué procesos de tu empresa podrían automatizarse?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Contanos cómo trabajan hoy. Analizamos tu caso y te decimos si tiene sentido
              intervenir y por dónde empezar.
            </p>
            <Button href="/diagnostico" variant="primary" className="px-8 py-3.5 text-sm">
              Solicitar diagnóstico sin cargo
            </Button>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
