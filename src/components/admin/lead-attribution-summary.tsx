import type { Lead } from "@/features/leads/domain/lead.types";

export function LeadAttributionSummary({ leads }: { leads: Lead[] }) {
  const withUtm      = leads.filter((l) => l.utmSource || l.utmMedium || l.utmCampaign).length;
  const withReferrer = leads.filter((l) => l.referrer).length;

  const pathCounts = new Map<string, number>();
  for (const lead of leads) {
    if (!lead.landingPath) continue;
    pathCounts.set(lead.landingPath, (pathCounts.get(lead.landingPath) ?? 0) + 1);
  }
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (withUtm === 0 && withReferrer === 0 && topPaths.length === 0) return null;

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface px-4 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-admin-text-muted">
        Atribución
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-admin-text-faint">Con UTM</p>
            <p className="mt-0.5 text-2xl font-semibold text-admin-accent">{withUtm}</p>
          </div>
          <div>
            <p className="text-xs text-admin-text-faint">Con referrer</p>
            <p className="mt-0.5 text-2xl font-semibold text-admin-accent">{withReferrer}</p>
          </div>
        </div>

        {topPaths.length > 0 && (
          <div className="sm:col-span-2">
            <p className="mb-2 text-xs text-admin-text-faint">Top landings</p>
            <ul className="space-y-1.5">
              {topPaths.map(([path, count]) => (
                <li key={path} className="flex items-center justify-between gap-3">
                  <span className="truncate text-xs text-admin-text-secondary">{path}</span>
                  <span className="shrink-0 text-xs font-semibold text-admin-text">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
