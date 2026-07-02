"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  leadSchema,
  type LeadFormData,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  TOOL_OPTIONS,
  HOURS_LOST_OPTIONS,
  URGENCY_OPTIONS,
  BUDGET_OPTIONS,
} from "@/features/leads/domain/lead.schema";
import {
  submitDiagnosticAction,
  type DiagnosticRedirectTarget,
} from "@/server/actions/diagnostic.action";
import {
  trackDiagnosticSubmitSuccess,
  trackDiagnosticSubmitError,
  trackBotHoneypotFilled,
} from "@/lib/analytics/track";

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
const requiredMark = <span className="ml-0.5 text-red-400">*</span>;

// Dropdown option content (INDUSTRY_OPTIONS, TOOL_OPTIONS, etc.) is reused as-is
// across locales — it's the canonical value stored in the lead and sent by email.
// Translating it is deferred to the next i18n release.
const messages = {
  es: {
    sectionYourData: "Tus datos",
    sectionYourCompany: "Tu empresa",
    sectionProcess: "El proceso operativo",
    sectionContext: "Contexto",
    fullName: "Nombre y apellido",
    fullNamePlaceholder: "Juan García",
    company: "Empresa",
    companyPlaceholder: "Distribuidora García",
    role: "Cargo / rol",
    rolePlaceholder: "Gerente de operaciones",
    email: "Email",
    emailPlaceholder: "juan@empresa.com",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "+54 11 1234-5678",
    whatsappHint:
      "Solo te contactamos por WhatsApp si lo mencionás en tu mensaje. No enviamos mensajes sin aviso previo.",
    industry: "Rubro",
    industryPlaceholder: "Seleccioná un rubro",
    companySize: "Personas en la empresa",
    companySizePlaceholder: "Seleccioná una opción",
    processToImprove: "¿Qué proceso querés ordenar, automatizar o integrar?",
    processToImprovePlaceholder:
      "Ej: Gestión de pedidos por WhatsApp y planilla. Integrar el sistema de stock con el de ventas. Automatizar reportes que se hacen a mano. Crear un panel para el equipo de campo.",
    toolsLabel: "¿Qué herramientas usan hoy?",
    currentProblem: "¿Qué problema les genera?",
    currentProblemPlaceholder:
      "Ej: Pedidos duplicados, clientes que reclaman por errores, tiempo perdido conciliando.",
    weeklyHoursLost: "Horas perdidas por semana",
    selectPlaceholder: "Seleccioná",
    urgency: "Urgencia",
    budget: "Presupuesto estimado",
    additionalMessage: "Mensaje adicional",
    additionalMessagePlaceholder: "Cualquier detalle extra que quieras agregar.",
    optional: "(opcional)",
    submitIdle: "Solicitar diagnóstico sin cargo",
    submitLoading: "Enviando…",
    submitHint:
      "Sin compromiso. Evaluamos si software a medida, una plataforma operativa, una integración o una automatización es lo que mejor resuelve tu proceso. Si no conviene construir algo, también te lo vamos a decir.",
    errors: {
      fullName: "Ingresá tu nombre completo",
      email: "Ingresá un email válido",
      industry: "Seleccioná un rubro",
      companySize: "Seleccioná el tamaño de tu empresa",
      processToImprove: "Describí el proceso (mínimo 10 caracteres)",
      currentProblem: "Describí el problema (mínimo 10 caracteres)",
      urgency: "Seleccioná una opción",
      budget: "Seleccioná una opción",
      currentTools: "Hubo un problema con esta selección. Probá tildar o destildar una opción.",
    },
  },
  "pt-BR": {
    sectionYourData: "Seus dados",
    sectionYourCompany: "Sua empresa",
    sectionProcess: "O processo operativo",
    sectionContext: "Contexto",
    fullName: "Nome completo",
    fullNamePlaceholder: "João Silva",
    company: "Empresa",
    companyPlaceholder: "Distribuidora Silva",
    role: "Cargo / função",
    rolePlaceholder: "Gerente de operações",
    email: "Email",
    emailPlaceholder: "joao@empresa.com",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "+55 11 91234-5678",
    whatsappHint:
      "Só te contatamos por WhatsApp se você mencionar isso na sua mensagem. Não enviamos mensagens sem aviso prévio.",
    industry: "Setor",
    industryPlaceholder: "Selecione um setor",
    companySize: "Pessoas na empresa",
    companySizePlaceholder: "Selecione uma opção",
    processToImprove: "Qual processo você quer organizar, automatizar ou integrar?",
    processToImprovePlaceholder:
      "Ex: Gestão de pedidos por WhatsApp e planilha. Integrar o sistema de estoque com o de vendas. Automatizar relatórios feitos manualmente. Criar um painel para a equipe em campo.",
    toolsLabel: "Quais ferramentas vocês usam hoje?",
    currentProblem: "Que problema isso gera?",
    currentProblemPlaceholder:
      "Ex: Pedidos duplicados, clientes reclamando de erros, tempo perdido conciliando.",
    weeklyHoursLost: "Horas perdidas por semana",
    selectPlaceholder: "Selecione",
    urgency: "Urgência",
    budget: "Orçamento estimado",
    additionalMessage: "Mensagem adicional",
    additionalMessagePlaceholder: "Qualquer detalhe extra que queira adicionar.",
    optional: "(opcional)",
    submitIdle: "Solicitar diagnóstico sem custo",
    submitLoading: "Enviando…",
    submitHint:
      "Sem compromisso. Avaliamos se software sob medida, uma plataforma operacional, uma integração ou uma automação é o que melhor resolve o seu processo. Se não fizer sentido construir algo, também te dizemos.",
    errors: {
      fullName: "Informe seu nome completo",
      email: "Informe um email válido",
      industry: "Selecione um setor",
      companySize: "Selecione o tamanho da sua empresa",
      processToImprove: "Descreva o processo (mínimo de 10 caracteres)",
      currentProblem: "Descreva o problema (mínimo de 10 caracteres)",
      urgency: "Selecione uma opção",
      budget: "Selecione uma opção",
      currentTools: "Houve um problema com esta seleção. Tente marcar ou desmarcar uma opção.",
    },
  },
} as const;

