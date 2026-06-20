import Link from "next/link";
import { ClientCreateForm } from "@/components/admin/client-create-form";

export const metadata = { title: "Nuevo cliente — Admin", robots: { index: false, follow: false } };

export default function AdminClientNewPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/admin/clients"
        className="mb-8 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
      >
        ← Volver al listado
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-admin-text">Crear cliente</h1>

      <ClientCreateForm />
    </div>
  );
}
