import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Automação de Processos para Empresas",
  description:
    "Automatizamos processos manuais, repetitivos ou propensos a erro. Substituímos planilhas, mensagens de WhatsApp e tarefas que podem ser sistematizadas.",
  openGraph: {
    title: "Automação de Processos para Empresas | Arkanum",
    description:
      "Automatizamos processos manuais, repetitivos ou propensos a erro. Substituímos planilhas, mensagens de WhatsApp e tarefas que podem ser sistematizadas.",
    url: `${siteConfig.url}/pt-BR/automacao-de-processos`,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/automacao-de-processos"),
    languages: getBilingualAlternates("/automatizacion-de-procesos", "/pt-BR/automacao-de-processos"),
  },
};

const faqs = [
  {
    question: "Quais processos podem ser automatizados?",
    answer:
      "Em geral, qualquer processo repetitivo baseado em regras claras: gestão de pedidos, atualização de estoque, geração de relatórios, notificações internas, registros de atividade em campo e conciliação de pagamentos são os mais comuns.",
  },
  {
    question: "Preciso trocar todos os meus sistemas para automatizar?",
    answer:
      "Não necessariamente. Em muitos casos conectamos o que você já usa com novas ferramentas para eliminar a duplicação de trabalho e reduzir erros, sem substituir tudo de uma vez.",
  },
  {
    question: "Quanto tempo leva para implementar uma automação?",
    answer:
      "Depende do processo e dos sistemas envolvidos. Uma integração pontual pode estar pronta em duas a quatro semanas. Projetos mais amplos são planejados em etapas.",
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
  { label: "Gestão de pedidos",                   description: "Do WhatsApp ou do papel para um sistema com rastreabilidade." },
  { label: "Controle de estoque",                 description: "Estoque mais claro e atualizado entre vendas, disponibilidade e registros internos." },
  { label: "Geração de relatórios",                description: "Relatórios automáticos sem horas de trabalho manual." },
  { label: "Acompanhamento de entregas",           description: "Status em tempo real de cada entrega a partir do celular." },
  { label: "Registro de atividade em campo",       description: "Visitas, tarefas e confirmações pelo app do funcionário." },
  { label: "Conciliação de pagamentos",            description: "Vendas, cobranças e saldos sincronizados sem Excel no meio do caminho." },
];

export default function AutomacaoDeProcessosPage() {
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
              className="mb-6 inline-block text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Início
            </Link>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-5xl">
              Automação de processos para empresas em crescimento.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              Se um processo se repete, demora mais do que deveria ou gera erros com frequência,
              provavelmente pode ser automatizado.
            </p>
            <Link
              href="/pt-BR/diagnostico"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Diagnosticar meu processo sem custo
            </Link>
          </div>
        </section>

        {/* Casos de uso */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-3 text-2xl font-semibold text-slate-50">
              Processos que automatizamos com frequência.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Nem toda automação é igual. Antes de propor uma solução, analisamos qual parte do
              processo gera mais fricção e onde faz sentido intervir.
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
              Quais processos da sua empresa poderiam ser automatizados?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte como vocês trabalham hoje. Analisamos seu caso e dizemos se faz sentido
              intervir e por onde começar.
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
