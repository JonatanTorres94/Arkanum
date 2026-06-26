import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AttentionInbox } from "@/components/admin/attention-inbox";
import { getAttentionItemsUseCase } from "@/features/operations/application/get-attention-items.use-case";
import { SupabaseAttentionItemRepository } from "@/features/operations/infrastructure/supabase-attention-item.repository";

export const metadata = { title: "Atención — Admin", robots: { index: false, follow: false } };

export default async function AdminAttentionPage() {
  const result = await getAttentionItemsUseCase(new SupabaseAttentionItemRepository());

  const items = result.ok ? result.items : [];
  const error = result.ok ? null : result.error;

  return (
    <div>
      <AdminPageHeader
        title="Bandeja de atención"
        count={items.length}
      />

      <div className="px-0 py-0">
        {error ? (
          <div className="px-6 py-6">
            <p className="text-sm text-admin-danger">{error}</p>
          </div>
        ) : (
          <Suspense>
            <AttentionInbox items={items} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
