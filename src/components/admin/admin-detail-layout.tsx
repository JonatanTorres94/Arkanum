export function AdminDetailLayout({
  header,
  main,
  sidebar,
}: {
  header: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div>
      {header}
      <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">{main}</div>
        <div className="space-y-6">{sidebar}</div>
      </div>
    </div>
  );
}
