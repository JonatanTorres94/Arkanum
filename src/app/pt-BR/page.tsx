import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getBilingualAlternates, getCanonicalUrl } from "@/lib/seo/canonical";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    absolute: "Arkanum — Software sob Medida e Automação para Empresas",
  },
  description:
    "Desenvolvemos sistemas web, apps mobile e integrações sob medida para substituir planilhas, automatizar processos e organizar a operação da sua empresa.",
  openGraph: {
    title: "Arkanum — Software sob Medida e Automação para Empresas",
    description:
      "Desenvolvemos sistemas web, apps mobile e integrações sob medida para substituir planilhas, automatizar processos e organizar a operação da sua empresa.",
    url: `${siteConfig.url}/pt-BR`,
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: getCanonicalUrl("/pt-BR"),
    languages: getBilingualAlternates("/", "/pt-BR"),
  },
};

const services = [
  {
    href:        "/pt-BR/software-sob-medida",
    label:       "Software sob medida",
    description: "Sistemas web, apps mobile e integrações construídas para a sua operação real.",
  },
  {
    href:        "/pt-BR/diagnostico",
    label:       "Automação de processos",
    description:
      "Substituímos planilhas, tarefas manuais e processos repetitivos por ferramentas que trabalham sozinhas.",
  },
];

export default function PtBRHomePage() {
  return (
    <>
      <SiteHeader locale="pt-BR" />
      <main>

        {/* Hero */}
        <section className="px-6 pb-24 pt-20 md:pt-32">
          <div className="mx-auto max-w-4xl">
            <p className="mb-6 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
              Automação operacional e software sob medida
            </p>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
              Automatizamos e modernizamos processos da sua empresa.
            </h1>
            <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-400">
              Criamos sistemas web, apps mobile e integrações sob medida para substituir planilhas,
              tarefas repetitivas, sistemas desconectados e processos lentos.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/pt-BR/diagnostico"
                className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
              >
                Diagnosticar meu processo sem custo
              </Link>
            </div>
            <p className="mt-6 text-xs text-slate-500">
              Primeiro entendemos sua operação. Depois definimos se uma solução sob medida faz sentido.
            </p>
          </div>
        </section>

        {/* Serviços */}
        <section id="solucoes" className="border-t border-slate-800 bg-slate-950 px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-50">Nossas áreas de atuação.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-6 transition-colors hover:border-slate-700"
                >
                  <h3 className="text-sm font-semibold text-slate-100 transition-colors group-hover:text-cyan-400">
                    {service.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{service.description}</p>
                  <span className="text-xs text-slate-600 transition-colors group-hover:text-slate-400">
                    Ver mais →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="border-t border-slate-800 bg-slate-900/40 px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold leading-snug text-slate-50 md:text-3xl">
              Solicite um diagnóstico inicial sem custo.
            </h2>
            <p className="mb-8 text-base leading-relaxed text-slate-400">
              Conte o que você quer melhorar. Analisamos seu caso e indicamos se uma solução digital
              sob medida pode ajudar a reduzir carga manual, organizar informações ou conectar
              sistemas.
            </p>
            <Link
              href="/pt-BR/diagnostico"
              className="inline-flex items-center justify-center rounded-lg bg-cyan-400 px-10 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300"
            >
              Diagnosticar meu processo sem custo
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              Sem compromisso. Se não fizer sentido desenvolver software sob medida para o seu caso,
              também te dizemos.
            </p>
          </div>
        </section>

      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
