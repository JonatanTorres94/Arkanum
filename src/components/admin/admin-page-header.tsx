export function AdminPageHeader({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-6 py-5">
      <h1 className="text-xl font-semibold text-admin-text">
        {title}
        {count !== undefined && (
          <span className="ml-2 text-base font-normal text-admin-text-muted">({count})</span>
        )}
      </h1>
      {action && <div className="flex items-center gap-4">{action}</div>}
    </div>
  );
}
