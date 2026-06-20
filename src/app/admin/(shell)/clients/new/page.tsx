import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { ClientCreateForm } from "@/components/admin/client-create-form";

export const metadata = { title: "Nuevo cliente — Admin", robots: { index: false, follow: false } };

export default async function AdminClientNewPage() {
  await verifyAdmin();

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/clients"
          className="mb-8 inline-block text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          ← Volver al listado
        </Link>

        <h1 className="mb-6 text-xl font-semibold text-slate-50">Crear cliente</h1>

        <ClientCreateForm />
      </div>
    </div>
  );
}
