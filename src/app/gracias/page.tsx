import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Solicitud recibida",
  description:
    "Recibimos tu solicitud de diagnóstico para revisar si una solución a medida tiene sentido para tu proceso.",
  robots: { index: false, follow: false },
};

const nextSteps = [
  {
    n: "1",
    text: "Revisamos el proceso y el contexto que nos compartiste.",
  },
  {
    n: "2",
    text: "Identificamos si hay una oportunidad real de mejora con software a medida, una plataforma operativa, una integración o una automatización.",
  },
  {
    n: "3",
    text: "Si vemos encaje, te contactamos para profundizar el diagnóstico. Si no conviene construir algo, también te lo vamos a decir.",
  },
];

export default function GraciasPage() {
  return (
    <>
      <SiteHeader />
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
            Gracias. Recibimos tu solicitud de diagnóstico.
          </h1>

          <p className="mb-10 text-base leading-relaxed text-slate-400">
            Vamos a revisar la información que nos compartiste y evaluar qué tipo de solución
            —software a medida, plataforma operativa, integración o automatización— tiene más
            sentido para tu caso.
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
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Volver al inicio
            </Link>
            <Link
              href="/plataforma"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Ver plataformas operativas
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
