import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";

export const metadata: Metadata = {
  title: "Automação para Empresas que Operam pelo WhatsApp",
  description:
    "Substituímos a gestão manual pelo WhatsApp por sistemas que capturam, registram e processam pedidos sem depender de conversas dispersas e planilhas.",
  openGraph: {
    title: "Automação para Empresas que Operam pelo WhatsApp | Arkanum",
    description:
      "Substituímos a gestão manual pelo WhatsApp por sistemas que capturam, registram e processam pedidos sem depender de conversas dispersas e planilhas.",
    url: `${siteConfig.url}/pt-BR/automacao-com-whatsapp`,
    locale: "pt_BR",
    type: "website",
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR/automacao-com-whatsapp"),
    languages: getBilingualAlternates("/automatizacion-con-whatsapp", "/pt-BR/automacao-com-whatsapp"),
  },
};

const faqs = [
  {
    question: "É preciso parar de usar o WhatsApp completamente?",
    answer:
      "Não necessariamente. Em alguns casos mantemos o WhatsApp para comunicação e construímos o sistema só para a gestão de pedidos e registro. Depende de como sua equipe opera e do que você quer organizar.",
  },
  {
    question: "Como os clientes acostumados a pedir pelo WhatsApp se adaptam?",
    answer:
      "O processo de adoção depende do perfil dos seus clientes. Alguns casos permitem manter o WhatsApp como canal de contato e capturar os pedidos no sistema pelo lado interno. Outros exigem um formulário simples que os clientes usem diretamente. Avaliamos isso no diagnóstico.",
  },
  {
    question: "Quanto tempo leva para implementar algo assim?",
    answer:
      "Um módulo de captura de pedidos e painel de gestão básico pode estar pronto em 4 a 8 semanas. Começamos pelo fluxo principal e adicionamos funcionalidades em etapas de acordo com o que a operação real mostra.",
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
    title: "Captura de pedidos por formulário",
    description: "Em vez de receber pedidos por chat, os clientes os registram em uma interface clara que gera registros automáticos.",
  },
  {
    title: "Painel de gestão para a equipe",
    description: "A equipe vê os pedidos em andamento, os status e as ocorrências sem revisar conversas de WhatsApp.",
  },
  {
    title: "Notificações automáticas",
    description: "O cliente recebe confirmação, atualizações de status e comprovante sem intervenção manual da equipe.",
  },
  {
    title: "Histórico e rastreabilidade",
    description: "Cada pedido, interação e status fica registrado e pode ser recuperado. Sem buscas em chats ou arquivos anexados.",
  },
  {
    title: "Integração com estoque",
    description: "Quando um pedido é confirmado, o sistema pode baixar o inventário e alertar sobre faltas.",
  },
  {
    title: "Acesso diferenciado por perfil",
    description: "O vendedor vê seus pedidos, o depósito vê a preparação, a administração vê o consolidado.",
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
    description: "Pedidos, estoque e entregas integrados para empresas atacadistas.",
  },
];

export default function AutomacaoComWhatsappPage() {
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
              Sistemas para empresas que gerenciam tudo pelo WhatsApp.
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-400">
              O WhatsApp funciona para se comunicar, não para gerenciar uma operação. Quando
              pedidos, confirmações e ocorrências se misturam em conversas, algo sempre se perde.
              Construímos sistemas que organizam o processo sem pedir que seus clientes ou
              funcionários mudem demais.
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
              O que substituímos ou organizamos.
            </h2>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-400">
              Não propomos abandonar o WhatsApp de uma vez. Identificamos qual parte do processo
              gera mais problemas e começamos por aí.
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
              Quanto da sua operação passa pelo WhatsApp hoje?
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte como o processo funciona. Avaliamos o que faz sentido digitalizar e por onde
              começar.
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
