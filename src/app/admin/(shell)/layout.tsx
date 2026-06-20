import { verifyAdmin } from "@/lib/auth/verify-admin";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdmin();

  return <AdminShell>{children}</AdminShell>;
}
