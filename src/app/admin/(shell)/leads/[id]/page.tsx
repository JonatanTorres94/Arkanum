import Link from "next/link";
import { notFound } from "next/navigation";
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
import { LeadFollowUpForm } from "@/components/admin/lead-follow-up-form";
import { LeadIntentFieldsForm } from "@/components/admin/lead-intent-fields-form";
import { LeadConversionPanel } from "@/components/admin/lead-conversion-panel";
import { LeadNoteForm } from "@/components/admin/lead-note-form";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";

export const metadata = { title: "Lead — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const leadRepository = new SupabaseLeadRepository();
  const leadResult     = await getLeadByIdUseCase(id, leadRepository);

  if (!leadResult.ok) notFound();

  const { lead } = leadResult;

  const eligibleForConversion =
    !lead.convertedToClient &&
    lead.status === "qualified" &&
    (lead.qualifiedStage === "accepted" || lead.qualifiedStage === "project_started");

  const [eventsResult, notesResult] = await Promise.all([
    getLeadEventsUseCase(id, new SupabaseEventRepository()),
    getLeadNotesUseCase(id, new SupabaseNoteRepository()),
  ]);

  return (
    <AdminDetailLayout
      header={
        <div className="border-b border-admin-border px-6 py-5">
          <Link
            href="/admin/leads"
            className="mb-3 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
          >
            ← Volver al listado
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-admin-text break-words">{lead.fullName}</h1>
              {(lead.company || lead.role) && (
                <p className="mt-1 text-sm text-admin-text-muted break-words">
                  {[lead.company, lead.role].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <LeadStatusBadge status={lead.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-text-faint">
            <span className="break-words">{lead.email}</span>
            {lead.whatsapp && <span className="break-words">{lead.whatsapp}</span>}
            <span>Creado: {new Date(lead.createdAt).toLocaleString("es-AR")}</span>
          </div>
        </div>
      }
      main={
        <>
          {/* Proceso a mejorar */}
          <AdminSection title="Proceso a mejorar">
            <div className="space-y-4">
              <Field label="Proceso a mejorar"     value={lead.processToImprove} />
              <Field label="Problema actual"       value={lead.currentProblem} />
              <Field label="Herramientas actuales" value={lead.currentTools.join(", ") || null} />
            </div>
          </AdminSection>

          {/* Datos de contacto */}
          <AdminSection title="Datos de contacto">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email"    value={lead.email} />
              <Field label="WhatsApp" value={lead.whatsapp} />
              <Field label="Rol"      value={lead.role} />
            </dl>
          </AdminSection>

          {/* Empresa */}
          <AdminSection title="Empresa">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Empresa"           value={lead.company} />
              <Field label="Rubro"             value={lead.industry} />
              <Field label="Tamaño de empresa" value={lead.companySize} />
            </dl>
          </AdminSection>

          {/* Contexto operativo */}
          <AdminSection title="Contexto operativo">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Urgencia"              value={lead.urgency} />
              <Field label="Presupuesto"           value={lead.budget} />
              <Field label="Horas perdidas/sem"    value={lead.weeklyHoursLost} />
              <Field label="Fuente"                value={lead.source} />
            </dl>
            <div className="mt-4">
              <Field label="Mensaje adicional" value={lead.additionalMessage} />
            </div>
          </AdminSection>

          {/* Actividad */}
          <AdminSection title="Actividad">
            {eventsResult.ok ? (
              <LeadActivityFeed events={eventsResult.events} />
            ) : (
              <p className="text-sm text-admin-danger">{eventsResult.error}</p>
            )}
          </AdminSection>

          {/* Notas internas */}
          <AdminSection title="Notas internas">
            <LeadNoteForm leadId={lead.id} />

            <div className="mt-6 space-y-3">
              {!notesResult.ok ? (
                <p className="text-sm text-admin-danger">{notesResult.error}</p>
              ) : notesResult.notes.length === 0 ? (
                <p className="text-sm text-admin-text-faint">Sin notas registradas todavía.</p>
              ) : (
                notesResult.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                  >
                    <p className="whitespace-pre-wrap text-sm text-admin-text break-words">
                      {note.content}
                    </p>
                    <p className="mt-2 text-xs text-admin-text-faint">
                      {note.createdBy ?? "Administrador"}
                      {" · "}
                      {new Date(note.createdAt).toLocaleString("es-AR")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </AdminSection>
        </>
      }
      sidebar={
        <>
          {/* Workflow */}
          <AdminSection title="Workflow">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-admin-text-muted">Estado:</span>
              <LeadStatusSelector leadId={lead.id} currentStatus={lead.status} />
            </div>

            {lead.status === "qualified" && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-admin-text-muted">Etapa:</span>
                <LeadQualifiedStageSelector leadId={lead.id} currentStage={lead.qualifiedStage} />
              </div>
            )}
          </AdminSection>

          {/* Conversión a cliente */}
          {(eligibleForConversion || lead.convertedToClient) && (
            <AdminSection title="Conversión a cliente">
              <LeadConversionPanel
                leadId={lead.id}
                eligible={eligibleForConversion}
                convertedToClient={lead.convertedToClient}
                convertedClientId={lead.convertedClientId}
                convertedProjectId={lead.convertedProjectId}
                convertedAt={lead.convertedAt}
                convertedBy={lead.convertedBy}
              />
            </AdminSection>
          )}

          {/* Seguimiento */}
          <AdminSection title="Seguimiento">
            <LeadFollowUpForm
              leadId={lead.id}
              nextAction={lead.nextAction}
              followUpDate={lead.followUpDate}
            />
          </AdminSection>

          {/* Editar intención */}
          <AdminSection title="Editar intención">
            <LeadIntentFieldsForm
              leadId={lead.id}
              industry={lead.industry}
              companySize={lead.companySize}
              urgency={lead.urgency}
              budget={lead.budget}
            />
          </AdminSection>
        </>
      }
    />
  );
}
