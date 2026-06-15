import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ServicePageCtaButton } from "@/components/ui/tracked-cta-button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Automatización para Empresas que Operan por WhatsApp",
  description:
    "Reemplazamos la gestión manual por WhatsApp con sistemas que capturan, registran y procesan pedidos sin depender de chats dispersos y planillas.",
  openGraph: {
    title: "Automatización para Empresas que Operan por WhatsApp | Arkanum",
    description:
      "Reemplazamos la gestión manual por WhatsApp con sistemas que capturan, registran y procesan pedidos sin depender de chats dispersos y planillas.",
    url: `${siteConfig.url}/automatizacion-con-whatsapp`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    question: "¿Hay que dejar de usar WhatsApp completamente?",
    answer:
      "No necesariamente. En algunos casos mantenemos WhatsApp para comunicación y construimos el sistema solo para la gestión de pedidos y registro. Depende de cómo opera tu equipo y qué querés ordenar.",
  },
  {
    question: "¿Cómo lo adoptan los clientes acostumbrados a pedir por WhatsApp?",
    answer:
      "El proceso de adopción depende del perfil de tus clientes. Algunos casos permiten mantener WhatsApp como canal de contacto y capturar los pedidos en el sistema desde el lado interno. Otros requieren un formulario simple que los clientes usen directamente. Lo evaluamos en el diagnóstico.",
  },
  {
    question: "¿Cuánto tiempo lleva implementar algo así?",
    answer:
      "Un módulo de captura de pedidos y panel de gestión básico puede estar listo en 4 a 8 semanas. Empezamos por el flujo principal y agregamos funcionalidad en etapas según lo que muestra la operación real.",
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
    title: "Captura de pedidos por formulario",
    description: "En lugar de recibir pedidos por chat, los clientes los ingresan en una interfaz clara que genera registros automáticos.",
  },
  {
    title: "Panel de gestión para el equipo",
    description: "El equipo ve los pedidos en curso, los estados y las novedades sin revisar conversaciones de WhatsApp.",
  },
  {
    title: "Notificaciones automáticas",
    description: "El cliente recibe confirmación, actualizaciones de estado y comprobante sin intervención manual del equipo.",
  },
  {
    title: "Historial y trazabilidad",
    description: "Cada pedido, interacción y estado queda registrado y es recuperable. Sin búsquedas en chats o archivos adjuntos.",
  },
  {
    title: "Integración con stock",
    description: "Cuando se confirma un pedido, el sistema puede descontar el inventario y alertar sobre faltantes.",
  },
  {
    title: "Acceso diferenciado por rol",
    description: "El vendedor ve sus pedidos, el depósito ve la preparación, la administración ve el consolidado.",
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
    description: "Pedidos, stock y repartos integrados para empresas mayoristas.",
  },
];

export default function AutomatizacionConWhatsappPage() {
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
              Sistemas para empresas que gestionan todo por WhatsApp.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              WhatsApp funciona para comunicarse, no para gestionar una operación. Cuando los
              pedidos, confirmaciones y novedades se mezclan en chats, algo siempre se pierde.
              Construimos sistemas que ordenan el proceso sin pedir a tus clientes o empleados
              que cambien demasiado.
            </p>
            <ServicePageCtaButton
              page="automatizacion-con-whatsapp"
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
              Qué reemplazamos o estructuramos.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              No proponemos abandonar WhatsApp de golpe. Identificamos qué parte del proceso
              genera más problemas y empezamos por ahí.
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
              ¿Cuánto de tu operación pasa por WhatsApp hoy?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Contanos cómo funciona el proceso. Evaluamos qué tiene sentido digitalizar y por
              dónde empezar.
            </p>
            <ServicePageCtaButton
              page="automatizacion-con-whatsapp"
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
