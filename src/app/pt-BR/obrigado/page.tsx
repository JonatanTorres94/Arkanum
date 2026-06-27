import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Solicitação recebida",
  description:
    "Recebemos sua solicitação de diagnóstico para avaliar se uma solução sob medida faz sentido para o seu processo.",
  robots: { index: false, follow: false },
};

const nextSteps = [
  {
    n: "1",
    text: "Revisamos o processo e o contexto que você compartilhou.",
  },
  {
    n: "2",
    text: "Identificamos se há uma oportunidade real de melhoria com software sob medida, uma plataforma operacional, uma integração ou uma automação.",
  },
  {
    n: "3",
    text: "Se vemos encaixe, entramos em contato para aprofundar o diagnóstico. Se não fizer sentido construir algo, também te dizemos.",
  },
];

export default function ObrigadoPage() {
  return (
    <>
      <SiteHeader locale="pt-BR" />
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-cyan-400"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="mb-4 text-2xl font-semibold text-slate-50">
            Obrigado. Recebemos sua solicitação de diagnóstico.
          </h1>

          <p className="mb-10 text-base leading-relaxed text-slate-400">
            Vamos analisar as informações que você compartilhou e avaliar qual tipo de solução
            —software sob medida, plataforma operacional, integração ou automação— faz mais
            sentido para o seu caso.
          </p>

          <div className="mb-10 space-y-3 text-left">
            {nextSteps.map(({ n, text }) => (
              <div
                key={n}
                className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-mono text-xs font-semibold text-cyan-400">
                  {n}
                </span>
                <p className="text-sm leading-relaxed text-slate-400">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/pt-BR"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Voltar ao início
            </Link>
            <Link
              href="/pt-BR#solucoes"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Ver soluções
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter locale="pt-BR" />
    </>
  );
}
