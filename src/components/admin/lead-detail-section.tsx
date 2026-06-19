export function LeadDetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </h2>
      {children}
    </section>
  );
}
