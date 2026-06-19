import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Sistemas para Distribuidoras e Atacadistas",
  description:
    "Desenvolvemos sistemas de gestão sob medida para distribuidoras e empresas atacadistas. Pedidos, estoque, entregas e contas correntes em um só lugar.",
  openGraph: {
    title: "Sistemas para Distribuidoras e Atacadistas | Arkanum",
    description:
      "Desenvolvemos sistemas de gestão sob medida para distribuidoras e empresas atacadistas. Pedidos, estoque, entregas e contas correntes em um só lugar.",
    url: `${siteConfig.url}/pt-BR/sistemas-para-distribuidoras`,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/sistemas-para-distribuidoras"),
    languages: getBilingualAlternates("/sistemas-para-distribuidoras", "/pt-BR/sistemas-para-distribuidoras"),
  },
};

const faqs = [
  {
    question: "Quanto tempo leva para desenvolver o sistema?",
    answer:
      "Depende da complexidade. Um módulo de pedidos e estoque pode estar pronto em 6 a 10 semanas. Projetos com vários módulos são planejados em etapas para que você comece a operar antes de ter o sistema completo.",
  },
  {
    question: "Pode ser integrado com nota fiscal eletrônica?",
    answer:
      "Pode ser avaliado. A integração depende do sistema de emissão que você usa, se ele tem API ou mecanismos de exportação/importação, e dos requisitos fiscais aplicáveis. Definimos isso durante o diagnóstico inicial.",
  },
  {
    question: "Os entregadores podem usar pelo celular?",
    answer:
      "Sim. A parte de entregas é desenvolvida como um app mobile ou web responsivo que funciona em qualquer celular sem precisar instalar nada.",
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
    title: "Gestão de pedidos de clientes",
    description: "Da entrada do pedido até a preparação e o despacho, com rastreabilidade de cada etapa.",
  },
  {
    title: "Controle de estoque",
    description: "Entradas, saídas, estoque mínimo e alertas antes de você ficar sem mercadoria.",
  },
  {
    title: "Acompanhamento de entregas",
    description: "Status de cada entrega em tempo real, do carregamento até a confirmação do cliente.",
  },
  {
    title: "Histórico de clientes",
    description: "Preços por cliente, condições de pagamento e registro de compras anteriores em um só lugar.",
  },
  {
    title: "Conciliação de pagamentos",
    description: "Contas correntes, pagamentos parciais e saldos sem depender de planilhas compartilhadas.",
  },
  {
    title: "Relatórios operacionais",
    description: "Movimentos de estoque, vendas por período e desempenho por região ou vendedor.",
  },
];

const relatedPages = [
  {
    href: "/pt-BR/sistemas-de-estoque",
    label: "Sistemas de controle de estoque",
    description: "Entradas, saídas, alertas e múltiplos depósitos sem Excel.",
  },
  {
    href: "/pt-BR/software-sob-medida",
    label: "Software sob medida",
    description: "Sistemas web, apps mobile e integrações construídas para a sua operação real.",
  },
];

export default function SistemasParaDistribuidorasPtBRPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader locale="pt-BR" />
      <main>

        {/* Hero */}
        <section className="border-b border-slate-800 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/pt-BR"
              className="mb-8 inline-flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              ← Início
            </Link>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Sistemas de gestão para distribuidoras e atacadistas.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Quando o negócio cresce, gerenciar pedidos, estoque e entregas por WhatsApp e
              planilhas se torna insustentável. Desenvolvemos sistemas sob medida que organizam a
              operação sem substituir o que já funciona.
            </p>
            <Link
              href="/pt-BR/diagnostico"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Diagnosticar meu processo sem custo
            </Link>
          </div>
        </section>

        {/* Capacidades */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-semibold text-slate-50">
              O que desenvolvemos para distribuidoras.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Não partimos de um template genérico. Analisamos como a sua distribuidora opera e
              construímos o que você precisa — nem mais, nem menos.
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
            <h2 className="mb-10 text-2xl font-semibold text-slate-50">Perguntas frequentes.</h2>
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
            <h2 className="mb-6 text-lg font-semibold text-slate-50">Também pode te interessar.</h2>
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
              Como a sua distribuidora trabalha hoje?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte o processo. Analisamos se uma solução sob medida faz sentido para a sua
              operação e por onde começar.
            </p>
            <Link
              href="/pt-BR/diagnostico"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Solicitar diagnóstico sem custo
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
