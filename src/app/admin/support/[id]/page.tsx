import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { TicketPriorityBadge, TicketCategoryBadge } from "@/components/admin/support-ticket-badges";
import { SupportTicketStatusForm } from "@/components/admin/support-ticket-status-form";
import { SupportTicketEscalationPanel } from "@/components/admin/support-ticket-escalation-panel";
import type { TicketSource } from "@/features/support/domain/support-ticket.types";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Ticket — Admin", robots: { index: false, follow: false } };

const SOURCE_LABELS: Record<TicketSource, string> = {
  email:         "Email",
  whatsapp:      "WhatsApp",
  manual:        "Manual",
  client_portal: "Portal cliente",
  internal:      "Interno",
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 break-words">{value}</dd>
    </div>
  );
}

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdmin();

  const { id } = await params;

  const ticketResult = await getSupportTicketByIdUseCase(id, new SupabaseSupportTicketRepository());

  if (!ticketResult.ok) notFound();

  const { ticket } = ticketResult;

  const [clientResult, projectResult] = await Promise.all([
    getClientByIdUseCase(ticket.clientId, new SupabaseClientRepository()),
    ticket.projectId
      ? getProjectByIdUseCase(ticket.projectId, new SupabaseProjectRepository())
      : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/support"
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
              <h1 className="text-xl font-semibold text-slate-50 break-words">{ticket.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {clientResult.ok ? (
                  <Link
                    href={`/admin/clients/${clientResult.client.id}`}
                    className="text-cyan-400 transition-colors hover:text-cyan-300"
                  >
                    {clientResult.client.name}
                  </Link>
                ) : (
                  <span className="text-slate-500">Cliente no disponible</span>
                )}
                {projectResult?.ok && (
                  <>
                    <span className="text-slate-600">·</span>
                    <Link
                      href={`/admin/projects/${projectResult.project.id}`}
                      className="text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      {projectResult.project.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketCategoryBadge category={ticket.category} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-4">
            <span className="text-sm text-slate-400">Estado:</span>
            <SupportTicketStatusForm ticketId={ticket.id} currentStatus={ticket.status} />
          </div>
        </div>

        {/* Datos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Reportado por" value={ticket.reportedBy} />
            <Field label="Fuente"        value={SOURCE_LABELS[ticket.source]} />
            <Field label="Creado"        value={new Date(ticket.createdAt).toLocaleString("es-AR")} />
            <Field label="Actualizado"   value={new Date(ticket.updatedAt).toLocaleString("es-AR")} />
            {ticket.resolvedAt && (
              <Field label="Resuelto" value={new Date(ticket.resolvedAt).toLocaleString("es-AR")} />
            )}
          </dl>

          {ticket.description && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <Field label="Descripción" value={ticket.description} />
            </div>
          )}

          {ticket.notes && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <Field label="Notas internas" value={ticket.notes} />
            </div>
          )}
        </div>

        {/* Escalación a desarrollo */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Escalación a desarrollo
          </h2>
          <SupportTicketEscalationPanel
            ticketId={ticket.id}
            projectId={ticket.projectId}
            escalatedWorkItemId={ticket.escalatedWorkItemId}
            escalatedAt={ticket.escalatedAt}
            escalatedBy={ticket.escalatedBy}
          />
        </div>

      </div>
    </div>
  );
}
