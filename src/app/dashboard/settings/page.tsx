import { getOrg } from "@/lib/courier-store";

export default function Page() {
  const org = getOrg("quickfynd");
  return (
    <div className="max-w-lg space-y-4">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Company Settings
      </h2>
      {!org ? (
        <p className="text-sm text-muted">
          No organization yet. Super Admin will create your company in Supabase.
        </p>
      ) : (
        <dl className="space-y-3 border border-line bg-paper p-5 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">{org.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd>{org.contactEmail}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd>{org.contactPhone}</dd>
          </div>
          <div>
            <dt className="text-muted">GSTIN</dt>
            <dd className="font-mono">{org.gstin}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
