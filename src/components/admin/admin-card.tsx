export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-admin-border bg-admin-surface p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        {title}
      </h2>
      {children}
    </AdminCard>
  );
}
