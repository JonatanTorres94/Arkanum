import { verifyAdmin } from "@/lib/auth/verify-admin";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAttentionItemCountUseCase } from "@/features/operations/application/get-attention-items.use-case";
import { SupabaseAttentionItemRepository } from "@/features/operations/infrastructure/supabase-attention-item.repository";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdmin();

  const attentionCount = await getAttentionItemCountUseCase(
    new SupabaseAttentionItemRepository()
  );

  return <AdminShell attentionCount={attentionCount}>{children}</AdminShell>;
}
