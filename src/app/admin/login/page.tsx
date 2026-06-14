"use client";

import { useActionState } from "react";
import { signInAction } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(signInAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-xl font-semibold text-slate-50">
          Panel interno
        </h1>

        <form action={action} className="space-y-4">
          {state?.error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </p>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm text-slate-400">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
