import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  title: "Solicitud recibida",
  description: "Recibimos tu solicitud de diagnóstico. Te vamos a contactar a la brevedad.",
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

          <h1 className="mb-4 text-2xl font-semibold text-slate-50">
            Gracias. Recibimos tu solicitud de diagnóstico.
          </h1>

          <p className="mb-8 text-base leading-relaxed text-slate-400">
            Vamos a revisar la información que nos compartiste para evaluar si una solución a medida
            tiene sentido para tu proceso.
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
