import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { SupabaseNoteRepository } from "@/features/leads/infrastructure/supabase-note.repository";
import { getLeadByIdUseCase } from "@/features/leads/application/get-lead-by-id.use-case";
import { getLeadEventsUseCase } from "@/features/leads/application/get-lead-events.use-case";
import { getLeadNotesUseCase } from "@/features/leads/application/get-lead-notes.use-case";
import { SupabaseEventRepository } from "@/features/leads/infrastructure/supabase-event.repository";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { LeadStatusSelector } from "@/components/admin/lead-status-selector";
import { LeadQualifiedStageSelector } from "@/components/admin/lead-qualified-stage-selector";
import { LeadActivityFeed } from "@/components/admin/lead-activity-feed";
import { LeadNoteForm } from "@/components/admin/lead-note-form";
import { LeadDetailSection } from "@/components/admin/lead-detail-section";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Lead — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 break-words">{value}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdmin();

  const { id } = await params;

  const leadRepository = new SupabaseLeadRepository();
  const leadResult     = await getLeadByIdUseCase(id, leadRepository);

  if (!leadResult.ok) notFound();

  const { lead } = leadResult;

  const [eventsResult, notesResult] = await Promise.all([
    getLeadEventsUseCase(id, new SupabaseEventRepository()),
    getLeadNotesUseCase(id, new SupabaseNoteRepository()),
  ]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/leads"
            className="text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Volver al listado
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-slate-500 transition-colors hover:text-slate-300"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Header summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-50 break-words">{lead.fullName}</h1>
              {(lead.company || lead.role) && (
                <p className="mt-1 text-sm text-slate-400 break-words">
                  {[lead.company, lead.role].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <LeadStatusBadge status={lead.status} />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="break-words">{lead.email}</span>
            {lead.whatsapp && <span className="break-words">{lead.whatsapp}</span>}
            <span>Creado: {new Date(lead.createdAt).toLocaleString("es-AR")}</span>
          </div>
        </div>

        {/* Workflow */}
        <LeadDetailSection title="Workflow">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400">Estado:</span>
            <LeadStatusSelector leadId={lead.id} currentStatus={lead.status} />
          </div>

          {lead.status === "qualified" && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-400">Etapa:</span>
              <LeadQualifiedStageSelector leadId={lead.id} currentStage={lead.qualifiedStage} />
            </div>
          )}
        </LeadDetailSection>

        {/* Datos de contacto */}
        <LeadDetailSection title="Datos de contacto">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email"    value={lead.email} />
            <Field label="WhatsApp" value={lead.whatsapp} />
            <Field label="Rol"      value={lead.role} />
          </dl>
        </LeadDetailSection>

        {/* Empresa */}
        <LeadDetailSection title="Empresa">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Empresa"           value={lead.company} />
            <Field label="Rubro"             value={lead.industry} />
            <Field label="Tamaño de empresa" value={lead.companySize} />
          </dl>
        </LeadDetailSection>

        {/* Proceso a mejorar */}
        <LeadDetailSection title="Proceso a mejorar">
          <div className="space-y-4">
            <Field label="Proceso a mejorar"     value={lead.processToImprove} />
            <Field label="Problema actual"       value={lead.currentProblem} />
            <Field label="Herramientas actuales" value={lead.currentTools.join(", ") || null} />
          </div>
        </LeadDetailSection>

        {/* Contexto operativo */}
        <LeadDetailSection title="Contexto operativo">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Urgencia"              value={lead.urgency} />
            <Field label="Presupuesto"           value={lead.budget} />
            <Field label="Horas perdidas/sem"    value={lead.weeklyHoursLost} />
            <Field label="Fuente"                value={lead.source} />
          </dl>
          <div className="mt-4">
            <Field label="Mensaje adicional" value={lead.additionalMessage} />
          </div>
        </LeadDetailSection>

        {/* Actividad */}
        <LeadDetailSection title="Actividad">
          {eventsResult.ok ? (
            <LeadActivityFeed events={eventsResult.events} />
          ) : (
            <p className="text-sm text-red-400">{eventsResult.error}</p>
          )}
        </LeadDetailSection>

        {/* Notas internas */}
        <LeadDetailSection title="Notas internas">
          <LeadNoteForm leadId={lead.id} />

          <div className="mt-6 space-y-3">
            {!notesResult.ok ? (
              <p className="text-sm text-red-400">{notesResult.error}</p>
            ) : notesResult.notes.length === 0 ? (
              <p className="text-sm text-slate-600">Sin notas registradas todavía.</p>
            ) : (
              notesResult.notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
                >
                  <p className="whitespace-pre-wrap text-sm text-slate-200 break-words">
                    {note.content}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    {note.createdBy ?? "Administrador"}
                    {" · "}
                    {new Date(note.createdAt).toLocaleString("es-AR")}
                  </p>
                </div>
              ))
            )}
          </div>
        </LeadDetailSection>

      </div>
    </div>
  );
}
