"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadSchema,
  type LeadFormData,
  INDUSTRY_OPTIONS,
  TOOL_OPTIONS,
  HOURS_LOST_OPTIONS,
  URGENCY_OPTIONS,
  BUDGET_OPTIONS,
} from "@/features/leads/domain/lead.schema";
import { submitDiagnosticAction } from "@/server/actions/diagnostic.action";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs text-red-400">
      {message}
    </p>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:outline-none focus:ring-1 ${
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-700 focus:border-cyan-400 focus:ring-cyan-400"
  }`;

const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";
const optionalHint = <span className="ml-1 font-normal text-slate-500">(opcional)</span>;
const requiredMark = <span className="ml-0.5 text-red-400">*</span>;

export function DiagnosticForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setServerError(null);
    const result = await submitDiagnosticAction(data);
    if (result?.error) setServerError(result.error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      {/* Honeypot: visually hidden, bots fill it, humans don't */}
      <input
        type="text"
        {...register("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
      />

      {/* Tus datos */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Tus datos
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Nombre y apellido{requiredMark}
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Juan García"
              autoComplete="name"
              {...register("fullName")}
              className={inputClass(!!errors.fullName)}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          <div>
            <label htmlFor="company" className={labelClass}>
              Empresa{optionalHint}
            </label>
            <input
              id="company"
              type="text"
              placeholder="Distribuidora García"
              autoComplete="organization"
              {...register("company")}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              Cargo / rol{optionalHint}
            </label>
            <input
              id="role"
              type="text"
              placeholder="Gerente de operaciones"
              autoComplete="organization-title"
              {...register("role")}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email{requiredMark}
            </label>
            <input
              id="email"
              type="email"
              placeholder="juan@empresa.com"
              autoComplete="email"
              {...register("email")}
              className={inputClass(!!errors.email)}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="whatsapp" className={labelClass}>
              WhatsApp{optionalHint}
            </label>
            <input
              id="whatsapp"
              type="tel"
              placeholder="+54 11 1234-5678"
              autoComplete="tel"
              {...register("whatsapp")}
              className={inputClass(false)}
            />
          </div>
        </div>
      </fieldset>

      {/* Tu empresa */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Tu empresa
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="industry" className={labelClass}>
              Rubro{requiredMark}
            </label>
            <select
              id="industry"
              {...register("industry")}
              className={`${inputClass(!!errors.industry)} cursor-pointer`}
            >
              <option value="">Seleccioná un rubro</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.industry?.message} />
          </div>

          <div>
            <label htmlFor="companySize" className={labelClass}>
              Personas en la empresa{optionalHint}
            </label>
            <input
              id="companySize"
              type="text"
              placeholder="ej: 15 personas"
              {...register("companySize")}
              className={inputClass(false)}
            />
          </div>
        </div>
      </fieldset>

      {/* El proceso */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          El proceso a mejorar
        </legend>

        <div>
          <label htmlFor="processToImprove" className={labelClass}>
            ¿Qué proceso querés mejorar?{requiredMark}
          </label>
          <textarea
            id="processToImprove"
            rows={3}
            placeholder="Ej: Gestión de pedidos de clientes, hoy lo hacemos por WhatsApp y planilla."
            {...register("processToImprove")}
            className={`${inputClass(!!errors.processToImprove)} resize-none`}
          />
          <FieldError message={errors.processToImprove?.message} />
        </div>

        <div>
          <p className={labelClass}>
            ¿Qué herramientas usan hoy?{optionalHint}
          </p>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {TOOL_OPTIONS.map((tool) => (
              <label
                key={tool}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-slate-600 has-[:checked]:border-cyan-400/60 has-[:checked]:bg-cyan-400/5 has-[:checked]:text-slate-100"
              >
                <input
                  type="checkbox"
                  value={tool}
                  {...register("currentTools")}
                  className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-700 accent-cyan-400"
                />
                {tool}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="currentProblem" className={labelClass}>
            ¿Qué problema les genera?{requiredMark}
          </label>
          <textarea
            id="currentProblem"
            rows={3}
            placeholder="Ej: Pedidos duplicados, clientes que reclaman por errores, tiempo perdido conciliando."
            {...register("currentProblem")}
            className={`${inputClass(!!errors.currentProblem)} resize-none`}
          />
          <FieldError message={errors.currentProblem?.message} />
        </div>
      </fieldset>

      {/* Contexto */}
      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Contexto
        </legend>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="weeklyHoursLost" className={labelClass}>
              Horas perdidas por semana{optionalHint}
            </label>
            <select
              id="weeklyHoursLost"
              {...register("weeklyHoursLost")}
              className={`${inputClass(false)} cursor-pointer`}
            >
              <option value="">Seleccioná</option>
              {HOURS_LOST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className={labelClass}>
              Urgencia{requiredMark}
            </label>
            <select
              id="urgency"
              {...register("urgency")}
              className={`${inputClass(!!errors.urgency)} cursor-pointer`}
            >
              <option value="">Seleccioná</option>
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.urgency?.message} />
          </div>

          <div>
            <label htmlFor="budget" className={labelClass}>
              Presupuesto estimado{requiredMark}
            </label>
            <select
              id="budget"
              {...register("budget")}
              className={`${inputClass(!!errors.budget)} cursor-pointer`}
            >
              <option value="">Seleccioná</option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.budget?.message} />
          </div>
        </div>
      </fieldset>

      {/* Mensaje adicional */}
      <div>
        <label htmlFor="additionalMessage" className={labelClass}>
          Mensaje adicional{optionalHint}
        </label>
        <textarea
          id="additionalMessage"
          rows={3}
          placeholder="Cualquier detalle extra que quieras agregar."
          {...register("additionalMessage")}
          className={`${inputClass(false)} resize-none`}
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {serverError}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? "Enviando…" : "Solicitar diagnóstico sin cargo"}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Sin compromiso. Si no tiene sentido construir software a medida para tu caso, también te
          lo vamos a decir.
        </p>
      </div>
    </form>
  );
}
