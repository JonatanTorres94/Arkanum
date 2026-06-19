import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Software para Logística e Entregas",
  description:
    "Desenvolvemos software sob medida para empresas de logística, entregas e distribuição. Acompanhamento de entregas, apps para motoristas e gestão de pedidos sem planilhas.",
  openGraph: {
    title: "Software para Logística e Entregas | Arkanum",
    description:
      "Desenvolvemos software sob medida para empresas de logística, entregas e distribuição. Acompanhamento de entregas, apps para motoristas e gestão de pedidos sem planilhas.",
    url: `${siteConfig.url}/pt-BR/software-para-logistica`,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/software-para-logistica"),
    languages: getBilingualAlternates("/software-para-logistica", "/pt-BR/software-para-logistica"),
  },
};

const faqs = [
  {
    question: "O app para motoristas funciona sem conexão à internet?",
    answer:
      "Depende do caso. Para áreas com conectividade limitada, desenvolvemos versões com modo offline que sincronizam quando recuperam o sinal. Avaliamos isso no diagnóstico inicial de acordo com onde sua equipe opera.",
  },
  {
    question: "Pode se adaptar a diferentes tipos de entrega?",
    answer:
      "Sim. Projetamos o sistema de acordo com como sua operação funciona: entrega programada, urgente, com controle de temperatura ou com requisitos especiais de documentação ou confirmação.",
  },
  {
    question: "O que acontece se o cliente não estiver no momento da entrega?",
    answer:
      "O sistema pode registrar a tentativa, gerar uma ocorrência automática e facilitar o reagendamento de acordo com seu processo atual. Cada caso tem uma lógica própria que definimos juntos.",
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
    title: "Gestão de ordens de entrega",
    description: "Cadastro de pedidos, atribuição a motoristas e acompanhamento do status de cada entrega em um painel central.",
  },
  {
    title: "App para equipe em campo",
    description: "Ferramenta mobile para motoristas e operadores registrarem atividade, confirmações e ocorrências pelo celular.",
  },
  {
    title: "Confirmação de entrega",
    description: "Assinatura digital, foto ou código para registrar a entrega e gerar o comprovante automaticamente.",
  },
  {
    title: "Acompanhamento em tempo real",
    description: "A equipe do escritório vê o status de cada entrega sem precisar de ligações ou mensagens de WhatsApp.",
  },
  {
    title: "Relatórios de desempenho",
    description: "Entregas por motorista, por região, por período e análise de atrasos ou incidentes.",
  },
  {
    title: "Integração com pedidos",
    description: "O módulo de entregas pode se conectar ao de gestão de pedidos para evitar reentrada de dados.",
  },
];

const relatedPages = [
  {
    href: "/pt-BR/automacao-de-processos",
    label: "Automação de processos",
    description: "Substituímos tarefas manuais e processos repetitivos por ferramentas que trabalham sozinhas.",
  },
  {
    href: "/pt-BR/sistemas-para-distribuidoras",
    label: "Sistemas para distribuidoras",
    description: "Pedidos, estoque, entregas e contas correntes em um só lugar.",
  },
];

export default function SoftwareParaLogisticaPtBRPage() {
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
              Software para operações de logística e entregas.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Gerenciar rotas, confirmar entregas e coordenar motoristas por WhatsApp gera erros e
              perda de informação. Construímos ferramentas que se adaptam à sua operação, não o
              contrário.
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
              O que desenvolvemos para logística.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Analisamos sua operação atual antes de propor uma solução. O objetivo é substituir o
              que gera fricções, não todo o processo.
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
              Como você coordena suas entregas hoje?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte como sua operação funciona. Avaliamos se faz sentido construir uma ferramenta
              sob medida e por onde começar.
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
