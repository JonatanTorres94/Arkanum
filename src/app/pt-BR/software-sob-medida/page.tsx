import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Software sob Medida para Empresas",
  description:
    "Desenvolvemos software sob medida para empresas que cresceram além das planilhas e dos sistemas genéricos. Sem templates, sem funcionalidades que você não usa.",
  openGraph: {
    title: "Software sob Medida para Empresas | Arkanum",
    description:
      "Desenvolvemos software sob medida para empresas que cresceram além das planilhas e dos sistemas genéricos. Sem templates, sem funcionalidades que você não usa.",
    url: `${siteConfig.url}/pt-BR/software-sob-medida`,
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/software-sob-medida"),
    languages: getBilingualAlternates("/software-a-medida", "/pt-BR/software-sob-medida"),
  },
};

const faqs = [
  {
    question: "Quanto tempo leva para desenvolver software sob medida?",
    answer:
      "Depende da complexidade. Um módulo funcional pode estar pronto em 4 a 8 semanas. Projetos maiores são planejados em etapas para que você comece a operar antes de ter o sistema completo.",
  },
  {
    question: "O que acontece se as minhas necessidades mudarem durante o desenvolvimento?",
    answer:
      "Faz parte do processo. Trabalhamos de forma iterativa e ajustamos o escopo conforme o que vai surgindo na operação real.",
  },
  {
    question: "Preciso saber programação para trabalhar com a Arkanum?",
    answer:
      "Não. O processo começa por entender sua operação, não por assumir que você já sabe qual solução precisa.",
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
    title: "Sistemas web administrativos",
    description:
      "Painéis para gerenciar pedidos, clientes, estoque, tarefas e relatórios em um único lugar.",
  },
  {
    title: "Apps mobile para colaboradores",
    description:
      "Ferramentas para equipe em campo, entregadores ou técnicos que precisam registrar atividade pelo celular.",
  },
  {
    title: "Dashboards de gestão",
    description:
      "Painéis para visualizar vendas, pagamentos, estoque e métricas-chave sem depender de relatórios manuais.",
  },
  {
    title: "Integrações entre sistemas",
    description:
      "Conectamos suas ferramentas atuais para eliminar trabalho duplicado e centralizar informações.",
  },
];

export default function SoftwareSobMedidaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteHeader locale="pt-BR" />
      <main>

        {/* Hero */}
        <section className="px-6 pb-20 pt-16 md:pt-24">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/pt-BR"
              className="mb-6 inline-block text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              ← Início
            </Link>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Software sob medida para a sua empresa.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              As ferramentas genéricas funcionam até certo ponto. Quando sua operação cresce, os
              remendos começam a custar mais do que uma solução construída para você.
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
              Que tipo de software desenvolvemos.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Não partimos de um template. Analisamos sua operação e construímos exatamente o que
              você precisa — nem mais, nem menos.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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

        {/* CTA */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-slate-50">
              Faz sentido construir algo sob medida para o seu caso?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Primeiro entendemos sua operação. Se uma solução sob medida faz sentido, te dizemos.
              Se não, também.
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
