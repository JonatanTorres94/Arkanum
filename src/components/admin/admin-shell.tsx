import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export function AdminShell({
  children,
  attentionCount = 0,
}: {
  children: React.ReactNode;
  attentionCount?: number;
}) {
  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text">
      <AdminSidebar attentionCount={attentionCount} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