interface DiagnosticFormProps {
  locale?: "es" | "pt-BR";
  redirectTo?: DiagnosticRedirectTarget;
}

export function DiagnosticForm({ locale = "es", redirectTo = "/gracias" }: DiagnosticFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const t = messages[locale];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    // Without this, react-hook-form tracks an unchecked checkbox group as
    // `false` instead of `[]`, which fails the array schema silently —
    // there's no visible FieldError for this field, so submit just does
    // nothing if nobody checks at least one tool.
    defaultValues: { currentTools: [] },
  });

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setValue("landingPath", window.location.pathname + window.location.search);
    if (document.referrer) setValue("referrer", document.referrer);
    const utm = (key: string) => search.get(key) ?? undefined;
    if (utm("utm_source"))   setValue("utmSource",   utm("utm_source"));
    if (utm("utm_medium"))   setValue("utmMedium",   utm("utm_medium"));
    if (utm("utm_campaign")) setValue("utmCampaign", utm("utm_campaign"));
    if (utm("utm_content"))  setValue("utmContent",  utm("utm_content"));
    if (utm("utm_term"))     setValue("utmTerm",     utm("utm_term"));
  }, [setValue]);

  const onSubmit = async (data: LeadFormData) => {
    setServerError(null);
    if (data.website) {
      trackBotHoneypotFilled();
      return;
    }
    const result = await submitDiagnosticAction(data, redirectTo);
    if (result?.error) {
      setServerError(result.error);
      trackDiagnosticSubmitError(locale);
    } else {
      trackDiagnosticSubmitSuccess(locale);
    }
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

      {/* Attribution: populated by useEffect on mount, never shown to user */}
      <input type="hidden" {...register("landingPath")} />
      <input type="hidden" {...register("referrer")} />
      <input type="hidden" {...register("utmSource")} />
      <input type="hidden" {...register("utmMedium")} />
      <input type="hidden" {...register("utmCampaign")} />
      <input type="hidden" {...register("utmContent")} />
      <input type="hidden" {...register("utmTerm")} />

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          {t.sectionYourData}
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              {t.fullName}
              {requiredMark}
            </label>
            <input
              id="fullName"
              type="text"
              placeholder={t.fullNamePlaceholder}
              autoComplete="name"
              {...register("fullName")}
              className={inputClass(!!errors.fullName)}
            />
            <FieldError message={errors.fullName ? t.errors.fullName : undefined} />
          </div>

          <div>
            <label htmlFor="company" className={labelClass}>
              {t.company}
              <span className="ml-1 font-normal text-slate-500">{t.optional}</span>
            </label>
            <input
              id="company"
              type="text"
              placeholder={t.companyPlaceholder}
              autoComplete="organization"
              {...register("company")}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClass}>
              {t.role}
              <span className="ml-1 font-normal text-slate-500">{t.optional}</span>
            </label>
            <input
              id="role"
              type="text"
              placeholder={t.rolePlaceholder}
              autoComplete="organization-title"
              {...register("role")}
              className={inputClass(false)}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              {t.email}
              {requiredMark}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              {...register("email")}
              className={inputClass(!!errors.email)}
            />
            <FieldError message={errors.email ? t.errors.email : undefined} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="whatsapp" className={labelClass}>
              {t.whatsapp}
              <span className="ml-1 font-normal text-slate-500">{t.optional}</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              placeholder={t.whatsappPlaceholder}
              autoComplete="tel"
              {...register("whatsapp")}
              className={inputClass(false)}
            />
            <p className="mt-1.5 text-xs text-slate-500">{t.whatsappHint}</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          {t.sectionYourCompany}
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="industry" className={labelClass}>
              {t.industry}
              {requiredMark}
            </label>
            <select
              id="industry"
              {...register("industry")}
              className={`${inputClass(!!errors.industry)} cursor-pointer`}
            >
              <option value="">{t.industryPlaceholder}</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.industry ? t.errors.industry : undefined} />
          </div>

          <div>
            <label htmlFor="companySize" className={labelClass}>
              {t.companySize}
              {requiredMark}
            </label>
            <select
              id="companySize"
              {...register("companySize")}
              className={`${inputClass(!!errors.companySize)} cursor-pointer`}
            >
              <option value="">{t.companySizePlaceholder}</option>
              {COMPANY_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.companySize ? t.errors.companySize : undefined} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          {t.sectionProcess}
        </legend>

        <div>
          <label htmlFor="processToImprove" className={labelClass}>
            {t.processToImprove}
            {requiredMark}
          </label>
          <textarea
            id="processToImprove"
            rows={3}
            placeholder={t.processToImprovePlaceholder}
            {...register("processToImprove")}
            className={`${inputClass(!!errors.processToImprove)} resize-none`}
          />
          <FieldError
            message={errors.processToImprove ? t.errors.processToImprove : undefined}
          />
        </div>

        <div>
          <p className={labelClass}>{t.toolsLabel}</p>
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
          <FieldError message={errors.currentTools ? t.errors.currentTools : undefined} />
        </div>

        <div>
          <label htmlFor="currentProblem" className={labelClass}>
            {t.currentProblem}
            {requiredMark}
          </label>
          <textarea
            id="currentProblem"
            rows={3}
            placeholder={t.currentProblemPlaceholder}
            {...register("currentProblem")}
            className={`${inputClass(!!errors.currentProblem)} resize-none`}
          />
          <FieldError message={errors.currentProblem ? t.errors.currentProblem : undefined} />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
          {t.sectionContext}
        </legend>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="weeklyHoursLost" className={labelClass}>
              {t.weeklyHoursLost}
              <span className="ml-1 font-normal text-slate-500">{t.optional}</span>
            </label>
            <select
              id="weeklyHoursLost"
              {...register("weeklyHoursLost")}
              className={`${inputClass(false)} cursor-pointer`}
            >
              <option value="">{t.selectPlaceholder}</option>
              {HOURS_LOST_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="urgency" className={labelClass}>
              {t.urgency}
              {requiredMark}
            </label>
            <select
              id="urgency"
              {...register("urgency")}
              className={`${inputClass(!!errors.urgency)} cursor-pointer`}
            >
              <option value="">{t.selectPlaceholder}</option>
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.urgency ? t.errors.urgency : undefined} />
          </div>

          <div>
            <label htmlFor="budget" className={labelClass}>
              {t.budget}
              {requiredMark}
            </label>
            <select
              id="budget"
              {...register("budget")}
              className={`${inputClass(!!errors.budget)} cursor-pointer`}
            >
              <option value="">{t.selectPlaceholder}</option>
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <FieldError message={errors.budget ? t.errors.budget : undefined} />
          </div>
        </div>
      </fieldset>

      <div>
        <label htmlFor="additionalMessage" className={labelClass}>
          {t.additionalMessage}
          <span className="ml-1 font-normal text-slate-500">{t.optional}</span>
        </label>
        <textarea
          id="additionalMessage"
          rows={3}
          placeholder={t.additionalMessagePlaceholder}
          {...register("additionalMessage")}
          className={`${inputClass(false)} resize-none`}
        />
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {serverError}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-cyan-400 px-8 py-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? t.submitLoading : t.submitIdle}
        </button>
        <p className="mt-3 text-xs text-slate-500">{t.submitHint}</p>
      </div>
    </form>
  );
}
