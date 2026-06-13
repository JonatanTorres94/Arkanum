import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Diagnóstico enviado",
  description: "Gracias por completar el formulario de diagnóstico de Arkanum.",
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="max-w-lg text-center">
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

          <h1 className="mb-4 text-2xl font-semibold text-slate-50">Gracias.</h1>

          <p className="mb-2 text-base leading-relaxed text-slate-300">
            Tu diagnóstico quedó validado en esta versión del flujo.
          </p>

          <p className="mb-8 text-sm leading-relaxed text-slate-400">
            Estamos preparando la conexión final para registrar solicitudes reales. Mientras tanto,
            podés volver al inicio o contactarnos por el canal que indiquemos públicamente.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
