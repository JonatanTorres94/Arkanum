export function AdminEmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface/40 px-6 py-14 text-center">
      <p className="text-sm text-admin-text-muted">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
