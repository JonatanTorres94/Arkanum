import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { LeadStatusSelector } from "@/components/admin/lead-status-selector";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Lead — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200">{value}</dd>
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
  const repository = new SupabaseLeadRepository();
  const leads = await repository.findAll();
  const lead = leads.find((l) => l.id === id);

  if (!lead) notFound();

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
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

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">{lead.fullName}</h1>
            <p className="mt-1 text-sm text-slate-400">{lead.email}</p>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <span className="text-sm text-slate-400">Estado:</span>
          <LeadStatusSelector leadId={lead.id} currentStatus={lead.status} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Rubro"               value={lead.industry} />
            <Field label="Empresa"             value={lead.company} />
            <Field label="Rol"                 value={lead.role} />
            <Field label="WhatsApp"            value={lead.whatsapp} />
            <Field label="Tamaño de empresa"   value={lead.companySize} />
            <Field label="Urgencia"            value={lead.urgency} />
            <Field label="Presupuesto"         value={lead.budget} />
            <Field label="Horas perdidas/sem"  value={lead.weeklyHoursLost} />
            <Field label="Herramientas"        value={lead.currentTools.join(", ") || null} />
            <Field label="Fuente"              value={lead.source} />
            <Field label="Creado"              value={new Date(lead.createdAt).toLocaleString("es-AR")} />
          </dl>

          <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
            <Field label="Proceso a mejorar"   value={lead.processToImprove} />
            <Field label="Problema actual"     value={lead.currentProblem} />
            <Field label="Mensaje adicional"   value={lead.additionalMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}
