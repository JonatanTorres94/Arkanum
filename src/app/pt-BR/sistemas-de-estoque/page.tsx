import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Sistemas de Controle de Estoque para Empresas",
  description:
    "Desenvolvemos sistemas de controle de estoque sob medida. Entradas, saídas, estoque mínimo, múltiplos depósitos e relatórios sem depender de planilhas de Excel.",
  openGraph: {
    title: "Sistemas de Controle de Estoque para Empresas | Arkanum",
    description:
      "Desenvolvemos sistemas de controle de estoque sob medida. Entradas, saídas, estoque mínimo, múltiplos depósitos e relatórios sem depender de planilhas de Excel.",
    url: `${siteConfig.url}/pt-BR/sistemas-de-estoque`,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/sistemas-de-estoque"),
    languages: getBilingualAlternates("/sistemas-de-stock", "/pt-BR/sistemas-de-estoque"),
  },
};

const faqs = [
  {
    question: "O sistema pode gerenciar múltiplos depósitos?",
    answer:
      "Sim. O sistema pode mostrar o estoque por depósito ou filial e permitir transferências entre eles com registro de cada movimento.",
  },
  {
    question: "Como o estoque é atualizado quando uma venda é feita?",
    answer:
      "O sistema se conecta com o módulo de vendas ou pedidos. Quando uma operação é confirmada, o estoque é atualizado automaticamente sem intervenção manual.",
  },
  {
    question: "Podemos importar o inventário atual do Excel?",
    answer:
      "Sim. Fazemos a carga inicial a partir da sua planilha existente para que você não precise digitar tudo de novo. O processo de migração é coordenado durante a implementação.",
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
    title: "Registro de entradas e saídas",
    description: "Cada movimento fica registrado com data, responsável e motivo. Menos dependência de fórmulas manuais e planilhas compartilhadas.",
  },
  {
    title: "Alertas de estoque mínimo",
    description: "O sistema avisa quando um produto fica abaixo do limite definido, antes que afete a operação.",
  },
  {
    title: "Controle por depósito ou filial",
    description: "Para empresas com mais de um ponto de estoque: visibilidade consolidada e detalhe por localização.",
  },
  {
    title: "Rastreabilidade por lote ou série",
    description: "Para produtos com validade, garantia ou identificação individual que exigem acompanhamento específico.",
  },
  {
    title: "Integração com pedidos e vendas",
    description: "Quando um pedido ou venda é confirmado, o estoque é baixado automaticamente sem etapas manuais.",
  },
  {
    title: "Relatórios de movimentos",
    description: "Histórico completo, valorização de inventário e análise de giro por período.",
  },
];

const relatedPages = [
  {
    href: "/pt-BR/sistemas-para-distribuidoras",
    label: "Sistemas para distribuidoras",
    description: "Pedidos, entregas e contas correntes integrados ao controle de estoque.",
  },
  {
    href: "/pt-BR/software-sob-medida",
    label: "Software sob medida",
    description: "Sistemas web, apps mobile e integrações construídas para a sua operação real.",
  },
];

export default function SistemasDeEstoquePage() {
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
              Sistemas de controle de estoque para empresas que já superaram o Excel.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Quando o inventário é gerenciado em planilhas compartilhadas, erros, divergências e
              a falta de visibilidade em tempo real são inevitáveis. Construímos sistemas que se
              adaptam à sua operação específica.
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
              O que desenvolvemos para controle de estoque.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Antes de propor uma solução, analisamos como o seu inventário funciona hoje e onde
              os problemas reais acontecem.
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
              Como você controla o estoque hoje?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte quais ferramentas você usa e quais problemas isso gera. Analisamos se um
              sistema sob medida faz sentido para o seu caso.
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
